#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Golden AMI Preparation & Generalization Script
# Run this script on a base Ubuntu 22.04/24.04 EC2 instance before capturing an AMI.
# It pre-installs all runtime packages, pre-builds Docker images, and sanitizes the OS.
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

if [ "$EUID" -ne 0 ]; then
  echo "Error: This script must be run as root (use sudo ./setup-instance.sh)"
  exit 1
fi

echo "===================================================================="
echo "    MindVisionTech Golden AMI Preparation Script                   "
echo "===================================================================="

# 1. SWAP FILE (2GB)
echo "[1/8] Setting up 2GB swap file..."
if ! grep -q '/swapfile' /proc/swaps; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    sysctl vm.vfs_cache_pressure=50
    cat << 'EOF' > /etc/sysctl.d/99-memory-tuning.conf
vm.swappiness = 10
vm.vfs_cache_pressure = 50
EOF
fi

# 2. PACKAGES & PREREQUISITES
echo "[2/8] Installing base packages and security utilities..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y --no-install-recommends \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    jq \
    unzip \
    htop \
    nginx \
    certbot \
    python3-certbot-nginx \
    openssl

# 3. AWS CLI V2
echo "[3/8] Installing AWS CLI v2..."
if ! command -v aws &> /dev/null; then
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
    unzip -q /tmp/awscliv2.zip -d /tmp
    /tmp/aws/install
    rm -rf /tmp/aws /tmp/awscliv2.zip
fi

# 4. DOCKER ENGINE & DOCKER COMPOSE V2
echo "[4/8] Installing Docker Engine & Compose plugin..."
if ! command -v docker &> /dev/null; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu || true

    # Provide docker-compose symlink
    echo '#!/bin/sh' > /usr/local/bin/docker-compose
    echo 'exec docker compose "$@"' >> /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 5. CODEBASE SETUP & PRE-BUILD DOCKER IMAGES (Saves ~5 minutes on ASG scale-out)
echo "[5/8] Pre-baking application code & Docker images..."
APP_DIR="/opt/mindvisiontech"
mkdir -p "${APP_DIR}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PARENT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# If running from inside an existing checkout, copy or sync it to /opt/mindvisiontech
if [ -f "${PARENT_DIR}/docker-compose.prod.yml" ] && [ "${PARENT_DIR}" != "${APP_DIR}" ]; then
    echo "Copying local repository from ${PARENT_DIR} to ${APP_DIR}..."
    cp -r "${PARENT_DIR}/." "${APP_DIR}/"
elif [ ! -d "${APP_DIR}/.git" ]; then
    REPO_URL="https://github.com/vasanthakumarj2004/mindvisiontech.git"
    echo "Cloning repository from ${REPO_URL}..."
    git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"

# Pull base images & pre-build API image
docker pull mongo:7.0
docker build -t mindvisiontech-api:latest -f server/Dockerfile server/

# 6. CONFIGURE NGINX BASELINE & PLACEHOLDER SSL
echo "[6/8] Configuring NGINX baseline and SSL bootstrap..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot 2>/dev/null || true

CERT_DIR="/etc/letsencrypt/live/api.mindvisiontech.com"
if [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
    echo "Creating temporary self-signed SSL certificates for NGINX bootstrap..."
    mkdir -p "${CERT_DIR}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "${CERT_DIR}/privkey.pem" \
        -out "${CERT_DIR}/fullchain.pem" \
        -subj "/CN=api.mindvisiontech.com"
    chmod 600 "${CERT_DIR}/privkey.pem"
fi

if [ -f "${APP_DIR}/deploy/aws/nginx.conf" ]; then
    cp "${APP_DIR}/deploy/aws/nginx.conf" /etc/nginx/sites-available/mindvisiontech
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/mindvisiontech /etc/nginx/sites-enabled/
    nginx -t
    systemctl enable nginx
fi

# 7. CREATE AUTO-START BOOTSTRAP RUNNER & SYSTEMD SERVICE
echo "[7/8] Creating MindVisionTech systemd startup service..."
cat << 'EOF' > /usr/local/bin/mindvisiontech-start.sh
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/opt/mindvisiontech"
ENV_FILE="${APP_DIR}/.env.production"

# Auto-detect AWS Region
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || echo "ap-south-1")

# Fetch SSM parameters if available and not yet set
if [ ! -s "${ENV_FILE}" ] && aws ssm get-parameters-by-path --path "/mindvisiontech/prod" --region "${AWS_REGION}" &>/dev/null; then
    > "${ENV_FILE}"
    aws ssm get-parameters-by-path \
        --path "/mindvisiontech/prod" \
        --with-decryption \
        --region "${AWS_REGION}" \
        --query "Parameters[*].[Name,Value]" \
        --output text | while read -r name value; do
            key=$(basename "$name")
            echo "${key}=${value}" >> "${ENV_FILE}"
    done
    chmod 600 "${ENV_FILE}"
fi

# Fallback environment if still missing
if [ ! -s "${ENV_FILE}" ]; then
    RANDOM_MONGO_PASS=$(openssl rand -hex 24)
    RANDOM_JWT_SECRET=$(openssl rand -hex 32)
    RANDOM_ADMIN_KEY=$(openssl rand -hex 32)
    cat << ENV_EOF > "${ENV_FILE}"
NODE_ENV=production
PORT=5000
CLIENT_URL=https://mindvisiontech.com
CORS_ORIGINS=https://mindvisiontech.com,https://www.mindvisiontech.com
MONGO_ROOT_USERNAME=mindvision_admin
MONGO_ROOT_PASSWORD=${RANDOM_MONGO_PASS}
JWT_SECRET=${RANDOM_JWT_SECRET}
ADMIN_API_KEY=${RANDOM_ADMIN_KEY}
ENV_EOF
    chmod 600 "${ENV_FILE}"
fi

cd "${APP_DIR}"
if grep -q "mongodb+srv://" "${ENV_FILE}" 2>/dev/null; then
    COMPOSE_FILE="docker-compose.asg.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d
EOF

chmod +x /usr/local/bin/mindvisiontech-start.sh

cat << 'EOF' > /etc/systemd/system/mindvisiontech.service
[Unit]
Description=MindVisionTech Docker Stack
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
ExecStart=/usr/local/bin/mindvisiontech-start.sh
ExecStop=/usr/bin/docker compose -f /opt/mindvisiontech/docker-compose.prod.yml down
TimeoutStartSec=180

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable mindvisiontech.service

# 8. GENERALIZATION & CLEANUP (Sysprep for Golden AMI)
echo "[8/8] Generalizing instance for Golden AMI snapshot..."
# Stop containers and remove temporary state
docker compose -f "${APP_DIR}/docker-compose.prod.yml" down 2>/dev/null || true
rm -f "${APP_DIR}/.env.production"

# Remove sensitive keys, bash history, cloud-init seed
rm -f /root/.ssh/authorized_keys
rm -f /home/ubuntu/.ssh/authorized_keys
rm -f /etc/ssh/ssh_host_*
cloud-init clean --logs --seed || true
truncate -s 0 /etc/machine-id
ln -sf /etc/machine-id /var/lib/dbus/machine-id 2>/dev/null || true
rm -rf /tmp/* /var/tmp/*
apt-get clean
rm -rf /var/lib/apt/lists/*
find /var/log -type f -exec truncate --size 0 {} \;
history -c || true

echo "===================================================================="
echo " SUCCESS: Instance is sanitized and ready for Golden AMI creation!  "
echo "===================================================================="
echo ""
echo "Next Steps to Capture the Golden AMI:"
echo "1. Exit the instance."
echo "2. From your AWS CLI or AWS Console, capture the image:"
echo "   aws ec2 create-image \\"
echo "     --instance-id <INSTANCE_ID> \\"
echo "     --name 'mindvisiontech-golden-ami-$(date +%Y%m%d)' \\"
echo "     --description 'MindVisionTech pre-baked Docker and NGINX image' \\"
echo "     --no-reboot"
echo "===================================================================="

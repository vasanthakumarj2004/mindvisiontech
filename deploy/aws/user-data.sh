#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Production EC2 User Data Bootstrap Script
# Target OS: Ubuntu 22.04 LTS / 24.04 LTS
# Designed for: AWS EC2 t2.micro / t3.micro (Free Tier)
# ==============================================================================

set -euo pipefail
exec > >(tee -a /var/log/mindvision-bootstrap.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting MindVisionTech Automated Bootstrap"
echo "===================================================================="

# ------------------------------------------------------------------------------
# 1. SWAP MEMORY CONFIGURATION (Critical for 1GB RAM Free Tier Instances)
# ------------------------------------------------------------------------------
if ! grep -q '/swapfile' /proc/swaps; then
    echo "--> [1/7] Allocating 2GB Swap Memory to prevent OOM termination..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Kernel tuning for memory pressure
    sysctl vm.swappiness=10
    sysctl vm.vfs_cache_pressure=50
    cat << 'EOF' > /etc/sysctl.d/99-memory-tuning.conf
vm.swappiness = 10
vm.vfs_cache_pressure = 50
EOF
    echo "Swap allocated successfully:"
    free -h
else
    echo "--> [1/7] Swapfile already exists. Skipping allocation."
fi

# ------------------------------------------------------------------------------
# 2. SYSTEM PACKAGE INSTALLATION & ESSENTIALS
# ------------------------------------------------------------------------------
echo "--> [2/7] Updating system packages and installing prerequisites..."
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
    nginx \
    certbot \
    python3-certbot-nginx \
    openssl

# Install AWS CLI v2 if not installed
if ! command -v aws &> /dev/null; then
    echo "--> Installing AWS CLI v2..."
    curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
    unzip -q /tmp/awscliv2.zip -d /tmp
    /tmp/aws/install
    rm -rf /tmp/aws /tmp/awscliv2.zip
fi

# ------------------------------------------------------------------------------
# 3. DOCKER ENGINE & DOCKER COMPOSE V2 INSTALLATION
# ------------------------------------------------------------------------------
if ! command -v docker &> /dev/null; then
    echo "--> [3/7] Installing Official Docker Engine & Compose plugin..."
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

    # Provide docker-compose symlink for backward compatibility
    echo '#!/bin/sh' > /usr/local/bin/docker-compose
    echo 'exec docker compose "$@"' >> /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "--> [3/7] Docker is already installed."
fi

# ------------------------------------------------------------------------------
# 4. APPLICATION DIRECTORY SETUP
# ------------------------------------------------------------------------------
APP_DIR="/opt/mindvisiontech"
echo "--> [4/7] Setting up application in ${APP_DIR}..."
mkdir -p "${APP_DIR}"

REPO_URL="https://github.com/vasanthakumarj2004/mindvisiontech.git"
if [ ! -d "${APP_DIR}/.git" ]; then
    echo "Cloning repository from ${REPO_URL}..."
    git clone "${REPO_URL}" "${APP_DIR}"
else
    echo "Repository already exists. Fetching latest changes..."
    cd "${APP_DIR}"
    git pull origin main || true
fi

cd "${APP_DIR}"

# ------------------------------------------------------------------------------
# 5. SECURE ENVIRONMENT VARIABLES (Dynamic fetch from AWS SSM or Fallback)
# ------------------------------------------------------------------------------
echo "--> [5/7] Configuring production environment variables..."
ENV_FILE="${APP_DIR}/.env.production"

# Auto-detect AWS Region from EC2 metadata if not explicitly set
AWS_REGION="${AWS_REGION:-$(curl -s http://169.254.169.254/latest/meta-data/placement/region 2>/dev/null || echo 'ap-south-1')}"

# If IAM Role has SSM permissions, fetch secrets natively without python dependencies
if aws ssm get-parameters-by-path --path "/mindvisiontech/prod" --region "${AWS_REGION}" &> /dev/null; then
    echo "Fetching secrets dynamically from AWS Systems Manager Parameter Store..."
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
    echo "Successfully populated ${ENV_FILE} from SSM."
    chmod 600 "${ENV_FILE}"
fi

# Fallback: if .env.production doesn't exist or is empty, create a secure baseline
if [ ! -s "${ENV_FILE}" ]; then
    echo "Creating baseline .env.production..."
    RANDOM_MONGO_PASS=$(openssl rand -hex 24)
    RANDOM_JWT_SECRET=$(openssl rand -hex 32)
    RANDOM_ADMIN_KEY=$(openssl rand -hex 32)

    cat << EOF > "${ENV_FILE}"
NODE_ENV=production
PORT=5000
CLIENT_URL=https://mindvisiontech.com
CORS_ORIGINS=https://mindvisiontech.com,https://www.mindvisiontech.com
MONGO_ROOT_USERNAME=mindvision_admin
MONGO_ROOT_PASSWORD=${RANDOM_MONGO_PASS}
JWT_SECRET=${RANDOM_JWT_SECRET}
ADMIN_API_KEY=${RANDOM_ADMIN_KEY}
EOF
    chmod 600 "${ENV_FILE}"
fi

# ------------------------------------------------------------------------------
# 6. DOCKER CONTAINERS STARTUP
# ------------------------------------------------------------------------------
echo "--> [6/7] Starting Docker containers with Docker Compose..."
# If external MongoDB Atlas is specified in .env.production, use stateless ASG compose
if grep -q "mongodb+srv://" "${ENV_FILE}" 2>/dev/null; then
    echo "External MongoDB URI detected (Atlas). Launching stateless API container..."
    COMPOSE_FILE="docker-compose.asg.yml"
else
    echo "Local MongoDB detected. Launching full stack (API + MongoDB)..."
    COMPOSE_FILE="docker-compose.prod.yml"
fi

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" down --remove-orphans || true
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --build

# ------------------------------------------------------------------------------
# 7. NGINX REVERSE PROXY & SSL CERTIFICATE BOOTSTRAP
# ------------------------------------------------------------------------------
echo "--> [7/7] Configuring and testing NGINX reverse proxy..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot 2>/dev/null || true

# Bootstrap temporary self-signed SSL cert if Let's Encrypt cert does not exist yet.
# Prevents NGINX startup failure on first boot!
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

    # Verify NGINX syntax
    if nginx -t; then
        systemctl restart nginx
        echo "NGINX restarted successfully."
    else
        echo "WARNING: NGINX config test failed! Review /etc/nginx/sites-available/mindvisiontech."
    fi
fi

# Health Verification
echo "Verifying local backend healthcheck on port 5000..."
sleep 5
for i in {1..12}; do
    if curl -s -f http://127.0.0.1:5000/api/health > /dev/null; then
        echo "SUCCESS: Backend is healthy and responding on 127.0.0.1:5000/api/health"
        break
    fi
    echo "Waiting for backend service to become ready... (attempt $i/12)"
    sleep 3
done

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MindVisionTech Bootstrap Completed!"
echo "===================================================================="

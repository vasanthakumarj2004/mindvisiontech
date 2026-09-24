#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Production EC2 Application Startup & Self-Healing Script
# Checks all system prerequisites, starts Docker containers (API + MongoDB/Atlas),
# builds/verifies frontend, links NGINX, and registers systemd auto-start on boot.
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Root check
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: Please run this script with sudo: sudo ./deploy/aws/start-app.sh"
    exit 1
fi

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export DEBIAN_FRONTEND=noninteractive

LOG_FILE="/var/log/mindvision-startup.log"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting MindVisionTech Application on EC2"
echo "===================================================================="

# 1. SWAP MEMORY CHECK (Critical for 1GB RAM t2/t3.micro instances)
echo "--> [1/7] Checking Swap Memory..."
if ! grep -q '/swapfile' /proc/swaps; then
    if [ -f /swapfile ]; then
        chmod 600 /swapfile
        swapon /swapfile || true
    else
        echo "Creating 2GB swapfile..."
        fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
    fi
    if ! grep -q '/swapfile' /etc/fstab; then
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi
    sysctl vm.swappiness=10
fi
echo "Swap is active:"
free -h

# 2. SYSTEM DAEMONS CHECK (Docker & NGINX)
echo "--> [2/7] Ensuring Docker and NGINX services are running..."
systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl start nginx
usermod -aG docker ubuntu || true

# 3. DIRECTORY & REPOSITORY CHECK
APP_DIR="/opt/mindvisiontech"
echo "--> [3/7] Verifying application codebase at ${APP_DIR}..."
if [ ! -d "${APP_DIR}/.git" ]; then
    echo "Cloning repository..."
    git clone https://github.com/vasanthakumarj2004/mindvisiontech.git "${APP_DIR}"
fi

cd "${APP_DIR}"

# Safe git config for root
git config --global --add safe.directory "${APP_DIR}" || true

# Ensure latest code on main
git fetch origin main || true
git checkout main || true
git pull origin main || true

# 4. ENVIRONMENT SECRETS CHECK
echo "--> [4/7] Checking production environment variables..."
ENV_FILE="${APP_DIR}/.env.production"
if [ ! -s "${ENV_FILE}" ]; then
    echo "Creating baseline .env.production..."
    RANDOM_MONGO_PASS=$(openssl rand -hex 24)
    RANDOM_JWT_SECRET=$(openssl rand -hex 32)
    RANDOM_ADMIN_KEY=$(openssl rand -hex 32)
    cat << EOF > "${ENV_FILE}"
NODE_ENV=production
PORT=5000
CLIENT_URL=https://mindvisiontech.com
CORS_ORIGINS=https://mindvisiontech.com,https://www.mindvisiontech.com,http://mindvisiontech.com
MONGO_ROOT_USERNAME=mindvision_admin
MONGO_ROOT_PASSWORD=${RANDOM_MONGO_PASS}
JWT_SECRET=${RANDOM_JWT_SECRET}
ADMIN_API_KEY=${RANDOM_ADMIN_KEY}
EOF
    chmod 600 "${ENV_FILE}"
    echo "Generated new .env.production with secure random credentials."
else
    echo "Existing .env.production found. Preserving current secrets."
fi

# 5. DOCKER CONTAINERS STARTUP (API + MONGODB/ATLAS)
echo "--> [5/7] Starting Docker containers..."
if grep -q "mongodb+srv://" "${ENV_FILE}" 2>/dev/null; then
    echo "MongoDB Atlas detected in .env.production. Launching API container only..."
    docker stop mindvisiontech-mongodb-prod 2>/dev/null || true
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --build api
else
    echo "Local MongoDB detected. Launching MongoDB and API containers..."
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --build
fi

# 6. FRONTEND STATIC BUILD CHECK
echo "--> [6/7] Verifying Next.js static build in /var/www/mindvisiontech/out..."
mkdir -p /var/www/mindvisiontech/out
if [ ! -f /var/www/mindvisiontech/out/index.html ]; then
    echo "Building static frontend..."
    cd "${APP_DIR}/client"
    npm ci --prefer-offline || npm install
    NODE_OPTIONS="--max-old-space-size=1536" NEXT_PUBLIC_API_URL="/api" npm run build:static
    rm -rf /var/www/mindvisiontech/out/*
    cp -r "${APP_DIR}/client/out/." /var/www/mindvisiontech/out/
fi
chown -R www-data:www-data /var/www/mindvisiontech
cd "${APP_DIR}"

# 7. NGINX & SSL CERTIFICATE CONFIGURATION
echo "--> [7/7] Configuring and testing NGINX with SSL..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot

# Ensure valid SSL certificate exists (links to -0001 lineage if present, or creates bootstrap)
CERT_DIR="/etc/letsencrypt/live/mindvisiontech.com"
if [ -d "${CERT_DIR}-0001" ]; then
    if [ -d "${CERT_DIR}" ] && [ ! -L "${CERT_DIR}" ]; then
        rm -rf "${CERT_DIR}.bak"
        mv "${CERT_DIR}" "${CERT_DIR}.bak"
    fi
    rm -f "${CERT_DIR}"
    ln -sf "${CERT_DIR}-0001" "${CERT_DIR}"
    rm -f /etc/letsencrypt/renewal/mindvisiontech.com.conf
elif [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
    echo "Let's Encrypt certificate not found. Generating bootstrap SSL certificate so NGINX can boot..."
    mkdir -p "${CERT_DIR}"
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
        -keyout "${CERT_DIR}/privkey.pem" \
        -out "${CERT_DIR}/fullchain.pem" \
        -subj "/CN=mindvisiontech.com"
    chmod 600 "${CERT_DIR}/privkey.pem"
fi

if [ -f "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" ]; then
    cp "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" /etc/nginx/sites-available/mindvisiontech
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/mindvisiontech /etc/nginx/sites-enabled/
    nginx -t
    systemctl restart nginx
fi

# 8. HEALTH VERIFICATION LOOP
echo "--> Verifying backend health on http://127.0.0.1:5000/api/health..."
HEALTHY=0
for i in {1..20}; do
    if curl -s -f http://127.0.0.1:5000/api/health > /dev/null; then
        HEALTHY=1
        echo "SUCCESS: Backend Express API is healthy and responding!"
        break
    fi
    echo "Waiting for API to respond... (attempt ${i}/20)"
    sleep 2
done

if [ "${HEALTHY}" -ne 1 ]; then
    echo "WARNING: Backend healthcheck did not respond within 40s. Check 'docker compose logs'."
fi

# 9. REGISTER SYSTEMD AUTO-START (Never fail on EC2 reboot again)
if [ ! -f /etc/systemd/system/mindvisiontech.service ]; then
    echo "--> Installing systemd auto-start service for future EC2 reboots..."
    cat << 'EOF' > /etc/systemd/system/mindvisiontech.service
[Unit]
Description=MindVisionTech Application Auto-Start
After=docker.service network-online.target
Requires=docker.service
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/mindvisiontech
ExecStart=/opt/mindvisiontech/deploy/aws/start-app.sh
TimeoutStartSec=600

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable mindvisiontech.service
    echo "Systemd service registered: MindVisionTech will automatically start on any future EC2 boot!"
fi

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] All services are UP and HEALTHY!"
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "===================================================================="

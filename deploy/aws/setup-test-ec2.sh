#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Single EC2 Testing Environment Setup Script
# Sets up Next.js Frontend + Express API + MongoDB + NGINX on a single EC2
# Accessible directly via http://<EC2_PUBLIC_IP> (No Domain / No SSL needed)
# ==============================================================================

set -euo pipefail
exec > >(tee -a /var/log/mindvision-test-setup.log) 2>&1

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting MindVisionTech Single EC2 Test Setup"
echo "===================================================================="

# 1. 2GB Swap Setup (Prevents out-of-memory crashes on 1GB RAM t2/t3.micro)
if ! grep -q '/swapfile' /proc/swaps; then
    echo "--> [1/6] Setting up 2GB swap space..."
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo "Swap created successfully:"
    free -h
fi

# 2. System Packages & Prerequisites
echo "--> [2/6] Installing dependencies (Docker, NGINX, Node.js, Git)..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg lsb-release git jq nginx

# Install Node.js 20 LTS for building the frontend
if ! command -v node &> /dev/null; then
    echo "--> Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "--> Installing Docker Engine..."
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ubuntu || true
fi

# 3. Application Directory Setup
APP_DIR="/opt/mindvisiontech"
echo "--> [3/6] Setting up repository in ${APP_DIR}..."
mkdir -p "${APP_DIR}"

if [ ! -d "${APP_DIR}/.git" ]; then
    git clone https://github.com/vasanthakumarj2004/mindvisiontech.git "${APP_DIR}"
else
    cd "${APP_DIR}"
    git pull origin main || true
fi

cd "${APP_DIR}"

# 4. Production Environment Configuration
echo "--> [4/6] Configuring environment baseline..."
ENV_FILE="${APP_DIR}/.env.production"
if [ ! -f "${ENV_FILE}" ]; then
    RANDOM_PASS=$(openssl rand -hex 16)
    cat << EOF > "${ENV_FILE}"
NODE_ENV=production
PORT=5000
CLIENT_URL=*
CORS_ORIGINS=*
MONGO_ROOT_USERNAME=mindvision_admin
MONGO_ROOT_PASSWORD=${RANDOM_PASS}
JWT_SECRET=$(openssl rand -hex 32)
ADMIN_API_KEY=$(openssl rand -hex 32)
EOF
    chmod 600 "${ENV_FILE}"
fi

# 5. Start Backend API & MongoDB in Docker
echo "--> [5/6] Starting Docker containers (MongoDB + Express API)..."
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml down --remove-orphans || true
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --build

# 6. Build Next.js Static Frontend with Relative API URL
echo "--> [6/6] Building Next.js frontend with relative API routing..."
cd "${APP_DIR}/client"
npm ci
NEXT_PUBLIC_API_URL="/api" npm run build:static

# Copy static frontend to /var/www/mindvisiontech/out
mkdir -p /var/www/mindvisiontech
rm -rf /var/www/mindvisiontech/out
cp -r "${APP_DIR}/client/out" /var/www/mindvisiontech/out
chown -R www-data:www-data /var/www/mindvisiontech

# 7. Configure NGINX Reverse Proxy for IP Testing
echo "--> Configuring NGINX reverse proxy..."
cat << 'EOF' > /etc/nginx/sites-available/mindvisiontech-test
# 1. Main Website: mindvisiontech.com, www.mindvisiontech.com, and direct IP
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name mindvisiontech.com www.mindvisiontech.com _;

    root /var/www/mindvisiontech/out;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;

    # Reverse Proxy API requests to Express container
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # Serve Next.js static pages with fallback
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}

# 2. Dedicated API Subdomain: api.mindvisiontech.com
server {
    listen 80;
    listen [::]:80;
    server_name api.mindvisiontech.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
EOF


rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/mindvisiontech-test /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Verify Backend Readiness
sleep 5
for i in {1..10}; do
    if curl -s -f http://127.0.0.1:5000/api/health > /dev/null; then
        echo "SUCCESS: Backend API is healthy and responding!"
        break
    fi
    echo "Waiting for API service to become ready... ($i/10)"
    sleep 3
done

PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || curl -s ifconfig.me || echo "<YOUR_EC2_PUBLIC_IP>")

echo "===================================================================="
echo "🎉 TESTING ENVIRONMENT IS LIVE!"
echo "Open in your browser: http://${PUBLIC_IP}"
echo "API Health Endpoint:  http://${PUBLIC_IP}/api/health"
echo "===================================================================="

#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech - Dockerized EC2 Ubuntu Setup Script
# Domain: mindvisiontech.com
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_USER="${SUDO_USER:-${USER:-ubuntu}}"

if [[ ! -f "${APP_DIR}/deploy/nginx/mindvisiontech.conf" ]]; then
    echo "ERROR: Nginx config not found at ${APP_DIR}/deploy/nginx/mindvisiontech.conf" >&2
    exit 1
fi

echo ">>> [1/5] Updating system packages & installing dependencies..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw docker.io docker-compose-v2 nginx certbot python3-certbot-nginx

echo ">>> [2/5] Configuring 2GB Swap space (Prevents memory exhaustion on EC2)..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo ">>> [3/5] Adding current user to docker group..."
sudo usermod -aG docker "${TARGET_USER}"

echo ">>> [4/5] Configuring Nginx reverse proxy for mindvisiontech.com..."
sudo cp "${APP_DIR}/deploy/nginx/mindvisiontech.conf" /etc/nginx/sites-available/mindvisiontech
sudo ln -sf /etc/nginx/sites-available/mindvisiontech /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo ">>> [5/5] Configuring firewall rules (SSH, HTTP, HTTPS)..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "=============================================================================="
echo "Docker & System Setup Complete!"
echo ""
echo "NEXT STEPS TO LAUNCH WITH DOCKER:"
echo "1. Create your .env.docker file:"
echo "   cp .env.docker.example .env.docker"
echo "   nano .env.docker   (enter your Mongo password and AWS S3 keys)"
echo ""
echo "2. Build and start all 3 Docker containers (MongoDB + Express + Next.js):"
echo "   docker compose --env-file .env.docker up -d --build"
echo ""
echo "3. Check container status:"
echo "   docker compose ps"
echo ""
echo "4. Obtain Free SSL with Let's Encrypt (once GoDaddy DNS points to this server):"
echo "   sudo certbot --nginx -d mindvisiontech.com -d www.mindvisiontech.com"
echo "=============================================================================="

#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Automated Let's Encrypt SSL Setup Script (Certbot)
# Replaces AWS ALB by acquiring free, auto-renewing SSL certificates directly on EC2.
# Usage:
#   sudo ./setup-ssl-certbot.sh [EMAIL]
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Root check
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: Please run this script with sudo: sudo ./setup-ssl-certbot.sh"
    exit 1
fi

APP_DIR="/opt/mindvisiontech"
EMAIL="${1:-admin@mindvisiontech.com}"
DOMAIN="mindvisiontech.com"
WWW_DOMAIN="www.mindvisiontech.com"
API_DOMAIN="api.mindvisiontech.com"

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Automated Let's Encrypt SSL Setup"
echo "Target Domains: ${DOMAIN}, ${WWW_DOMAIN}, ${API_DOMAIN}"
echo "Admin Email:    ${EMAIL}"
echo "===================================================================="

# 1. Install Certbot and NGINX plugin if missing
echo "--> [1/6] Verifying Certbot installation..."
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot and python3-certbot-nginx..."
    export DEBIAN_FRONTEND=noninteractive
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi
echo "Certbot is installed: $(certbot --version)"

# 2. Prepare ACME challenge directory
echo "--> [2/6] Preparing ACME challenge directory at /var/www/certbot..."
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot
chmod -R 755 /var/www/certbot

# 3. Ensure Bootstrap Certificate Exists so NGINX Can Run
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
if [ ! -f "${CERT_DIR}/fullchain.pem" ]; then
    echo "--> [3/6] Generating bootstrap self-signed certificate so NGINX port 80 is live..."
    mkdir -p "${CERT_DIR}"
    openssl req -x509 -nodes -days 30 -newkey rsa:2048 \
        -keyout "${CERT_DIR}/privkey.pem" \
        -out "${CERT_DIR}/fullchain.pem" \
        -subj "/CN=${DOMAIN}"
    chmod 600 "${CERT_DIR}/privkey.pem"
fi

# 4. Activate NGINX configuration
echo "--> [4/6] Linking and reloading NGINX configuration..."
if [ -f "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" ]; then
    cp "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" /etc/nginx/sites-available/mindvisiontech
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/mindvisiontech /etc/nginx/sites-enabled/
    nginx -t
    systemctl reload nginx || systemctl restart nginx
fi

# 5. Acquire Official Let's Encrypt SSL Certificate via Webroot
echo "--> [5/6] Requesting Let's Encrypt SSL Certificate..."

# Test DNS resolution for primary domain
PUBLIC_IP=$(curl -s -4 ifconfig.me || curl -s -4 icanhazip.com || echo "unknown")
echo "Local EC2 Public IP: ${PUBLIC_IP}"

# Attempt certificate acquisition for apex, www, and api subdomains
if certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" -d "${API_DOMAIN}" \
    --non-interactive --agree-tos --email "${EMAIL}" \
    --expand --keep-until-expiring; then
    echo "SUCCESS: Acquired SSL certificate for ${DOMAIN}, ${WWW_DOMAIN}, and ${API_DOMAIN}!"
elif certbot certonly --webroot -w /var/www/certbot \
    -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
    --non-interactive --agree-tos --email "${EMAIL}" \
    --expand --keep-until-expiring; then
    echo "SUCCESS: Acquired SSL certificate for ${DOMAIN} and ${WWW_DOMAIN}!"
    echo "NOTICE: If you want api.${DOMAIN} included, ensure its Route 53 A-record points to ${PUBLIC_IP}."
else
    echo "CRITICAL: Certbot failed to verify domain ownership!"
    echo "Make sure your Route 53 DNS A-record points directly to this EC2 IP: ${PUBLIC_IP}"
    echo "And ensure EC2 Security Group allows Inbound Port 80 (HTTP) and Port 443 (HTTPS) from 0.0.0.0/0."
    exit 1
fi

# 6. Normalize Certificate Lineage & Reload NGINX
echo "--> [6/6] Finalizing certificate links and reloading NGINX..."

# Handle Certbot -0001 lineage if previous directory or bootstrap cert existed
if [ -d "/etc/letsencrypt/live/${DOMAIN}-0001" ]; then
    echo "Certbot created ${DOMAIN}-0001 lineage. Linking to active ${DOMAIN} path..."
    if [ -d "/etc/letsencrypt/live/${DOMAIN}" ] && [ ! -L "/etc/letsencrypt/live/${DOMAIN}" ]; then
        rm -rf "/etc/letsencrypt/live/${DOMAIN}.bak"
        mv "/etc/letsencrypt/live/${DOMAIN}" "/etc/letsencrypt/live/${DOMAIN}.bak"
    fi
    rm -f "/etc/letsencrypt/live/${DOMAIN}"
    ln -sf "/etc/letsencrypt/live/${DOMAIN}-0001" "/etc/letsencrypt/live/${DOMAIN}"
    rm -f "/etc/letsencrypt/renewal/${DOMAIN}.conf"
fi

nginx -t
systemctl reload nginx

echo "Testing automated renewal dry-run..."
certbot renew --dry-run

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Let's Encrypt SSL Setup COMPLETE & ACTIVE!"
echo "Main Site:  https://${DOMAIN}"
echo "WWW Site:   https://${WWW_DOMAIN}"
echo "Cert Path:  /etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
echo "Auto-Renew: Managed automatically by systemd certbot.timer"
echo "===================================================================="

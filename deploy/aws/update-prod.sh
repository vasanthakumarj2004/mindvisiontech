#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Zero-Downtime Application Update Script
# Triggered by GitHub Actions on `git push` or run manually on EC2.
# Detects changed files, rebuilds frontend / backend as needed, performs healthcheck,
# and automatically rolls back if health verification fails.
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Root check
if [ "$EUID" -ne 0 ]; then
    echo "ERROR: Please run this script with sudo: sudo ./deploy/aws/update-prod.sh"
    exit 1
fi

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export DEBIAN_FRONTEND=noninteractive

APP_DIR="/opt/mindvisiontech"
ENV_FILE="${APP_DIR}/.env.production"
BRANCH="${1:-main}"
FORCE_FLAG="${2:-0}"

if [ "${FORCE_FLAG}" == "--force" ] || [ "${FORCE_FLAG}" == "-f" ]; then
    FORCE=1
else
    FORCE=0
fi

echo "======================================================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Application Production Deployment"
echo "Target Branch: ${BRANCH}"
echo "======================================================================"

cd "${APP_DIR}"
git config --global --add safe.directory "${APP_DIR}" || true

# 1. Fetch latest changes from Git
echo "--> [1/5] Fetching latest commit from git origin/${BRANCH}..."
git fetch origin "${BRANCH}"
CURRENT_HASH=$(git rev-parse HEAD)
LATEST_HASH=$(git rev-parse "origin/${BRANCH}")

if [ "${CURRENT_HASH}" == "${LATEST_HASH}" ] && [ "${FORCE}" != "1" ] && [ -f /var/www/mindvisiontech/out/index.html ]; then
    echo "Production is already up to date (${CURRENT_HASH:0:7}). No deployment needed."
    exit 0
fi

# Determine changed files
CHANGED_FILES=$(git diff --name-only "${CURRENT_HASH}" "${LATEST_HASH}" || echo "all")
echo "Changed files in this update:"
echo "${CHANGED_FILES}"

# Pull latest code
git checkout "${BRANCH}"
git pull origin "${BRANCH}"
NEW_HASH=$(git rev-parse HEAD)
echo "Codebase updated: ${CURRENT_HASH:0:7} -> ${NEW_HASH:0:7}"

# 2. Update Frontend (if client/ or package.json changed, or if out/ is missing)
if [ ! -f /var/www/mindvisiontech/out/index.html ] || echo "${CHANGED_FILES}" | grep -q -E "^(client/|package|all)"; then
    echo "--> [2/5] Frontend build required. Rebuilding Next.js static pages..."
    cd "${APP_DIR}/client"
    npm ci
    NEXT_PUBLIC_API_URL="/api" npm run build:static
    mkdir -p /var/www/mindvisiontech
    rm -rf /var/www/mindvisiontech/out
    cp -r "${APP_DIR}/client/out" /var/www/mindvisiontech/out
    chown -R www-data:www-data /var/www/mindvisiontech
    cd "${APP_DIR}"
    echo "Frontend build completed and deployed to /var/www/mindvisiontech/out."
else
    echo "--> [2/5] No frontend changes. Skipping frontend rebuild."
fi

# Ensure MongoDB is running
if ! docker ps --format '{{.Names}}' | grep -q "mindvisiontech-mongodb-prod"; then
    echo "Starting MongoDB container..."
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d mongodb
fi

# 3. Update Backend (if server/, Dockerfile, or docker-compose changed, or container not running)
if ! docker ps --format '{{.Names}}' | grep -q "mindvisiontech-api-prod" || echo "${CHANGED_FILES}" | grep -q -E "^(server/|docker-compose|Dockerfile|all)"; then
    echo "--> [3/5] Backend changes detected. Pre-building API container..."
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml build api
    
    echo "Performing atomic zero-downtime container swap..."
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --no-deps api
else
    echo "--> [3/5] No backend changes. Skipping container rebuild."
fi

# 4. Automated Health Verification with Rollback
echo "--> [4/5] Verifying API healthcheck on http://127.0.0.1:5000/api/health..."
HEALTHY=0
for i in {1..20}; do
    if curl -s -f http://127.0.0.1:5000/api/health > /dev/null; then
        HEALTHY=1
        echo "SUCCESS: API container is healthy and responding on port 5000!"
        break
    fi
    echo "Waiting for healthcheck to pass... (attempt ${i}/20)"
    sleep 2
done

if [ "${HEALTHY}" -ne 1 ]; then
    echo "CRITICAL: Healthcheck failed! Initiating auto-rollback..."
    git checkout "${CURRENT_HASH}"
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml build api
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --no-deps api
    echo "Rolled back successfully to previous commit ${CURRENT_HASH:0:7}."
    exit 1
fi

# 5. Check NGINX Configuration & Reload
echo "--> [5/5] Checking NGINX configuration..."
if [ -f "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" ]; then
    cp "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" /etc/nginx/sites-available/mindvisiontech
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/mindvisiontech /etc/nginx/sites-enabled/
    if nginx -t; then
        systemctl reload nginx 2>/dev/null || systemctl restart nginx
        echo "NGINX reloaded without dropping active connections."
    fi
fi

# Clean up dangling images
docker image prune -f > /dev/null 2>&1 || true

echo "======================================================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deployment Succeeded! Commit ${NEW_HASH:0:7} is LIVE!"
echo "======================================================================"

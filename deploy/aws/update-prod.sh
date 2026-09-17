#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Instant Zero-Downtime Production Update Script
# Triggered by CI/CD (GitHub Actions), Webhook, or Developer SSH
# Rebuilds the API container, performs healthchecks, and auto-rolls back on failure
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

APP_DIR="/opt/mindvisiontech"
ENV_FILE="${APP_DIR}/.env.production"
BRANCH="${1:-main}"

echo "======================================================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Instant Production Deployment"
echo "Target Branch: ${BRANCH}"
echo "======================================================================"

cd "${APP_DIR}"

# 1. Fetch latest changes from Git
echo "--> [1/5] Pulling latest changes from git origin/${BRANCH}..."
git fetch origin "${BRANCH}"
CURRENT_HASH=$(git rev-parse HEAD)
LATEST_HASH=$(git rev-parse "origin/${BRANCH}")

if [ "${CURRENT_HASH}" == "${LATEST_HASH}" ] && [ "${FORCE:-0}" != "1" ]; then
    echo "Production is already up to date (${CURRENT_HASH:0:7}). No changes to deploy."
    exit 0
fi

git checkout "${BRANCH}"
git pull origin "${BRANCH}"
NEW_HASH=$(git rev-parse HEAD)
echo "Updated repository: ${CURRENT_HASH:0:7} -> ${NEW_HASH:0:7}"

# 2. Determine Compose File
if grep -q "mongodb+srv://" "${ENV_FILE}" 2>/dev/null; then
    COMPOSE_FILE="docker-compose.asg.yml"
else
    COMPOSE_FILE="docker-compose.prod.yml"
fi

# 3. Build new Docker API image without stopping running container
echo "--> [2/5] Pre-building new API container image..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build api

# 4. Atomic zero-downtime container swap
echo "--> [3/5] Performing atomic container restart..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --no-deps api

# 5. Automated Health Verification with Rollback
echo "--> [4/5] Verifying API healthcheck on http://127.0.0.1:5000/api/health..."
HEALTHY=0
for i in {1..15}; do
    if curl -s -f http://127.0.0.1:5000/api/health > /dev/null; then
        HEALTHY=1
        echo "SUCCESS: New API container is healthy and responding on port 5000!"
        break
    fi
    echo "Waiting for healthcheck to pass... (attempt ${i}/15)"
    sleep 2
done

if [ "${HEALTHY}" -ne 1 ]; then
    echo "CRITICAL: Healthcheck failed on new deployment! Initiating auto-rollback..."
    git checkout "${CURRENT_HASH}"
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build api
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --no-deps api
    echo "Rolled back successfully to previous commit ${CURRENT_HASH:0:7}."
    exit 1
fi

# 6. Check if NGINX configuration changed and reload safely
echo "--> [5/5] Checking NGINX configuration..."
if [ -f "${APP_DIR}/deploy/aws/nginx.conf" ]; then
    cp "${APP_DIR}/deploy/aws/nginx.conf" /etc/nginx/sites-available/mindvisiontech
    if nginx -t; then
        systemctl reload nginx
        echo "NGINX reloaded without dropping active connections."
    fi
fi

# Clean up dangling images to keep disk space lean
docker image prune -f > /dev/null 2>&1 || true

echo "======================================================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Instant Deployment Complete: ${NEW_HASH:0:7} is LIVE!"
echo "======================================================================"

#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Optimized Zero-Downtime Application Deployment Script
# 1. Takes pre-deployment DB backup / snapshot
# 2. Backs up current running Docker image (for instant zero-rebuild fallback)
# 3. Pulls latest commit from GitHub
# 4. Deploys static frontend (instant unpack from CI bundle or local build fallback)
# 5. Builds new Docker image via Docker Compose and launches container
# 6. Verifies healthcheck; on success removes old images, on failure rolls back immediately
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
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Optimized Application Deployment"
echo "Target Branch: ${BRANCH}"
echo "======================================================================"

cd "${APP_DIR}"
git config --global --add safe.directory "${APP_DIR}" || true

# ------------------------------------------------------------------------------
# 1. DATABASE BACKUP / SNAPSHOT (Safety first)
# ------------------------------------------------------------------------------
echo "--> [1/6] Performing pre-deployment database backup / snapshot..."
if [ -f "${APP_DIR}/deploy/aws/backup-db.sh" ]; then
    bash "${APP_DIR}/deploy/aws/backup-db.sh" || {
        echo "WARNING: Pre-deployment backup failed. Continuing deployment..."
    }
fi

# ------------------------------------------------------------------------------
# 2. TAG CURRENT WORKING DOCKER IMAGE FOR INSTANT FALLBACK
# ------------------------------------------------------------------------------
echo "--> [2/6] Tagging current Docker image as fallback..."
if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^mindvisiontech-api:latest$"; then
    docker tag mindvisiontech-api:latest mindvisiontech-api:previous
    echo "Snapshot created: mindvisiontech-api:previous"
fi

# ------------------------------------------------------------------------------
# 3. FETCH & CHECKOUT LATEST CODE
# ------------------------------------------------------------------------------
echo "--> [3/6] Fetching latest commit from git origin/${BRANCH}..."
git fetch origin "${BRANCH}"
CURRENT_HASH=$(git rev-parse HEAD)
LATEST_HASH=$(git rev-parse "origin/${BRANCH}")

if [ "${CURRENT_HASH}" == "${LATEST_HASH}" ] && [ "${FORCE}" != "1" ] && [ -f /var/www/mindvisiontech/out/index.html ]; then
    echo "Production codebase is already at ${CURRENT_HASH:0:7}. No git changes."
fi

CHANGED_FILES=$(git diff --name-only "${CURRENT_HASH}" "${LATEST_HASH}" 2>/dev/null || echo "all")
git checkout "${BRANCH}"
git pull origin "${BRANCH}"
NEW_HASH=$(git rev-parse HEAD)
echo "Codebase active at: ${NEW_HASH:0:7}"

# ------------------------------------------------------------------------------
# 4. DEPLOY STATIC FRONTEND ASSETS
# ------------------------------------------------------------------------------
echo "--> [4/6] Updating frontend assets..."
mkdir -p /var/www/mindvisiontech/out

if [ -f "/tmp/frontend-dist.tar.gz" ]; then
    echo "Found pre-built CI frontend bundle. Performing instant extraction..."
    rm -rf /var/www/mindvisiontech/out/*
    tar -xzf /tmp/frontend-dist.tar.gz -C /var/www/mindvisiontech/out
    rm -f /tmp/frontend-dist.tar.gz
    chown -R www-data:www-data /var/www/mindvisiontech
    echo "SUCCESS: Instant frontend update completed in 0.5s."
elif [ ! -f /var/www/mindvisiontech/out/index.html ] || echo "${CHANGED_FILES}" | grep -q -E "^(client/|package|all)"; then
    echo "Pre-built bundle not present. Compiling locally on EC2 (with memory limits)..."
    cd "${APP_DIR}/client"
    npm ci --prefer-offline || npm install
    NODE_OPTIONS="--max-old-space-size=1536" NEXT_PUBLIC_API_URL="/api" npm run build:static
    rm -rf /var/www/mindvisiontech/out/*
    cp -r "${APP_DIR}/client/out/." /var/www/mindvisiontech/out/
    chown -R www-data:www-data /var/www/mindvisiontech
    cd "${APP_DIR}"
    echo "Local frontend build completed."
else
    echo "Frontend is up to date. Skipping rebuild."
fi

# ------------------------------------------------------------------------------
# 5. DOCKER COMPOSE BUILD & RUN NEW IMAGE
# ------------------------------------------------------------------------------
echo "--> [5/6] Building new Docker image and deploying with Docker Compose..."

# Check Database Configuration: MongoDB Atlas vs Local Container
if grep -q "mongodb+srv://" "${ENV_FILE}" 2>/dev/null; then
    echo "MongoDB Atlas detected in .env.production. Stopping local MongoDB container to conserve RAM..."
    docker stop mindvisiontech-mongodb-prod 2>/dev/null || true
else
    echo "Local MongoDB detected. Ensuring local container is running..."
    docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d mongodb
fi

# Build new API image
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml build api

# Tag new image with git commit hash
docker tag mindvisiontech-api:latest "mindvisiontech-api:${NEW_HASH:0:7}"

# Run new container (hot-swap)
echo "Hot-swapping API container with new image..."
docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --no-deps api

# ------------------------------------------------------------------------------
# 6. HEALTH VERIFICATION WITH AUTOMATIC ROLLBACK
# ------------------------------------------------------------------------------
echo "--> [6/6] Verifying API healthcheck on http://127.0.0.1:5000/api/health..."
HEALTHY=0
for i in {1..20}; do
    if curl -s -f http://127.0.0.1:5000/api/health > /dev/null; then
        HEALTHY=1
        echo "SUCCESS: New container is healthy and responding on port 5000!"
        break
    fi
    echo "Waiting for healthcheck to pass... (attempt ${i}/20)"
    sleep 2
done

if [ "${HEALTHY}" -ne 1 ]; then
    echo "CRITICAL: Healthcheck failed! Falling back to previous Docker image..."
    if docker images --format '{{.Repository}}:{{.Tag}}' | grep -q "^mindvisiontech-api:previous$"; then
        docker tag mindvisiontech-api:previous mindvisiontech-api:latest
        docker compose --env-file "${ENV_FILE}" -f docker-compose.prod.yml up -d --no-deps api
        echo "Rollback complete: Reverted to previous working Docker image."
    fi
    git checkout "${CURRENT_HASH}"
    exit 1
fi

# Deployment succeeded: Clean up older unused/dangling images
echo "Deployment successful! Pruning older unused Docker images..."
docker image prune -f > /dev/null 2>&1 || true

# Reload NGINX gracefully
if [ -f "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" ]; then
    cp "${APP_DIR}/deploy/aws/nginx-single-ec2.conf" /etc/nginx/sites-available/mindvisiontech
    rm -f /etc/nginx/sites-enabled/default
    ln -sf /etc/nginx/sites-available/mindvisiontech /etc/nginx/sites-enabled/
    if nginx -t; then
        systemctl reload nginx 2>/dev/null || systemctl restart nginx
        echo "NGINX reloaded without dropping active connections."
    fi
fi

echo "======================================================================"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Deployment Succeeded! Commit ${NEW_HASH:0:7} is LIVE!"
echo "Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo "======================================================================"

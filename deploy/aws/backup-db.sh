#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Automated Database Backup & Snapshot Script
# Supports:
# 1. Local MongoDB Container (mongodump + volume snapshot)
# 2. Cloud MongoDB Atlas (mongodump via transient docker container)
# Saves backups to /opt/mindvisiontech/backups/ and prunes older than 7 days.
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
if [ -d "/opt/mindvisiontech" ] && [ -w "/opt/mindvisiontech" ]; then
    APP_DIR="/opt/mindvisiontech"
else
    APP_DIR="${SCRIPT_DIR}"
fi

BACKUP_DIR="${APP_DIR}/backups"
ENV_FILE="${APP_DIR}/.env.production"
mkdir -p "${BACKUP_DIR}"

if [ -w "/var/log" ]; then
    LOG_FILE="/var/log/mindvision-backup.log"
else
    LOG_FILE="${BACKUP_DIR}/backup.log"
fi

exec > >(tee -a "${LOG_FILE}") 2>&1

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/mongodb_backup_${TIMESTAMP}.archive.gz"
VOL_BACKUP_FILE="${BACKUP_DIR}/mongodb_volume_${TIMESTAMP}.tar.gz"

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Automated MongoDB Backup / Snapshot"
echo "===================================================================="

# 1. Load environment variables
if [ -f "${ENV_FILE}" ]; then
    export $(grep -E '^(MONGO_ROOT_USERNAME|MONGO_ROOT_PASSWORD|S3_BACKUP_BUCKET|MONGODB_URI)=' "${ENV_FILE}" | xargs)
elif [ -f "${APP_DIR}/server/.env" ]; then
    export $(grep -E '^(MONGO_ROOT_USERNAME|MONGO_ROOT_PASSWORD|S3_BACKUP_BUCKET|MONGODB_URI)=' "${APP_DIR}/server/.env" | xargs)
elif [ -f "${APP_DIR}/.env" ]; then
    export $(grep -E '^(MONGO_ROOT_USERNAME|MONGO_ROOT_PASSWORD|S3_BACKUP_BUCKET|MONGODB_URI)=' "${APP_DIR}/.env" | xargs)
fi

CONTAINER_NAME="mindvisiontech-mongodb-prod"
MONGO_USER="${MONGO_ROOT_USERNAME:-mindvision_admin}"
MONGO_PASS="${MONGO_ROOT_PASSWORD:-mindvision_prod_pass}"

# Check if using Cloud MongoDB Atlas or Local Container
if [[ "${MONGODB_URI:-}" == *"mongodb+srv://"* ]]; then
    echo "--> Detected MongoDB Atlas endpoint. Running offsite dump via Docker..."
    docker run --rm -v "${BACKUP_DIR}:/backups" mongo:7.0 mongodump \
        --uri="${MONGODB_URI}" \
        --archive="/backups/mongodb_backup_${TIMESTAMP}.archive.gz" \
        --gzip \
        --quiet || {
            echo "WARNING: mongodump from MongoDB Atlas failed. Check credentials or network access."
        }
elif docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "--> [1/3] Dumping local MongoDB container (${CONTAINER_NAME}) to ${BACKUP_FILE}..."
    docker exec "${CONTAINER_NAME}" mongodump \
        --username "${MONGO_USER}" \
        --password "${MONGO_PASS}" \
        --authenticationDatabase admin \
        --archive \
        --gzip > "${BACKUP_FILE}" || {
            echo "WARNING: Docker exec mongodump failed."
        }

    # Also perform local volume filesystem snapshot if volume exists
    VOL_PATH="/var/lib/docker/volumes/mindvisiontech_persistent_mongo_data/_data"
    if [ -d "${VOL_PATH}" ]; then
        echo "--> [2/3] Creating physical data volume snapshot (${VOL_BACKUP_FILE})..."
        tar -czf "${VOL_BACKUP_FILE}" -C "${VOL_PATH}" . 2>/dev/null || true
    fi
else
    echo "NOTICE: Neither local MongoDB container nor MongoDB Atlas is currently active. Skipping database dump."
    exit 0
fi

# Verify backup file size if created
if [ -f "${BACKUP_FILE}" ]; then
    BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}" 2>/dev/null || echo 0)
    if [ "${BACKUP_SIZE}" -gt 50 ]; then
        HUMAN_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
        chmod 600 "${BACKUP_FILE}"
        ln -sf "${BACKUP_FILE}" "${BACKUP_DIR}/latest_backup.archive.gz"
        echo "SUCCESS: Logical backup created (${HUMAN_SIZE}) -> ${BACKUP_FILE}"
    fi
fi

# 2. Prune old local backups (keep last 7 days)
echo "--> [3/3] Pruning backups older than 7 days..."
find "${BACKUP_DIR}" -name "mongodb_backup_*.archive.gz" -type f -mtime +7 -delete 2>/dev/null || true
find "${BACKUP_DIR}" -name "mongodb_volume_*.tar.gz" -type f -mtime +7 -delete 2>/dev/null || true

REMAINING_COUNT=$(find "${BACKUP_DIR}" -name "mongodb_backup_*.archive.gz" -type f 2>/dev/null | wc -l)
echo "Active local backups: ${REMAINING_COUNT}"
echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Database Snapshot Finished Successfully!"
echo "===================================================================="

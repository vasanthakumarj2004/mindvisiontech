#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Automated MongoDB Hot Backup Script
# Creates a compressed, point-in-time snapshot of MongoDB using mongodump.
# Uploads offsite to AWS S3 (if configured) and prunes local backups older than 7 days.
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

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Automated MongoDB Backup"
echo "===================================================================="

# Load environment variables
if [ -f "${ENV_FILE}" ]; then
    export $(grep -E '^(MONGO_ROOT_USERNAME|MONGO_ROOT_PASSWORD|S3_BACKUP_BUCKET|MONGODB_URI)=' "${ENV_FILE}" | xargs)
elif [ -f "${APP_DIR}/server/.env" ]; then
    export $(grep -E '^(MONGO_ROOT_USERNAME|MONGO_ROOT_PASSWORD|S3_BACKUP_BUCKET|MONGODB_URI)=' "${APP_DIR}/server/.env" | xargs)
elif [ -f "${APP_DIR}/.env" ]; then
    export $(grep -E '^(MONGO_ROOT_USERNAME|MONGO_ROOT_PASSWORD|S3_BACKUP_BUCKET|MONGODB_URI)=' "${APP_DIR}/.env" | xargs)
fi

# Fallback password extraction from MONGODB_URI if not set explicitly
if [ -z "${MONGO_ROOT_PASSWORD:-}" ] && [ -n "${MONGODB_URI:-}" ]; then
    PARSED_PASS=$(echo "${MONGODB_URI}" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
    if [ -n "${PARSED_PASS}" ]; then
        MONGO_ROOT_PASSWORD="${PARSED_PASS}"
    fi
fi

MONGO_USER="${MONGO_ROOT_USERNAME:-mindvision_admin}"
MONGO_PASS="${MONGO_ROOT_PASSWORD:-replace-with-a-local-password}"
CONTAINER_NAME="mindvisiontech-mongodb-prod"


# Verify MongoDB container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Check fallback container name
    if docker ps --format '{{.Names}}' | grep -q "mongodb"; then
        CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep "mongodb" | head -n 1)
        echo "Using active container: ${CONTAINER_NAME}"
    else
        echo "ERROR: MongoDB container is not running! Cannot execute backup."
        exit 1
    fi
fi

# Execute non-blocking hot backup via mongodump streaming directly to gzip
echo "--> [1/4] Dumping and compressing MongoDB database to ${BACKUP_FILE}..."
docker exec "${CONTAINER_NAME}" mongodump \
    --username "${MONGO_USER}" \
    --password "${MONGO_PASS}" \
    --authenticationDatabase admin \
    --archive \
    --gzip > "${BACKUP_FILE}"

# Verify backup integrity
BACKUP_SIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}" 2>/dev/null || echo 0)
if [ "${BACKUP_SIZE}" -le 100 ]; then
    echo "ERROR: Backup file is empty or suspiciously small (${BACKUP_SIZE} bytes)! Backup failed."
    rm -f "${BACKUP_FILE}"
    exit 1
fi

HUMAN_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "SUCCESS: Backup created successfully (${HUMAN_SIZE})."

# Secure backup file permissions (read-only by owner)
chmod 600 "${BACKUP_FILE}"

# Create a symlink to latest backup
ln -sf "${BACKUP_FILE}" "${BACKUP_DIR}/latest_backup.archive.gz"

# 2. Upload to AWS S3 (Offsite Disaster Recovery)
if [ -n "${S3_BACKUP_BUCKET:-}" ]; then
    echo "--> [2/4] Uploading backup to AWS S3: s3://${S3_BACKUP_BUCKET}/backups/..."
    if command -v aws &>/dev/null; then
        aws s3 cp "${BACKUP_FILE}" "s3://${S3_BACKUP_BUCKET}/backups/$(basename "${BACKUP_FILE}")" \
            --storage-class STANDARD_IA
        echo "SUCCESS: Offsite backup synced to Amazon S3."
    else
        echo "WARNING: AWS CLI not installed. Skipping S3 upload."
    fi
else
    echo "--> [2/4] S3_BACKUP_BUCKET not set. Backup stored locally on disk."
fi

# 3. Prune old local backups (keep last 7 days)
echo "--> [3/4] Pruning local backups older than 7 days..."
DELETED_COUNT=$(find "${BACKUP_DIR}" -name "mongodb_backup_*.archive.gz" -type f -mtime +7 -delete -print | wc -l)
echo "Cleaned up ${DELETED_COUNT} expired backup file(s)."

# 4. Summary
REMAINING_COUNT=$(find "${BACKUP_DIR}" -name "mongodb_backup_*.archive.gz" -type f | wc -l)
echo "--> [4/4] Active local backups: ${REMAINING_COUNT}"
echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup Completed Successfully!"
echo "Latest Backup: ${BACKUP_DIR}/latest_backup.archive.gz"
echo "===================================================================="

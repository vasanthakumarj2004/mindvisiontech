#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech MongoDB Restoration & Atlas Migration Script
# Restores a compressed mongodump archive with optional --drop flag.
# Usage:
#   ./restore-db.sh                            (restores latest local backup)
#   ./restore-db.sh [backup_file_path]         (restores specific archive)
#   ./restore-db.sh --to-atlas [ATLAS_URI]     (migrates latest backup to MongoDB Atlas)
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

echo "===================================================================="
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MindVisionTech Database Restoration & Migration"
echo "===================================================================="

# Load credentials safely (supporting quotes and URI special characters)
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}" 2>/dev/null || true
    set +a
fi

# Locate latest backup file
TARGET_BACKUP="${BACKUP_DIR}/latest_backup.archive.gz"
if [ ! -f "${TARGET_BACKUP}" ]; then
    TARGET_BACKUP=$(find "${BACKUP_DIR}" -name "mongodb_backup_*.archive.gz" 2>/dev/null | sort -r | head -n 1 || true)
fi

# Check for --to-atlas mode
if [ "${1:-}" == "--to-atlas" ]; then
    ATLAS_URI="${2:-${MONGODB_URI:-}}"
    if [[ "${ATLAS_URI}" != *"mongodb+srv://"* && "${ATLAS_URI}" != *"mongodb://"* ]]; then
        echo "ERROR: Please specify a valid MongoDB Atlas URI: ./restore-db.sh --to-atlas 'mongodb+srv://...'"
        exit 1
    fi

    if [ -z "${TARGET_BACKUP}" ] || [ ! -f "${TARGET_BACKUP}" ]; then
        echo "ERROR: No backup archive found in ${BACKUP_DIR} to restore!"
        exit 1
    fi

    echo "--> Migrating backup ($(basename "${TARGET_BACKUP}")) to MongoDB Atlas..."
    docker run --rm -v "${BACKUP_DIR}:/backups" mongo:7.0 mongorestore \
        --uri="${ATLAS_URI}" \
        --archive="/backups/$(basename "${TARGET_BACKUP}")" \
        --gzip \
        --drop \
        --nsInclude="mindvisiontech.*"

    echo "SUCCESS: Data successfully migrated to MongoDB Atlas!"
    exit 0
fi

# Local Container Restore Mode
CONTAINER_NAME="mindvisiontech-mongodb-prod"
MONGO_USER="${MONGO_ROOT_USERNAME:-mindvision_admin}"
MONGO_PASS="${MONGO_ROOT_PASSWORD:-mindvision_prod_pass}"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "ERROR: Local MongoDB container (${CONTAINER_NAME}) is not running!"
    exit 1
fi

if [ -z "${TARGET_BACKUP}" ] || [ ! -f "${TARGET_BACKUP}" ]; then
    echo "ERROR: No valid backup archive found to restore in ${BACKUP_DIR}."
    exit 1
fi

echo "Restoring ${TARGET_BACKUP} into local container ${CONTAINER_NAME}..."
cat "${TARGET_BACKUP}" | docker exec -i "${CONTAINER_NAME}" mongorestore \
    --username "${MONGO_USER}" \
    --password "${MONGO_PASS}" \
    --authenticationDatabase admin \
    --archive \
    --gzip \
    --drop

echo "SUCCESS: Local MongoDB restored from ${TARGET_BACKUP}."

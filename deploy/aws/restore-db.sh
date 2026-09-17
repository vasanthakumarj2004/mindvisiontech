#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech MongoDB Restoration Script
# Restores a compressed mongodump archive with optional --drop flag.
# Usage:
#   ./restore-db.sh [backup_file_path] [--force]
#   ./restore-db.sh                       (restores latest local backup)
#   ./restore-db.sh --from-s3             (downloads & restores latest S3 backup)
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
echo "[$(date '+%Y-%m-%d %H:%M:%S')] MindVisionTech Database Restoration"
echo "===================================================================="

# Load credentials
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
    if docker ps --format '{{.Names}}' | grep -q "mongodb"; then
        CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep "mongodb" | head -n 1)
    else
        echo "ERROR: MongoDB container is not running! Cannot execute restore."
        exit 1
    fi
fi

# Determine target backup file
INPUT_TARGET="${1:-}"
FORCE_MODE=0
if [[ "$*" == *"--force"* ]]; then
    FORCE_MODE=1
fi

if [ "${INPUT_TARGET}" == "--from-s3" ]; then
    if [ -z "${S3_BACKUP_BUCKET:-}" ]; then
        echo "ERROR: S3_BACKUP_BUCKET is not configured in .env.production!"
        exit 1
    fi
    echo "--> Fetching latest backup from s3://${S3_BACKUP_BUCKET}/backups/..."
    LATEST_S3_KEY=$(aws s3 ls "s3://${S3_BACKUP_BUCKET}/backups/" | sort | tail -n 1 | awk '{print $4}')
    if [ -z "${LATEST_S3_KEY}" ]; then
        echo "ERROR: No backups found in S3 bucket!"
        exit 1
    fi
    mkdir -p "${BACKUP_DIR}"
    TARGET_BACKUP="${BACKUP_DIR}/${LATEST_S3_KEY}"
    echo "Downloading ${LATEST_S3_KEY} from S3..."
    aws s3 cp "s3://${S3_BACKUP_BUCKET}/backups/${LATEST_S3_KEY}" "${TARGET_BACKUP}"
elif [ -n "${INPUT_TARGET}" ] && [ -f "${INPUT_TARGET}" ]; then
    TARGET_BACKUP="${INPUT_TARGET}"
elif [ -f "${BACKUP_DIR}/latest_backup.archive.gz" ]; then
    TARGET_BACKUP="${BACKUP_DIR}/latest_backup.archive.gz"
else
    # Find most recent file matching pattern
    TARGET_BACKUP=$(find "${BACKUP_DIR}" -name "mongodb_backup_*.archive.gz" 2>/dev/null | sort -r | head -n 1 || true)
fi

if [ -z "${TARGET_BACKUP:-}" ] || [ ! -f "${TARGET_BACKUP}" ]; then
    echo "ERROR: No valid backup archive found to restore! Check ${BACKUP_DIR}."
    exit 1
fi

echo "Selected Backup File: ${TARGET_BACKUP}"
echo "Target Container:     ${CONTAINER_NAME}"
echo "Target Database:      mindvisiontech"
echo ""

if [ "${FORCE_MODE}" -ne 1 ]; then
    echo "WARNING: This operation will overwrite and replace existing database collections!"
    read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
    if [ "${CONFIRM}" != "yes" ]; then
        echo "Restoration aborted by user."
        exit 0
    fi
fi

# Execute mongorestore with --drop to cleanly restore collections
echo "--> Restoring database from archive..."
cat "${TARGET_BACKUP}" | docker exec -i "${CONTAINER_NAME}" mongorestore \
    --username "${MONGO_USER}" \
    --password "${MONGO_PASS}" \
    --authenticationDatabase admin \
    --archive \
    --gzip \
    --drop

echo ""
echo "--> Verifying database connection and collections..."
docker exec "${CONTAINER_NAME}" mongosh \
    --quiet \
    --username "${MONGO_USER}" \
    --password "${MONGO_PASS}" \
    --authenticationDatabase admin \
    --eval "use mindvisiontech; print('Collections restored: ' + db.getCollectionNames().join(', ')); print('Total leads: ' + db.leads.countDocuments());"

echo "===================================================================="
echo " SUCCESS: Database successfully restored from ${TARGET_BACKUP}!"
echo "===================================================================="

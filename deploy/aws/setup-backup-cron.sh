#!/usr/bin/env bash
# ==============================================================================
# MindVisionTech Automated Backup Cron Job Installer
# Configures a daily cron job at 02:00 AM UTC to snapshot and backup MongoDB.
# ==============================================================================

set -euo pipefail

CRON_CMD="/opt/mindvisiontech/deploy/aws/backup-db.sh"
CRON_JOB="0 2 * * * ${CRON_CMD} > /dev/null 2>&1"

echo "Configuring daily automated MongoDB backup cron job..."

if [ ! -f "${CRON_CMD}" ]; then
    echo "ERROR: Backup script not found at ${CRON_CMD}!"
    exit 1
fi

chmod +x "${CRON_CMD}"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -F "${CRON_CMD}"; then
    echo "Cron job already exists. Current crontab:"
    crontab -l | grep -F "${CRON_CMD}"
else
    # Append job safely
    (crontab -l 2>/dev/null || true; echo "${CRON_JOB}") | crontab -
    echo "SUCCESS: Cron job installed successfully!"
    echo "Scheduled: Daily at 02:00 AM UTC"
fi

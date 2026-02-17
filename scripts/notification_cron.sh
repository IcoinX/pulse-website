#!/bin/bash
# F1: Notification Worker Cron Entry
# Runs every 30 seconds
# 
# Add to crontab: */1 * * * * /data/.openclaw/workspace/pulse-website/scripts/notification_cron.sh
# (uses flock to prevent overlapping runs)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCK_FILE="/tmp/pulse_notification_worker.lock"
LOG_FILE="/data/.openclaw/logs/notifications.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Export env vars from .env file if exists
if [ -f "$SCRIPT_DIR/../.env.local" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/../.env.local" | xargs)
fi

# Run twice per minute (at :00 and :30)
# Using flock to prevent overlapping executions
(
  flock -n 200 || exit 0
  
  echo "[$(date -Iseconds)] Starting notification worker" >> "$LOG_FILE"
  
  cd "$SCRIPT_DIR/.." && node scripts/notification_worker.js 2>&1 >> "$LOG_FILE"
  
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -ne 0 ]; then
    echo "[$(date -Iseconds)] Worker failed with code $EXIT_CODE" >> "$LOG_FILE"
  fi
  
) 200>"$LOCK_FILE"

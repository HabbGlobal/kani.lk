#!/usr/bin/env bash
# Nightly backup: mongodump -> gzip -> object storage.
# Only backs up kani_* collections, so it never touches the other application's
# data sharing this MongoDB instance (see CLAUDE.md's database note).
#
# Requires: mongodump (mongodb-database-tools), aws-cli (or any S3-compatible
# CLI — rclone works too, adjust the upload line).
#
# Env vars expected (set in the crontab entry or a sourced .env file):
#   MONGODB_URI          - same connection string the app uses
#   BACKUP_BUCKET         - e.g. s3://kani-backups
#   BACKUP_RETENTION_DAYS - local retention before pruning (default 7)

set -euo pipefail

MONGODB_URI="${MONGODB_URI:?MONGODB_URI is not set}"
BACKUP_BUCKET="${BACKUP_BUCKET:?BACKUP_BUCKET is not set, e.g. s3://kani-backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
WORKDIR="/tmp/kani-backup-${TIMESTAMP}"
ARCHIVE="/tmp/kani-backup-${TIMESTAMP}.gz"

mkdir -p "$WORKDIR"
trap 'rm -rf "$WORKDIR" "$ARCHIVE"' EXIT

echo "[backup] dumping kani_* collections..."
COLLECTIONS=(
  kani_lands kani_images kani_districts kani_cities kani_land_types
  kani_inquiries kani_admin_users kani_site_settings kani_pages
)

for col in "${COLLECTIONS[@]}"; do
  mongodump --uri="$MONGODB_URI" --collection="$col" --out="$WORKDIR" --gzip
done

tar -czf "$ARCHIVE" -C "$WORKDIR" .

echo "[backup] uploading to ${BACKUP_BUCKET}/${TIMESTAMP}.tar.gz"
aws s3 cp "$ARCHIVE" "${BACKUP_BUCKET}/${TIMESTAMP}.tar.gz"

echo "[backup] pruning backups older than ${RETENTION_DAYS} days from bucket listing"
aws s3 ls "$BACKUP_BUCKET/" | while read -r line; do
  fileDate=$(echo "$line" | awk '{print $1}')
  fileName=$(echo "$line" | awk '{print $4}')
  [ -z "$fileName" ] && continue
  fileAgeDays=$(( ($(date +%s) - $(date -d "$fileDate" +%s)) / 86400 ))
  if [ "$fileAgeDays" -gt "$RETENTION_DAYS" ]; then
    echo "[backup] removing old backup: $fileName"
    aws s3 rm "${BACKUP_BUCKET}/${fileName}"
  fi
done

echo "[backup] done — ${TIMESTAMP}"

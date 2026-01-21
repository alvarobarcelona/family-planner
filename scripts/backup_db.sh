#!/bin/bash
set -o pipefail

# Configuration
CONTAINER_NAME="family-planner-db"
DB_NAME="family_planner"
# Changed to relative path for Windows/Local compatibility
BACKUP_DIR="./backups"
RETENTION_DAYS=7

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

echo "➡️  Starting backup process for '$DB_NAME'..."

# STRATEGY 1: TRY DOCKER
if command -v docker &> /dev/null && docker ps -q -f name="$CONTAINER_NAME" &> /dev/null; then
  echo "🐳 Docker detected."
  # Assumes 'admin' user inside docker, or whatever is default.
  # Using 'admin' as per your original docker-compose.
  # Removed -t to avoid TTY issues in some scripts/crons, though usually fine.
  docker exec "$CONTAINER_NAME" pg_dump -U admin "$DB_NAME" | gzip > "$FILENAME"

# STRATEGY 2: NATIVE POSTGRES (PEER AUTH) -> RECOMMENDED FOR ROOT
elif command -v pg_dump &> /dev/null; then
  echo "🖥️  Using native installation (Peer Auth)..."
  # We run as 'postgres' user directly. No password needed.
  # We verify if the database exists first to avoid empty files
  if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
      if sudo -u postgres pg_dump "$DB_NAME" | gzip > "$FILENAME"; then
        echo "✅ Backup successful: $FILENAME"
      else
        echo "❌ pg_dump command failed."
        exit 1
      fi
  else
      echo "❌ Error: Database '$DB_NAME' does not exist in this postgres instance."
      echo "   Existing databases:"
      sudo -u postgres psql -lqt | cut -d \| -f 1
      exit 1
  fi

else
  echo "❌ Error: Neither docker nor postgres commands found."
  exit 1
fi

# Cleanup
if [ -s "$FILENAME" ]; then
  FILE_SIZE=$(du -h "$FILENAME" | cut -f1)
  echo "✅ Backup created successfully."
  echo "   Path: $FILENAME"
  echo "   Size: $FILE_SIZE"
  
  echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
  echo "✨ Done."
else
  # If file is empty or missing despite success code
  echo "warn: File is empty or creation failed."
  rm -f "$FILENAME"
  exit 1
fi

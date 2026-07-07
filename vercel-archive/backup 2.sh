#!/bin/bash
# Backup script for xyfoptics website
# Keeps max 20 backups

SITE_DIR="/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站"
BACKUP_DIR="/Users/xiongyifeng/Documents/02-个人/01-个人网站/个人简历网站备份"
MAX_BACKUPS=20

cd "$SITE_DIR"

# Extract version from data.js
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' data.js | sed 's/.*"\([^"]*\)".*/\1/')
TIMESTAMP=$(date +%H%M)
BACKUP_NAME="v${VERSION}-${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

if [ -d "$BACKUP_PATH" ]; then
    echo "Backup already exists: $BACKUP_NAME"
    exit 0
fi

cp -R "$SITE_DIR" "$BACKUP_PATH"
rm -f "$BACKUP_PATH/.DS_Store"

echo "Created backup: $BACKUP_NAME"

# Count existing backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR" | wc -l | tr -d ' ')

if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    # Remove oldest backups
    TO_REMOVE=$(ls -1 "$BACKUP_DIR" | sort | head -n $((BACKUP_COUNT - MAX_BACKUPS)))
    for old in $TO_REMOVE; do
        rm -rf "$BACKUP_DIR/$old"
        echo "Removed old backup: $old"
    done
fi

echo "Total backups: $(ls -1 "$BACKUP_DIR" | wc -l | tr -d ' ')"

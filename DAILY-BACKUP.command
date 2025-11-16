#!/bin/bash

# KFresh Daily Backup Script
# Double-click this file to run a backup

echo "🔐 KFresh ULTRA-SAFE Backup System"
echo "=================================="
echo ""

# Navigate to the correct directory
cd "/Volumes/C/KF App/kfresh-admin"

# Run the backup
echo "Starting backup..."
node backup-ULTRA-SAFE.js

echo ""
echo "=================================="
echo "✅ Backup Complete!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Upload backup files to Google Drive"
echo "   2. Keep for at least 30 days"
echo ""
echo "📁 Backup location:"
echo "   /Volumes/C/KF App/kfresh-admin/backups/"
echo ""
echo "Press any key to open backup folder..."
read -n 1

open "/Volumes/C/KF App/kfresh-admin/backups"

echo ""
echo "Done! You can close this window."
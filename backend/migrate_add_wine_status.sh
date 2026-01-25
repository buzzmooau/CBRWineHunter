#!/bin/bash
# Safe Migration: Add 'status' field to wines table
# Date: 2026-01-25
# Purpose: Enable staging/review workflow for scraped wines

set -e  # Exit on any error

BACKUP_FILE="/tmp/wines_backup_$(date +%Y%m%d_%H%M%S).sql"
DB_HOST="192.168.50.120"
DB_NAME="cbr_wine_hunter"
DB_USER="wineuser"
DB_PASSWORD="20B3ans25"

echo "========================================================================"
echo "WINE STATUS MIGRATION - ADDING STAGING WORKFLOW"
echo "========================================================================"
echo ""
echo "This migration will:"
echo "  1. Backup current wines table"
echo "  2. Add 'status' column (VARCHAR(20), default 'live')"
echo "  3. Set all existing wines to 'live' status"
echo "  4. Create index on status column"
echo ""
echo "Rollback instructions will be saved to: ${BACKUP_FILE}.rollback"
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Step 1: Creating backup..."
echo "----------------------------------------------------------------------"

# Backup wines table
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -t wines --data-only > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    echo "   Size: $(ls -lh $BACKUP_FILE | awk '{print $5}')"
else
    echo "❌ Backup failed! Aborting migration."
    exit 1
fi

echo ""
echo "Step 2: Checking current table structure..."
echo "----------------------------------------------------------------------"

# Check if status column already exists
COLUMN_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -tAc \
    "SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name='wines' AND column_name='status'")

if [ "$COLUMN_EXISTS" -gt 0 ]; then
    echo "⚠️  Status column already exists! Skipping migration."
    exit 0
fi

echo "✅ Ready to add status column"

echo ""
echo "Step 3: Running migration..."
echo "----------------------------------------------------------------------"

# Run migration SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME <<EOF

-- Start transaction
BEGIN;

-- Add status column with default 'live'
ALTER TABLE wines 
ADD COLUMN status VARCHAR(20) DEFAULT 'live' NOT NULL;

-- Update all existing wines to 'live' status
UPDATE wines SET status = 'live';

-- Add index for performance
CREATE INDEX idx_wines_status ON wines(status);

-- Verify migration
SELECT 
    COUNT(*) as total_wines,
    COUNT(CASE WHEN status = 'live' THEN 1 END) as live_wines,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_wines
FROM wines;

-- Commit transaction
COMMIT;

-- Show updated table structure
\d wines

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
else
    echo ""
    echo "❌ Migration failed! Database unchanged (transaction rolled back)"
    exit 1
fi

echo ""
echo "Step 4: Creating rollback script..."
echo "----------------------------------------------------------------------"

# Create rollback script
cat > "${BACKUP_FILE}.rollback" <<'ROLLBACK_SCRIPT'
#!/bin/bash
# ROLLBACK SCRIPT - Removes status column and restores original state
# Created: $(date)

set -e

BACKUP_FILE="BACKUP_FILE_PLACEHOLDER"
DB_HOST="192.168.50.120"
DB_NAME="cbr_wine_hunter"
DB_USER="wineuser"
DB_PASSWORD="20B3ans25"

echo "========================================================================"
echo "ROLLBACK: Removing status column"
echo "========================================================================"
echo ""
echo "⚠️  WARNING: This will remove the 'status' column from wines table"
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

echo ""
echo "Running rollback..."

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME <<EOF

BEGIN;

-- Drop index
DROP INDEX IF EXISTS idx_wines_status;

-- Remove status column
ALTER TABLE wines DROP COLUMN IF EXISTS status;

COMMIT;

-- Show updated table structure
\d wines

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Rollback completed successfully!"
    echo ""
    echo "If you need to restore data, the backup is at: $BACKUP_FILE"
    echo "To restore: PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME < $BACKUP_FILE"
else
    echo ""
    echo "❌ Rollback failed!"
    exit 1
fi

ROLLBACK_SCRIPT

# Replace placeholder with actual backup file path
sed -i "s|BACKUP_FILE_PLACEHOLDER|$BACKUP_FILE|g" "${BACKUP_FILE}.rollback"
chmod +x "${BACKUP_FILE}.rollback"

echo "✅ Rollback script created: ${BACKUP_FILE}.rollback"

echo ""
echo "========================================================================"
echo "MIGRATION COMPLETE!"
echo "========================================================================"
echo ""
echo "Summary:"
echo "  ✅ Backup created: $BACKUP_FILE"
echo "  ✅ Status column added to wines table"
echo "  ✅ All existing wines set to 'live' status"
echo "  ✅ Index created on status column"
echo "  ✅ Rollback script ready: ${BACKUP_FILE}.rollback"
echo ""
echo "Next steps:"
echo "  1. Test the new column: SELECT status, COUNT(*) FROM wines GROUP BY status;"
echo "  2. Update scraper to use 'pending' status for new wines"
echo "  3. Build review UI in admin dashboard"
echo ""
echo "To rollback this migration, run: ${BACKUP_FILE}.rollback"
echo ""
echo "========================================================================"

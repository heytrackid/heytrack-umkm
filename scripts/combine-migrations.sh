#!/bin/bash

# Script to combine all migration files into one

echo "Combining migration files..."

OUTPUT_FILE="supabase/migrations/complete_migration.sql"

# Remove old combined file if exists
rm -f "$OUTPUT_FILE"

# Add header
cat > "$OUTPUT_FILE" << 'EOF'
-- ============================================================================
-- HeyTrack Complete Database Migration
-- ============================================================================
-- This file contains all migrations combined into one
-- Compatible with Stack Auth JWT authentication
-- Generated: $(date)
-- ============================================================================

EOF

# Combine all migration files in order
for file in supabase/migrations/0*.sql; do
    if [ -f "$file" ]; then
        echo "" >> "$OUTPUT_FILE"
        echo "-- ============================================================================" >> "$OUTPUT_FILE"
        echo "-- Source: $(basename $file)" >> "$OUTPUT_FILE"
        echo "-- ============================================================================" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "✓ Combined migration created: $OUTPUT_FILE"
echo ""
echo "You can now run this single file in Supabase SQL Editor"

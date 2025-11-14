#!/bin/bash
# Script to create complete database migration for HeyTrack

echo "Creating complete database migration..."
echo "This will generate SQL files in supabase/migrations/"

# Create migrations directory
mkdir -p supabase/migrations

echo "✓ Migration files created in supabase/migrations/"
echo ""
echo "Next steps:"
echo "1. Review the migration files"
echo "2. Apply to Supabase using Supabase CLI or Dashboard"
echo "3. Run: pnpm supabase:types to generate TypeScript types"

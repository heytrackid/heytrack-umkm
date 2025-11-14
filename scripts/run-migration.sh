#!/bin/bash

# HeyTrack Database Migration Script
# This script runs all migration files in order

set -e  # Exit on error

echo "🚀 HeyTrack Database Migration"
echo "================================"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Install with: npm install -g supabase"
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if project is linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "❌ Project not linked to Supabase!"
    echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "✓ Project linked"
echo ""

# Confirm before proceeding
read -p "⚠️  This will apply all migrations. Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "📦 Applying migrations..."
echo ""

# Apply migrations
supabase db push

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "Next steps:"
echo "1. Generate TypeScript types: pnpm supabase:types"
echo "2. Test authentication with Stack Auth"
echo "3. Verify RLS policies"
echo "4. Run application: pnpm dev"
echo ""

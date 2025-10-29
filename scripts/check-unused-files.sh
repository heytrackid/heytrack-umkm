#!/bin/bash

# Script to check if files are unused
# Usage: ./scripts/check-unused-files.sh

echo "🔍 Checking for unused files..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file_usage() {
    local file=$1
    local filename=$(basename "$file" | sed 's/\.[^.]*$//')
    
    # Count imports (excluding the file itself)
    local count=$(grep -r "from.*['\"].*${filename}" src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "^${file}:" | wc -l | tr -d ' ')
    
    if [ "$count" -eq 0 ]; then
        echo -e "${RED}❌ UNUSED${NC}: $file (0 imports)"
        return 1
    elif [ "$count" -lt 3 ]; then
        echo -e "${YELLOW}⚠️  LOW USAGE${NC}: $file ($count imports)"
        return 2
    else
        echo -e "${GREEN}✅ USED${NC}: $file ($count imports)"
        return 0
    fi
}

echo "=== PRIORITY 1: Deprecated Files ==="
check_file_usage "src/hooks/responsive/compatibility.ts"
echo ""

echo "=== PRIORITY 2: Potential Duplicates ==="
files=(
    "src/lib/api-core.ts"
    "src/lib/automation-engine.ts"
    "src/lib/business-services.ts"
    "src/lib/communications.ts"
    "src/lib/cron.ts"
    "src/lib/errors.ts"
    "src/lib/validations.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_file_usage "$file"
    fi
done
echo ""

echo "=== PRIORITY 2: Potentially Consolidated ==="
files=(
    "src/lib/debounce.ts"
    "src/lib/ingredients-toast.ts"
    "src/lib/toast-helpers.ts"
    "src/lib/supabase-helpers.ts"
    "src/lib/supabase-typed-client.ts"
    "src/lib/error-handler.ts"
    "src/lib/api-helpers.ts"
    "src/lib/data-synchronization.ts"
    "src/lib/query-optimization.ts"
    "src/lib/settings-validation.ts"
    "src/lib/type-guards.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        check_file_usage "$file"
    fi
done
echo ""

echo "=== Summary ==="
echo "Run this script to identify unused files before deletion"
echo "Files marked as UNUSED can likely be safely deleted"
echo "Files with LOW USAGE should be reviewed manually"
echo ""
echo "After deleting files, run: pnpm type-check"

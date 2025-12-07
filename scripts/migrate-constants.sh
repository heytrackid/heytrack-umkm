#!/bin/bash

# HeyTrack Constants Migration Script
# This script helps migrate hardcoded status values to centralized constants

set -e

echo "🔍 HeyTrack Constants Migration Tool"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to count occurrences
count_occurrences() {
    local pattern=$1
    local count=$(grep -r "$pattern" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l)
    echo $count
}

# Check for hardcoded status values
echo "📊 Scanning for hardcoded values..."
echo ""

PENDING_COUNT=$(count_occurrences "=== 'PENDING'")
CONFIRMED_COUNT=$(count_occurrences "=== 'CONFIRMED'")
IN_PROGRESS_COUNT=$(count_occurrences "=== 'IN_PROGRESS'")
DELIVERED_COUNT=$(count_occurrences "=== 'DELIVERED'")
CANCELLED_COUNT=$(count_occurrences "=== 'CANCELLED'")

TOTAL=$((PENDING_COUNT + CONFIRMED_COUNT + IN_PROGRESS_COUNT + DELIVERED_COUNT + CANCELLED_COUNT))

echo "Hardcoded Status Values Found:"
echo "  - 'PENDING': $PENDING_COUNT"
echo "  - 'CONFIRMED': $CONFIRMED_COUNT"
echo "  - 'IN_PROGRESS': $IN_PROGRESS_COUNT"
echo "  - 'DELIVERED': $DELIVERED_COUNT"
echo "  - 'CANCELLED': $CANCELLED_COUNT"
echo "  ${YELLOW}Total: $TOTAL${NC}"
echo ""

# Check for inline Zod schemas
INLINE_SCHEMAS=$(grep -r "z\.object({" src/app/api/ --include="*.ts" 2>/dev/null | wc -l)
echo "Inline Zod Schemas in API Routes: ${YELLOW}$INLINE_SCHEMAS${NC}"
echo ""

# Check for PascalCase component files
PASCAL_CASE=$(find src/components src/modules -name "[A-Z]*.tsx" 2>/dev/null | wc -l)
echo "PascalCase Component Files: ${YELLOW}$PASCAL_CASE${NC}"
echo ""

# Check for 'any' types
ANY_TYPES=$(grep -r ": any" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "'any' Type Usage: ${YELLOW}$ANY_TYPES${NC}"
echo ""

echo "===================================="
echo ""

# Offer to show files
read -p "Show files with hardcoded status values? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Files with hardcoded 'PENDING':"
    grep -r "=== 'PENDING'" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null || echo "  None found"
    echo ""
    echo "Files with hardcoded 'CONFIRMED':"
    grep -r "=== 'CONFIRMED'" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null || echo "  None found"
    echo ""
fi

echo ""
echo "📚 Next Steps:"
echo "  1. Review STANDARDIZATION_GUIDE.md for migration instructions"
echo "  2. Use STANDARDIZATION_QUICK_REF.md for quick reference"
echo "  3. Import from @/lib/shared/constants instead of hardcoding"
echo "  4. Import from @/lib/validations/common for schemas"
echo ""
echo "${GREEN}✅ Scan complete!${NC}"

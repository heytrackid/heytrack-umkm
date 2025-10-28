#!/bin/bash

# Cleanup Old Ingredients Files
# This script removes deprecated ingredients components and stores
# Run this after verifying the new enhanced components are working

set -e  # Exit on error

echo "🧹 Ingredients Cleanup Script"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Not found: $1"
        return 1
    fi
}

# Function to delete file safely
delete_file() {
    if [ -f "$1" ]; then
        rm "$1"
        echo -e "${GREEN}✓${NC} Deleted: $1"
    else
        echo -e "${YELLOW}⚠${NC} Already deleted: $1"
    fi
}

echo "Step 1: Checking files to delete..."
echo "-----------------------------------"

FILES_TO_DELETE=(
    "src/components/forms/IngredientForm.tsx"
    "src/components/crud/ingredients-crud.tsx"
    "src/components/forms/shared/IngredientFormFields.tsx"
    "src/lib/stores/ingredients-store.ts"
)

FOUND_COUNT=0
for file in "${FILES_TO_DELETE[@]}"; do
    if check_file "$file"; then
        ((FOUND_COUNT++))
    fi
done

echo ""
echo "Found $FOUND_COUNT files to delete"
echo ""

# Confirmation
read -p "Do you want to proceed with deletion? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Cleanup cancelled${NC}"
    exit 0
fi

echo ""
echo "Step 2: Deleting old files..."
echo "-----------------------------"

for file in "${FILES_TO_DELETE[@]}"; do
    delete_file "$file"
done

echo ""
echo "Step 3: Running type check..."
echo "-----------------------------"

if npm run type-check; then
    echo -e "${GREEN}✓${NC} Type check passed"
else
    echo -e "${RED}✗${NC} Type check failed"
    echo ""
    echo "Rolling back changes..."
    git checkout -- "${FILES_TO_DELETE[@]}"
    echo -e "${RED}Cleanup failed and rolled back${NC}"
    exit 1
fi

echo ""
echo "Step 4: Running linter..."
echo "-------------------------"

if npm run lint; then
    echo -e "${GREEN}✓${NC} Lint passed"
else
    echo -e "${YELLOW}⚠${NC} Lint warnings (non-critical)"
fi

echo ""
echo "Step 5: Verification..."
echo "-----------------------"

# Check if new components exist
NEW_COMPONENTS=(
    "src/components/ingredients/EnhancedIngredientsPage.tsx"
    "src/components/ingredients/EnhancedIngredientForm.tsx"
    "src/components/ingredients/StockBadge.tsx"
    "src/lib/ingredients-toast.ts"
)

ALL_EXIST=true
for component in "${NEW_COMPONENTS[@]}"; do
    if [ ! -f "$component" ]; then
        echo -e "${RED}✗${NC} Missing new component: $component"
        ALL_EXIST=false
    else
        echo -e "${GREEN}✓${NC} New component exists: $component"
    fi
done

if [ "$ALL_EXIST" = false ]; then
    echo -e "${RED}Some new components are missing!${NC}"
    exit 1
fi

echo ""
echo "=============================="
echo -e "${GREEN}✓ Cleanup completed successfully!${NC}"
echo "=============================="
echo ""
echo "Summary:"
echo "- Deleted $FOUND_COUNT old files"
echo "- Type check: PASSED"
echo "- All new components: VERIFIED"
echo ""
echo "Next steps:"
echo "1. Test the ingredients page manually"
echo "2. Run: npm test (if you have tests)"
echo "3. Commit changes:"
echo "   git add ."
echo "   git commit -m 'chore: remove old ingredients components'"
echo ""

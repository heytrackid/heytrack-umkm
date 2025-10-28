#!/bin/bash

# Codebase Cleanup Script
# Removes unused, duplicate, and deprecated files
# Run with: ./scripts/cleanup-codebase.sh

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 HeyTrack Codebase Cleanup${NC}"
echo "=============================="
echo ""

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
        return 0
    else
        echo -e "${YELLOW}⚠${NC} Already deleted: $1"
        return 1
    fi
}

# Function to remove empty directory
remove_empty_dir() {
    if [ -d "$1" ]; then
        if [ -z "$(ls -A $1)" ]; then
            rmdir "$1"
            echo -e "${GREEN}✓${NC} Removed empty dir: $1"
        else
            echo -e "${YELLOW}⚠${NC} Directory not empty: $1"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Directory not found: $1"
    fi
}

# ============================================
# PHASE 1: SAFE DELETIONS (LOW RISK)
# ============================================

echo -e "${BLUE}Phase 1: Safe Deletions (Low Risk)${NC}"
echo "-----------------------------------"
echo ""

echo "1.1 Duplicate Index Files"
echo "-------------------------"

DUPLICATE_INDEX_FILES=(
    "src/components/forms/index.tsx"
    "src/components/lazy/index.tsx"
)

for file in "${DUPLICATE_INDEX_FILES[@]}"; do
    check_file "$file"
done

echo ""
read -p "Delete duplicate index files? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for file in "${DUPLICATE_INDEX_FILES[@]}"; do
        delete_file "$file"
    done
fi

echo ""
echo "1.2 Root Index File"
echo "-------------------"

if check_file "src/index.ts"; then
    read -p "Delete root index.ts? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        delete_file "src/index.ts"
    fi
fi

echo ""
echo "1.3 Empty Directories"
echo "---------------------"

EMPTY_DIRS=(
    "src/agents/assistants"
    "src/agents/insights"
    "src/agents/workflows"
    "src/types/__tests__"
)

for dir in "${EMPTY_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} Found: $dir"
    else
        echo -e "${YELLOW}⚠${NC} Not found: $dir"
    fi
done

echo ""
read -p "Remove empty directories? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for dir in "${EMPTY_DIRS[@]}"; do
        remove_empty_dir "$dir"
    done
fi

echo ""
echo "1.4 Old Ingredients Files"
echo "-------------------------"

OLD_INGREDIENTS_FILES=(
    "src/components/forms/IngredientForm.tsx"
    "src/components/crud/ingredients-crud.tsx"
    "src/components/forms/shared/IngredientFormFields.tsx"
    "src/lib/stores/ingredients-store.ts"
)

for file in "${OLD_INGREDIENTS_FILES[@]}"; do
    check_file "$file"
done

echo ""
read -p "Delete old ingredients files? (y/N) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    for file in "${OLD_INGREDIENTS_FILES[@]}"; do
        delete_file "$file"
    done
fi

# ============================================
# VERIFICATION
# ============================================

echo ""
echo -e "${BLUE}Running Verification...${NC}"
echo "----------------------"

echo ""
echo "Type Check..."
if npm run type-check 2>&1 | tee /tmp/type-check.log; then
    echo -e "${GREEN}✓${NC} Type check passed"
else
    echo -e "${RED}✗${NC} Type check failed"
    echo ""
    echo "Errors found. Rolling back..."
    git checkout -- .
    echo -e "${RED}Cleanup failed and rolled back${NC}"
    exit 1
fi

echo ""
echo "Linter..."
if npm run lint 2>&1 | tee /tmp/lint.log; then
    echo -e "${GREEN}✓${NC} Lint passed"
else
    echo -e "${YELLOW}⚠${NC} Lint warnings (non-critical)"
fi

# ============================================
# PHASE 2: VERIFY USAGE (MEDIUM RISK)
# ============================================

echo ""
echo -e "${BLUE}Phase 2: Verify Usage (Medium Risk)${NC}"
echo "------------------------------------"
echo ""

echo "2.1 Checking Store Usage"
echo "------------------------"

STORES=(
    "customers-store"
    "expenses-store"
    "orders-store"
    "recipes-store"
    "reports-store"
)

UNUSED_STORES=()

for store in "${STORES[@]}"; do
    echo -n "Checking $store... "
    if grep -r "$store" src/ --include="*.tsx" --include="*.ts" --exclude-dir=stores > /dev/null 2>&1; then
        echo -e "${YELLOW}USED${NC}"
    else
        echo -e "${GREEN}NOT USED${NC}"
        UNUSED_STORES+=("src/lib/stores/${store}.ts")
    fi
done

if [ ${#UNUSED_STORES[@]} -gt 0 ]; then
    echo ""
    echo "Unused stores found:"
    for store in "${UNUSED_STORES[@]}"; do
        echo "  - $store"
    done
    
    echo ""
    read -p "Delete unused stores? (y/N) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for store in "${UNUSED_STORES[@]}"; do
            delete_file "$store"
        done
        
        # Re-run type check
        echo ""
        echo "Re-running type check..."
        if npm run type-check; then
            echo -e "${GREEN}✓${NC} Type check passed"
        else
            echo -e "${RED}✗${NC} Type check failed after store deletion"
            echo "Rolling back store deletions..."
            git checkout -- src/lib/stores/
            exit 1
        fi
    fi
fi

# ============================================
# SUMMARY
# ============================================

echo ""
echo "=============================="
echo -e "${GREEN}✓ Cleanup Complete!${NC}"
echo "=============================="
echo ""

# Count deleted files
DELETED_COUNT=0
for file in "${DUPLICATE_INDEX_FILES[@]}" "${OLD_INGREDIENTS_FILES[@]}" "${UNUSED_STORES[@]}"; do
    if [ ! -f "$file" ]; then
        ((DELETED_COUNT++))
    fi
done

# Count removed directories
REMOVED_DIRS=0
for dir in "${EMPTY_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        ((REMOVED_DIRS++))
    fi
done

echo "Summary:"
echo "- Deleted files: $DELETED_COUNT"
echo "- Removed directories: $REMOVED_DIRS"
echo "- Type check: PASSED"
echo ""

echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Test manually: npm run dev"
echo "3. Run tests: npm test (if available)"
echo "4. Commit changes:"
echo "   git add ."
echo "   git commit -m 'chore: cleanup unused files and duplicates'"
echo ""

echo -e "${YELLOW}Note: Phase 3 (High Risk) requires manual review${NC}"
echo "See docs/CODEBASE_CLEANUP_AUDIT.md for details"
echo ""

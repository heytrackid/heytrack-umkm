#!/bin/bash

# Comprehensive Route Fixing Script
# This script applies consistent patterns to all API routes

echo "🔧 Starting comprehensive route fixes..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
FIXED=0
SKIPPED=0
ERRORS=0

# Find all route files
ROUTE_FILES=$(find src/app/api -name "route.ts" -type f | sort)

echo "📁 Found $(echo "$ROUTE_FILES" | wc -l) route files"
echo ""

# Function to check if file needs fixing
needs_fixing() {
    local file=$1
    
    # Check for common issues
    if grep -q "catch (err:" "$file" || \
       grep -q "catch (e:" "$file" || \
       grep -q "apiLogger.error({ err" "$file" || \
       grep -q "apiLogger.error({ e" "$file" || \
       ! grep -q "handleAPIError" "$file" || \
       ! grep -q "APIError" "$file"; then
        return 0  # Needs fixing
    fi
    
    return 1  # No fix needed
}

# Process each file
for file in $ROUTE_FILES; do
    echo "Checking: $file"
    
    if needs_fixing "$file"; then
        echo -e "${YELLOW}  ⚠️  Needs fixing${NC}"
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Apply fixes (these are safe sed replacements)
        
        # 1. Fix error variable naming in catch blocks
        sed -i '' 's/catch (err: unknown)/catch (error: unknown)/g' "$file" 2>/dev/null
        sed -i '' 's/catch (e: unknown)/catch (error: unknown)/g' "$file" 2>/dev/null
        
        # 2. Fix logger calls
        sed -i '' 's/apiLogger\.error({ err/apiLogger.error({ error/g' "$file" 2>/dev/null
        sed -i '' 's/apiLogger\.error({ e,/apiLogger.error({ error,/g' "$file" 2>/dev/null
        
        # 3. Fix logger messages (remove colons)
        sed -i '' "s/apiLogger\.error({ error: \([^}]*\) }, '\([^']*\):'/apiLogger.error({ error: \1 }, '\2'/g" "$file" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✅ Fixed${NC}"
            ((FIXED++))
        else
            echo -e "${RED}  ❌ Error applying fixes${NC}"
            # Restore backup
            mv "$file.backup" "$file"
            ((ERRORS++))
        fi
        
        # Remove backup if successful
        rm -f "$file.backup"
    else
        echo -e "${GREEN}  ✓ Already consistent${NC}"
        ((SKIPPED++))
    fi
    
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo -e "${GREEN}✅ Fixed: $FIXED${NC}"
echo -e "${YELLOW}⏭️  Skipped: $SKIPPED${NC}"
echo -e "${RED}❌ Errors: $ERRORS${NC}"
echo ""
echo "🎯 Next steps:"
echo "1. Run: pnpm type-check"
echo "2. Run: pnpm lint"
echo "3. Review changes with: git diff"
echo "4. Test critical endpoints"
echo ""
echo "✨ Done!"

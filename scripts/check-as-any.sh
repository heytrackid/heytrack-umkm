#!/bin/bash

echo "========================================="
echo "🔍 Checking 'as any' usage in codebase"
echo "========================================="
echo ""

# Count total occurrences
TOTAL=$(rg "\s+as\s+any\b" src/ -c | awk -F: '{sum += $2} END {print sum}')
echo "📊 Total 'as any' occurrences: $TOTAL"
echo ""

# Files with most occurrences
echo "📁 Top 10 files with 'as any':"
rg "\s+as\s+any\b" src/ -c | sort -t: -k2 -rn | head -10
echo ""

# By directory
echo "📂 By directory:"
echo "- services/: $(rg "\s+as\s+any\b" src/services/ -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')"
echo "- lib/: $(rg "\s+as\s+any\b" src/lib/ -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')"
echo "- modules/: $(rg "\s+as\s+any\b" src/modules/ -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')"
echo "- hooks/: $(rg "\s+as\s+any\b" src/hooks/ -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')"
echo "- components/: $(rg "\s+as\s+any\b" src/components/ -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')"
echo "- app/: $(rg "\s+as\s+any\b" src/app/ -c 2>/dev/null | awk -F: '{sum += $2} END {print sum}')"
echo ""

echo "✅ Fixed files (using type utilities):"
echo "- src/services/recipes/RecipeAvailabilityService.ts"
echo "- src/services/production/ProductionBatchService.ts"
echo "- src/services/inventory/StockReservationService.ts"
echo "- src/lib/supabase-client.ts"
echo "- src/hooks/supabase/crud.ts"
echo ""

echo "🎯 Quick wins (patterns to replace):"
echo "1. (recipe as any) -> use WithRelation types"
echo "2. .eq('id' as any, id) -> remove as any"
echo "3. .insert(data as any) -> use Insert<T>"
echo "4. .update(data as any) -> use Update<T>"
echo "5. (navigator as any).connection -> use hasConnection()"
echo "6. (performance as any).memory -> use hasMemory()"
echo ""

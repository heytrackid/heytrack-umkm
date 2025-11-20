#!/bin/bash
# Script to identify remaining files that need AbortController pattern
# Run: chmod +x scripts/apply-abort-pattern.sh && ./scripts/apply-abort-pattern.sh

echo "===========================================" 
echo "AbortController Pattern Application Status"
echo "==========================================="
echo ""

# Count total fetch calls
echo "📊 STATISTICS:"
echo "-------------"
total_fetch=$(rg "await fetch\(" src/hooks/*.ts src/components/**/*.ts src/modules/**/*.ts 2>/dev/null | wc -l | tr -d ' ')
echo "Total fetch calls found: $total_fetch"

# Count fetch with signal (React Query)
with_signal=$(rg "signal.*await fetch\(|await fetch\(.*signal" src/hooks/*.ts src/components/**/*.ts src/modules/**/*.ts 2>/dev/null | wc -l | tr -d ' ')
echo "With signal parameter: $with_signal"

# Count fetch with AbortController
with_abort=$(rg "AbortController" src/hooks/*.ts src/components/**/*.ts src/modules/**/*.ts 2>/dev/null | grep -c "new AbortController" | tr -d ' ')
echo "With AbortController: $with_abort"

# Calculate coverage
fixed=$((with_signal + with_abort))
remaining=$((total_fetch - fixed))
if [ $total_fetch -gt 0 ]; then
  coverage=$((fixed * 100 / total_fetch))
else
  coverage=0
fi

echo ""
echo "✅ Fixed: $fixed / $total_fetch ($coverage%)"
echo "🔄 Remaining: $remaining"
echo ""

echo "📋 HIGH PRIORITY FILES (CRUD Hooks):"
echo "------------------------------------"
for file in useSuppliers useIngredientPurchases useProduction useFinancialRecords useExpenses useOrdersQuery; do
  filepath="src/hooks/${file}.ts"
  if [ -f "$filepath" ]; then
    has_abort=$(grep -c "AbortController" "$filepath" 2>/dev/null || echo "0")
    fetch_count=$(grep -c "await fetch(" "$filepath" 2>/dev/null || echo "0")
    if [ "$has_abort" -eq "0" ] && [ "$fetch_count" -gt "0" ]; then
      echo "❌ $file.ts - $fetch_count operations (NEEDS FIX)"
    else
      echo "✅ $file.ts - Fixed"
    fi
  fi
done

echo ""
echo "📋 MEDIUM PRIORITY FILES:"
echo "------------------------"
for file in useRecipeCostPreview useCostAlerts useHppData useDashboardStats useFinancialTrends; do
  filepath="src/hooks/${file}.ts"
  if [ -f "$filepath" ]; then
    has_abort=$(grep -c "AbortController" "$filepath" 2>/dev/null || echo "0")
    fetch_count=$(grep -c "await fetch(" "$filepath" 2>/dev/null || echo "0")
    if [ "$has_abort" -eq "0" ] && [ "$fetch_count" -gt "0" ]; then
      echo "❌ $file.ts - $fetch_count operations"
    else
      echo "✅ $file.ts"
    fi
  fi
done

echo ""
echo "🎯 NEXT STEPS:"
echo "-------------"
echo "1. Apply pattern to remaining HIGH priority files"
echo "2. Run: pnpm run type-check"
echo "3. Run: pnpm run lint"
echo "4. Test manually"
echo "5. Commit changes"
echo ""
echo "📖 Reference Implementation:"
echo "  - Pattern: src/hooks/useRecipes.ts"
echo "  - Guide: ABORT_CONTROLLER_ROLLOUT_GUIDE.md"
echo ""

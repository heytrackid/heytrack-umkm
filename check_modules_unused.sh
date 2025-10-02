#!/bin/bash

echo "🔍 Checking unused files in modules/..."
echo ""

# Check finance module
declare -a finance_files=(
  "src/modules/finance/components/SmartExpenseAutomation.tsx"
  "src/modules/finance/components/SmartFinancialDashboard.tsx"
)

# Check production module
declare -a production_files=(
  "src/modules/production/components/SmartProductionPlanner.tsx"
)

# Check inventory module
declare -a inventory_files=(
  "src/modules/inventory/components/SmartInventoryManager.tsx"
)

# Check notification module
declare -a notification_files=(
  "src/modules/notifications/components/SmartNotificationCenter.tsx"
)

all_files=("${finance_files[@]}" "${production_files[@]}" "${inventory_files[@]}" "${notification_files[@]}")

declare -a safe_to_delete=()

for file in "${all_files[@]}"; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" | sed 's/\.[^.]*$//')
    
    # Search for imports
    usage=$(grep -r "from.*$filename" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "$file" | wc -l)
    
    if [ "$usage" -eq 0 ]; then
      safe_to_delete+=("$file")
      echo "❌ NOT USED: $file"
    else
      echo "✅ IN USE: $file (found $usage references)"
    fi
  else
    echo "⚠️  NOT FOUND: $file"
  fi
done

echo ""
echo "Safe to delete: ${#safe_to_delete[@]} files"

if [ ${#safe_to_delete[@]} -gt 0 ]; then
  echo ""
  for file in "${safe_to_delete[@]}"; do
    echo "  - $file"
  done
fi

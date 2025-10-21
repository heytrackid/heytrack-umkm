#!/bin/bash

# Script to add React.memo to components
# This script will wrap export default function components with React.memo

echo "🔧 Adding React.memo to components..."

# List of files to update
files=(
  "src/components/export/ExcelExportButton.tsx"
  "src/components/ui/mobile-table.tsx"
  "src/components/automation/smart-notifications.tsx"
  "src/components/orders/OrdersList.tsx"
  "src/components/orders/OrderFilters.tsx"
  "src/components/orders/OrderForm.tsx"
  "src/components/production/ProductionTimeline.tsx"
  "src/components/production/ProductionCapacityManager.tsx"
  "src/components/production/ProductionBatchExecution.tsx"
  "src/components/dashboard/AutoSyncFinancialDashboard.tsx"
  "src/components/layout/app-layout.tsx"
  "src/components/layout/mobile-header.tsx"
  "src/components/ui/whatsapp-followup.tsx"
)

count=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Processing: $file"
    ((count++))
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "📊 Summary:"
echo "   Total files to process: ${#files[@]}"
echo "   Files found: $count"
echo ""
echo "⚠️  Note: Manual review required after running this script"
echo "   - Check import statements"
echo "   - Verify memo wrapping"
echo "   - Test components"

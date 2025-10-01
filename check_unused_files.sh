#!/bin/bash

echo "🔍 Checking file usage..."
echo ""

# Files to check (excluding date-filter and confirmation-dialog)
declare -a files=(
  "src/components/real-time-sync-dashboard.tsx"
  "src/components/smart-pricing-insights.tsx"
  "src/components/smart-inventory-automation.tsx"
  "src/components/inventory/AutoReorderDashboard.tsx"
  "src/components/production/ProductionCapacityManager.tsx"
  "src/components/production/ProductionBatchExecution.tsx"
  "src/components/production/ProductionTimeline.tsx"
  "src/components/production/EnhancedProductionPlanningDashboard.tsx"
  "src/components/automation/smart-expense-automation.tsx"
  "src/components/automation/enhanced-smart-notifications.tsx"
  "src/components/automation/smart-notification-center.tsx"
  "src/components/ui/language-toggle.tsx"
  "src/components/ui/command.tsx"
  "src/components/ui/carousel.tsx"
  "src/components/ui/drawer.tsx"
  "src/components/ui/notification-center.tsx"
  "src/components/ui/toaster.tsx"
  "src/components/layout/mobile-bottom-nav.tsx"
  "src/components/layout/crud-layout.tsx"
  "src/components/performance-provider.tsx"
  "src/components/charts/inventory-trends-chart.tsx"
  "src/components/charts/financial-trends-chart.tsx"
  "src/components/ai-chatbot/ChatbotFAB.tsx"
  "src/components/ai/AIInsightsPanel.tsx"
  "src/components/forms/enhanced-forms.tsx"
  "src/components/ui/whatsapp-followup.example.tsx"
)

declare -a safe_to_delete=()
declare -a in_use=()

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    filename=$(basename "$file" .tsx)
    filename_no_ext=$(basename "$file" | sed 's/\.[^.]*$//')
    
    # Search for imports in src directory
    usage=$(grep -r "from.*$filename_no_ext" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "$file" | wc -l)
    
    if [ "$usage" -eq 0 ]; then
      safe_to_delete+=("$file")
      echo "❌ NOT USED: $file"
    else
      in_use+=("$file")
      echo "✅ IN USE: $file (found $usage references)"
    fi
  fi
done

echo ""
echo "================================"
echo "📊 Summary:"
echo "================================"
echo "✅ Files in use: ${#in_use[@]}"
echo "❌ Safe to delete: ${#safe_to_delete[@]}"
echo ""

if [ ${#safe_to_delete[@]} -gt 0 ]; then
  echo "Files safe to delete:"
  for file in "${safe_to_delete[@]}"; do
    echo "  - $file"
  done
fi

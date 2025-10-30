#!/bin/bash

# Script to convert regular Tabs to SwipeableTabs
# This makes all tabs swipeable on mobile

echo "🔄 Converting Tabs to SwipeableTabs..."

# Files to convert
FILES=(
  "src/modules/recipes/components/SmartPricingAssistant.tsx"
  "src/components/orders/WhatsAppFollowUp.tsx"
  "src/components/production/ProductionCapacityManager.tsx"
  "src/components/admin/AdminDashboard.tsx"
  "src/components/ui/whatsapp-followup.tsx"
  "src/app/orders/new/page.tsx"
  "src/app/production/components/EnhancedProductionPage.tsx"
  "src/app/cash-flow/components/EnhancedTransactionForm.tsx"
  "src/app/recipes/ai-generator/components/RecipeTemplateSelector.tsx"
  "src/app/hpp/reports/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Converting $file..."
    
    # Replace import
    sed -i '' "s/import { Tabs, TabsContent, TabsList, TabsTrigger } from '@\/components\/ui\/tabs'/import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@\/components\/ui\/swipeable-tabs'/g" "$file"
    
    # Replace component names
    sed -i '' 's/<Tabs /<SwipeableTabs /g' "$file"
    sed -i '' 's/<\/Tabs>/<\/SwipeableTabs>/g' "$file"
    sed -i '' 's/<TabsList /<SwipeableTabsList /g' "$file"
    sed -i '' 's/<\/TabsList>/<\/SwipeableTabsList>/g' "$file"
    sed -i '' 's/<TabsTrigger /<SwipeableTabsTrigger /g' "$file"
    sed -i '' 's/<\/TabsTrigger>/<\/SwipeableTabsTrigger>/g' "$file"
    sed -i '' 's/<TabsContent /<SwipeableTabsContent /g' "$file"
    sed -i '' 's/<\/TabsContent>/<\/SwipeableTabsContent>/g' "$file"
    
    echo "  ✅ Done: $file"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✨ Conversion complete!"
echo ""
echo "📋 Summary:"
echo "  - All Tabs components converted to SwipeableTabs"
echo "  - Mobile users can now swipe between tabs"
echo "  - Desktop users still have click navigation"
echo ""
echo "🧪 Next steps:"
echo "  1. Run: pnpm type-check"
echo "  2. Test on mobile device"
echo "  3. Verify all tabs are swipeable"

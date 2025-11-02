#!/bin/bash

# ============================================================================
# Database Types Migration Script
# ============================================================================
# Migrates from old type pattern (XxxTable, XxxInsert, XxxUpdate)
# to new generic pattern (Row<'xxx'>, Insert<'xxx'>, Update<'xxx'>)
# ============================================================================

set -e

echo "🚀 Starting database types migration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter for changes
TOTAL_FILES=0
TOTAL_CHANGES=0

# Backup directory
BACKUP_DIR=".migration-backup-$(date +%Y%m%d-%H%M%S)"

# Function to create backup
create_backup() {
  echo "📦 Creating backup in $BACKUP_DIR..."
  mkdir -p "$BACKUP_DIR"
  
  # Find all TypeScript files and copy them
  find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
    target="$BACKUP_DIR/$file"
    mkdir -p "$(dirname "$target")"
    cp "$file" "$target"
  done
  
  echo -e "${GREEN}✓${NC} Backup created"
  echo ""
}

# Function to process a single file
process_file() {
  local file="$1"
  local changes=0
  local temp_file="${file}.tmp"
  
  # Skip if file doesn't exist
  [[ ! -f "$file" ]] && return 0
  
  # Create temp file
  cp "$file" "$temp_file"
  
  # ========================================================================
  # STEP 1: Replace type usage patterns
  # ========================================================================
  
  # Define table mappings (PascalCase:snake_case)
  local mappings="
AppSettings:app_settings
ChatContextCache:chat_context_cache
ChatMessages:chat_messages
ChatSessions:chat_sessions
ConversationHistory:conversation_history
ConversationSessions:conversation_sessions
Customers:customers
DailySalesSummary:daily_sales_summary
ErrorLogs:error_logs
Expenses:expenses
FinancialRecords:financial_records
HppAlerts:hpp_alerts
HppCalculations:hpp_calculations
HppHistory:hpp_history
HppRecommendations:hpp_recommendations
IngredientPurchases:ingredient_purchases
Ingredients:ingredients
InventoryAlerts:inventory_alerts
InventoryReorderRules:inventory_reorder_rules
InventoryStockLogs:inventory_stock_logs
NotificationPreferences:notification_preferences
Notifications:notifications
OperationalCosts:operational_costs
OrderItems:order_items
Orders:orders
Payments:payments
PerformanceLogs:performance_logs
ProductionBatches:production_batches
ProductionSchedules:production_schedules
Productions:productions
RecipeIngredients:recipe_ingredients
Recipes:recipes
StockReservations:stock_reservations
StockTransactions:stock_transactions
SupplierIngredients:supplier_ingredients
Suppliers:suppliers
UsageAnalytics:usage_analytics
UserProfiles:user_profiles
WhatsappTemplates:whatsapp_templates
"
  
  # Process each mapping
  echo "$mappings" | while IFS=: read -r pascal snake; do
    [[ -z "$pascal" ]] && continue
    
    # Replace XxxTable with Row<'xxx'>
    if grep -q "${pascal}Table" "$temp_file" 2>/dev/null; then
      sed -i.bak "s/${pascal}Table/Row<'${snake}'>/g" "$temp_file"
      changes=$((changes + 1))
    fi
    
    # Replace XxxInsert with Insert<'xxx'>
    if grep -q "${pascal}Insert" "$temp_file" 2>/dev/null; then
      sed -i.bak "s/${pascal}Insert/Insert<'${snake}'>/g" "$temp_file"
      changes=$((changes + 1))
    fi
    
    # Replace XxxUpdate with Update<'xxx'>
    if grep -q "${pascal}Update" "$temp_file" 2>/dev/null; then
      sed -i.bak "s/${pascal}Update/Update<'${snake}'>/g" "$temp_file"
      changes=$((changes + 1))
    fi
  done
  
  # ========================================================================
  # STEP 2: Handle Tables<'xxx'> pattern
  # ========================================================================
  
  if grep -q "Tables<'" "$temp_file" 2>/dev/null; then
    sed -i.bak "s/Tables<'/Row<'/g" "$temp_file"
    changes=$((changes + 1))
  fi
  
  if grep -q "TablesInsert<'" "$temp_file" 2>/dev/null; then
    sed -i.bak "s/TablesInsert<'/Insert<'/g" "$temp_file"
    changes=$((changes + 1))
  fi
  
  if grep -q "TablesUpdate<'" "$temp_file" 2>/dev/null; then
    sed -i.bak "s/TablesUpdate<'/Update<'/g" "$temp_file"
    changes=$((changes + 1))
  fi
  
  # ========================================================================
  # STEP 3: Update import statements
  # ========================================================================
  
  if grep -q "from '@/types/database'" "$temp_file" 2>/dev/null; then
    # Check if we need to add Row, Insert, Update to imports
    local needs_row=0
    local needs_insert=0
    local needs_update=0
    
    grep -q "Row<'" "$temp_file" 2>/dev/null && needs_row=1
    grep -q "Insert<'" "$temp_file" 2>/dev/null && needs_insert=1
    grep -q "Update<'" "$temp_file" 2>/dev/null && needs_update=1
    
    # Build import additions
    local import_line=$(grep "import type.*from '@/types/database'" "$temp_file" | head -1)
    
    if [[ -n "$import_line" ]]; then
      local has_row=$(echo "$import_line" | grep -c "\\bRow\\b" || true)
      local has_insert=$(echo "$import_line" | grep -c "\\bInsert\\b" || true)
      local has_update=$(echo "$import_line" | grep -c "\\bUpdate\\b" || true)
      
      local types_to_add=""
      [[ $needs_row -eq 1 && $has_row -eq 0 ]] && types_to_add="${types_to_add}Row, "
      [[ $needs_insert -eq 1 && $has_insert -eq 0 ]] && types_to_add="${types_to_add}Insert, "
      [[ $needs_update -eq 1 && $has_update -eq 0 ]] && types_to_add="${types_to_add}Update, "
      
      if [[ -n "$types_to_add" ]]; then
        types_to_add="${types_to_add%, }"
        sed -i.bak "s/import type {/import type { ${types_to_add}, /g" "$temp_file"
        changes=$((changes + 1))
      fi
    fi
  fi
  
  # ========================================================================
  # STEP 4: Clean up
  # ========================================================================
  
  # Remove duplicate commas and spaces
  sed -i.bak 's/, ,/, /g' "$temp_file"
  sed -i.bak 's/{ ,/{ /g' "$temp_file"
  sed -i.bak 's/, }/}/g' "$temp_file"
  
  # Remove backup files created by sed
  rm -f "${temp_file}.bak"
  
  # If changes were made, replace original file
  if [[ $changes -gt 0 ]]; then
    mv "$temp_file" "$file"
    echo -e "${GREEN}✓${NC} $file ($changes changes)"
    TOTAL_FILES=$((TOTAL_FILES + 1))
    TOTAL_CHANGES=$((TOTAL_CHANGES + changes))
  else
    rm "$temp_file"
  fi
  
  return 0
}

# ============================================================================
# Main execution
# ============================================================================

# Create backup first
create_backup

echo "🔄 Processing TypeScript files..."
echo ""

# Find and process all TypeScript files
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
  process_file "$file"
done

echo ""
echo "============================================================================"
echo -e "${GREEN}✓ Migration complete!${NC}"
echo "============================================================================"
echo "Files modified: $TOTAL_FILES"
echo "Total changes: $TOTAL_CHANGES"
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Next steps:"
echo "1. Run: npm run type-check (or tsc --noEmit)"
echo "2. Review changes with: git diff"
echo "3. If everything looks good, commit the changes"
echo "4. If you need to rollback: cp -r $BACKUP_DIR/src/* src/"
echo ""

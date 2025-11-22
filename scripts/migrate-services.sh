#!/bin/bash

# Service Migration Script
# Automates migration of services to BaseService pattern

set -e

echo "🚀 Starting Service Migration..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services to migrate (constructor injection pattern - easier)
CONSTRUCTOR_SERVICES=(
  "src/services/production/ProductionService.ts"
  "src/services/reports/ReportService.ts"
  "src/services/hpp/HppService.ts"
  "src/services/ai/AiService.ts"
  "src/services/orders/OrderImportService.ts"
)

# Services with static methods (need more work)
STATIC_SERVICES=(
  "src/services/recipes/RecipeAvailabilityService.ts"
  "src/services/orders/CustomerPreferencesService.ts"
  "src/services/orders/PricingAssistantService.ts"
)

migrate_constructor_service() {
  local file=$1
  local service_name=$(basename "$file" .ts)
  
  echo -e "${YELLOW}Migrating: $service_name${NC}"
  
  # Backup original
  cp "$file" "${file}.backup"
  
  # Check if already migrated
  if grep -q "extends BaseService" "$file"; then
    echo -e "${GREEN}✓ Already migrated${NC}"
    rm "${file}.backup"
    return 0
  fi
  
  # Add import for BaseService
  if ! grep -q "from '@/services/base'" "$file"; then
    # Add after first import block
    sed -i '' "1a\\
import { BaseService, type ServiceContext } from '@/services/base'
" "$file"
  fi
  
  echo -e "${GREEN}✓ Added BaseService import${NC}"
  
  # Note: Actual code transformation would require AST manipulation
  # For now, this script serves as a template
  
  echo -e "${YELLOW}⚠️  Manual steps required:${NC}"
  echo "  1. Change class to extend BaseService"
  echo "  2. Update constructor to accept ServiceContext"
  echo "  3. Replace 'this.supabase' with 'this.context.supabase'"
  echo "  4. Add 'this.context.userId' where needed"
  echo "  5. Wrap operations in executeWithAudit()"
  echo ""
}

echo "📦 Phase 1: Constructor Injection Services"
echo "=========================================="
for service in "${CONSTRUCTOR_SERVICES[@]}"; do
  if [ -f "$service" ]; then
    migrate_constructor_service "$service"
  else
    echo -e "${RED}✗ File not found: $service${NC}"
  fi
done

echo ""
echo "📦 Phase 2: Static Method Services"
echo "=========================================="
echo -e "${YELLOW}These require manual conversion:${NC}"
for service in "${STATIC_SERVICES[@]}"; do
  echo "  - $(basename "$service")"
done

echo ""
echo "✅ Migration script complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Review and complete manual migrations"
echo "  2. Update API routes to use new pattern"
echo "  3. Run: pnpm run type-check"
echo "  4. Run: pnpm run lint"
echo "  5. Test critical paths"
echo ""

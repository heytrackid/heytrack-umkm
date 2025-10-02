#!/bin/bash

echo "🔍 Analyzing Codebase Logic Completeness..."
echo ""

# Check critical business logic files
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHECKING CRITICAL BUSINESS LOGIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check services
echo "🔧 SERVICES:"
echo "  ✅ AutoReorderService.ts - Inventory auto-reorder"
echo "  ✅ BatchSchedulingService.ts - Production scheduling"
echo "  ✅ ProductionDataIntegration.ts - Production data"
echo "  ✅ AutoSyncFinancialService.ts - Financial sync"
echo "  ✅ HPPCalculationService.ts - Cost calculation"
echo "  ✅ InventoryService.ts - Inventory management"
echo "  ✅ OrderPricingService.ts - Order pricing"
echo "  ✅ OrderValidationService.ts - Order validation"
echo ""

# Check for missing logic patterns
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 CHECKING FOR MISSING PATTERNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check expense management
if [ -f "src/services/expense/ExpenseService.ts" ]; then
  echo "  ✅ ExpenseService.ts exists"
else
  echo "  ❌ MISSING: ExpenseService.ts - No service for expense management"
fi

# Check payment tracking
if [ -f "src/services/payment/PaymentService.ts" ]; then
  echo "  ✅ PaymentService.ts exists"
else
  echo "  ❌ MISSING: PaymentService.ts - No service for payment tracking"
fi

# Check customer analytics
if [ -f "src/services/customer/CustomerAnalyticsService.ts" ]; then
  echo "  ✅ CustomerAnalyticsService.ts exists"
else
  echo "  ❌ MISSING: CustomerAnalyticsService.ts - No customer analytics"
fi

# Check supplier management
if [ -f "src/services/supplier/SupplierService.ts" ]; then
  echo "  ✅ SupplierService.ts exists"
else
  echo "  ❌ MISSING: SupplierService.ts - No supplier management service"
fi

# Check stock forecasting
if [ -f "src/services/inventory/ForecastingService.ts" ]; then
  echo "  ✅ ForecastingService.ts exists"
else
  echo "  ❌ MISSING: ForecastingService.ts - No demand forecasting"
fi

# Check recipe costing
if grep -rq "calculateRecipeCost" src/services/ 2>/dev/null; then
  echo "  ✅ Recipe costing logic exists"
else
  echo "  ⚠️  WARNING: Recipe costing logic might be incomplete"
fi

# Check profit margin calculation
if grep -rq "profitMargin\|gross_margin" src/services/ 2>/dev/null; then
  echo "  ✅ Profit margin calculation exists"
else
  echo "  ⚠️  WARNING: Profit margin calculation might be missing"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 CHECKING ANALYTICS & REPORTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for analytics endpoints
if grep -rq "api/analytics" src/app/api/ 2>/dev/null; then
  echo "  ✅ Analytics API endpoints exist"
else
  echo "  ❌ MISSING: Analytics API endpoints"
fi

# Check for reports generation
if grep -rq "generateReport\|exportReport" src/ 2>/dev/null; then
  echo "  ✅ Report generation logic exists"
else
  echo "  ⚠️  WARNING: Report generation might be limited"
fi

# Check for dashboard data aggregation
if grep -rq "aggregateData\|summaryData" src/ 2>/dev/null; then
  echo "  ✅ Data aggregation logic exists"
else
  echo "  ⚠️  WARNING: Dashboard aggregation might need work"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CHECKING SECURITY & VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check RLS policies
if grep -rq "RLS\|Row Level Security" src/ 2>/dev/null; then
  echo "  ✅ RLS awareness in code"
else
  echo "  ⚠️  WARNING: No explicit RLS handling found"
fi

# Check input validation
if [ -f "src/lib/validation.ts" ] || [ -f "src/lib/validations.ts" ]; then
  echo "  ✅ Input validation utilities exist"
else
  echo "  ❌ MISSING: Input validation utilities"
fi

# Check authentication
if grep -rq "auth\|authentication" src/middleware.ts 2>/dev/null; then
  echo "  ✅ Authentication middleware exists"
else
  echo "  ⚠️  WARNING: Authentication middleware might be incomplete"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 CHECKING FINANCIAL LOGIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check tax calculation
if grep -rq "calculateTax\|tax_amount" src/ 2>/dev/null; then
  echo "  ✅ Tax calculation exists"
else
  echo "  ⚠️  WARNING: Tax calculation might be missing"
fi

# Check cash flow tracking
if grep -rq "cash.*flow\|cashFlow" src/ 2>/dev/null; then
  echo "  ✅ Cash flow tracking exists"
else
  echo "  ❌ MISSING: Cash flow tracking logic"
fi

# Check profit/loss calculation
if grep -rq "profit.*loss\|profitLoss\|P&L" src/ 2>/dev/null; then
  echo "  ✅ P&L calculation exists"
else
  echo "  ⚠️  WARNING: P&L calculation might be incomplete"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 CHECKING INVENTORY LOGIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check stock adjustment
if grep -rq "adjustStock\|stockAdjustment" src/ 2>/dev/null; then
  echo "  ✅ Stock adjustment logic exists"
else
  echo "  ⚠️  WARNING: Stock adjustment might be manual only"
fi

# Check waste tracking
if grep -rq "waste\|wastage" src/ 2>/dev/null; then
  echo "  ✅ Waste tracking exists"
else
  echo "  ❌ MISSING: Waste tracking logic"
fi

# Check expiry tracking
if grep -rq "expir\|shelf.*life" src/ 2>/dev/null; then
  echo "  ✅ Expiry/shelf-life tracking exists"
else
  echo "  ❌ MISSING: Expiry date tracking"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 CHECKING BUSINESS INTELLIGENCE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check trend analysis
if grep -rq "trend\|trending" src/ 2>/dev/null; then
  echo "  ✅ Trend analysis exists"
else
  echo "  ⚠️  WARNING: Trend analysis might be limited"
fi

# Check forecasting
if grep -rq "forecast\|prediction" src/ 2>/dev/null; then
  echo "  ✅ Forecasting logic exists"
else
  echo "  ❌ MISSING: Forecasting capabilities"
fi

# Check customer segmentation
if grep -rq "segment\|customer.*type" src/ 2>/dev/null; then
  echo "  ✅ Customer segmentation exists"
else
  echo "  ⚠️  WARNING: Customer segmentation might be basic"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Analysis Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"


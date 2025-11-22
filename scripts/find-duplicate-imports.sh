#!/bin/bash

# Script to find files using deprecated imports
# Run this to identify files that need migration

echo "🔍 Finding deprecated constant imports..."
echo ""

echo "📦 Files importing ORDER_STATUSES from deprecated locations:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rg "from ['\"]@/lib/shared/form-utils['\"]" --type ts --type tsx -l 2>/dev/null || echo "None found"
rg "from ['\"]@/shared['\"].*ORDER_STATUSES" --type ts --type tsx -l 2>/dev/null || echo "None found"
echo ""

echo "💰 Files importing PAYMENT_METHODS from deprecated locations:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rg "PAYMENT_METHODS.*from ['\"]@/lib/shared/form-utils" --type ts --type tsx -l 2>/dev/null || echo "None found"
rg "PAYMENT_METHODS.*from ['\"]@/shared" --type ts --type tsx -l 2>/dev/null || echo "None found"
echo ""

echo "💵 Files using formatCurrency from utilities.ts:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rg "formatCurrency.*from ['\"]@/lib/shared/utilities" --type ts --type tsx -l 2>/dev/null || echo "None found"
echo ""

echo "✅ Files correctly using constants.ts:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rg "from ['\"]@/lib/shared/constants['\"]" --type ts --type tsx -l 2>/dev/null | head -10
echo ""

echo "✅ Files correctly using currency.ts:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
rg "from ['\"]@/lib/currency['\"]" --type ts --type tsx -l 2>/dev/null | head -10
echo ""

echo "📊 Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Run this script periodically to track migration progress"
echo "Goal: Zero files using deprecated imports"
echo ""

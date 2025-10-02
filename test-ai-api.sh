#!/bin/bash

# AI + Supabase Integration Test Script
# Make sure dev server is running: npm run dev

echo "🚀 Testing AI + Supabase Integration APIs"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null | grep -q "200\|404"; then
    echo -e "${RED}❌ Server not running!${NC}"
    echo ""
    echo "Please start the dev server first:"
    echo "  npm run dev"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Server is running!${NC}"
echo ""

# Test 1: Test AI Data Fetcher
echo -e "${YELLOW}Test 1: Data Fetcher Verification${NC}"
echo "GET /api/test-ai-data"
echo "---"
response=$(curl -s "$BASE_URL/api/test-ai-data")
if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq '{
        success, 
        message, 
        summary: .summary,
        ingredients: .stats.ingredients.total,
        recipes: .stats.recipes.total,
        orders: .stats.orders.total
    }'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Test 2: AI Pricing Analysis (GET - all recipes)
echo -e "${YELLOW}Test 2: AI Pricing Analysis (All Recipes)${NC}"
echo "GET /api/ai/pricing"
echo "---"
response=$(curl -s "$BASE_URL/api/ai/pricing")
if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq '{
        success,
        totalRecipes,
        analyzedCount,
        sample: .analyses[0]
    }'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Test 3: AI Pricing Analysis (POST - with database)
echo -e "${YELLOW}Test 3: AI Pricing Analysis (Database Mode)${NC}"
echo "POST /api/ai/pricing"
echo "---"
response=$(curl -s -X POST "$BASE_URL/api/ai/pricing" \
    -H "Content-Type: application/json" \
    -d '{"useDatabase": true, "productName": "Roti"}')
if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq '{
        success,
        dataSource,
        recipe: .recipe.name,
        hpp: .recipe.calculatedHPP,
        sellingPrice: .recipe.currentSellingPrice
    }'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Test 4: AI Inventory Optimization
echo -e "${YELLOW}Test 4: AI Inventory Optimization${NC}"
echo "POST /api/ai/inventory"
echo "---"
response=$(curl -s -X POST "$BASE_URL/api/ai/inventory" \
    -H "Content-Type: application/json" \
    -d '{"useDatabase": true}')
if echo "$response" | jq -e 'has("optimization") or has("dataSource")' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq 'if has("success") then {success, dataSource} else {status: "response received"} end'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Test 5: Customer Insights
echo -e "${YELLOW}Test 5: AI Customer Insights${NC}"
echo "GET /api/ai/customer-insights"
echo "---"
response=$(curl -s "$BASE_URL/api/ai/customer-insights")
if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq '{
        success,
        dataSource,
        summary
    }'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Test 6: Dashboard Insights
echo -e "${YELLOW}Test 6: AI Dashboard Insights${NC}"
echo "GET /api/ai/dashboard-insights"
echo "---"
response=$(curl -s "$BASE_URL/api/ai/dashboard-insights")
if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq '{
        success,
        dataSource,
        stats: {
            ingredients: .stats.ingredients,
            orders: .stats.orders,
            customers: .stats.customers,
            financial: .stats.financial
        },
        insights: {
            summary: .insights.summary,
            priorityActions: .insights.priorityActions
        }
    }'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Test 7: AI Chat with Data
echo -e "${YELLOW}Test 7: AI Chat with Database Context${NC}"
echo "POST /api/ai/chat-with-data"
echo "---"
response=$(curl -s -X POST "$BASE_URL/api/ai/chat-with-data" \
    -H "Content-Type: application/json" \
    -d '{"message": "Berapa total bahan yang ada di inventory?"}')
if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASSED${NC}"
    echo "$response" | jq '{
        success,
        hasData,
        dataContext,
        response: .response[:200] + "..."
    }'
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "$response" | jq '.'
fi
echo ""
echo "=================================================="
echo ""

# Summary
echo ""
echo "🎉 AI API Testing Complete!"
echo "=============================="
echo ""
echo "All endpoints tested. Check results above."
echo ""
echo "To run individual tests:"
echo "  curl http://localhost:3000/api/test-ai-data | jq '.'"
echo "  curl http://localhost:3000/api/ai/pricing | jq '.'"
echo "  curl http://localhost:3000/api/ai/dashboard-insights | jq '.'"
echo ""

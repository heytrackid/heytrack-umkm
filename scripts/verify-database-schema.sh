#!/bin/bash

# Script untuk memverifikasi bahwa semua insert operations sesuai dengan database schema
# Usage: ./scripts/verify-database-schema.sh

echo "🔍 Verifying Database Schema Compliance..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
issues_found=0

echo "📋 Checking for common schema issues..."
echo ""

# 1. Check for is_active in tables that don't have it
echo "1️⃣  Checking for 'is_active' usage in wrong tables..."
if grep -r "\.insert.*is_active.*true" src/ --include="*.ts" | grep -E "(chat_messages|chat_sessions|stock_reservations|financial_records|order_items|productions)" > /dev/null; then
    echo -e "${RED}❌ Found 'is_active' being inserted in tables that don't have this column${NC}"
    grep -r "\.insert.*is_active.*true" src/ --include="*.ts" | grep -E "(chat_messages|chat_sessions|stock_reservations|financial_records|order_items|productions)"
    ((issues_found++))
else
    echo -e "${GREEN}✅ No 'is_active' issues found${NC}"
fi
echo ""

# 2. Check for updated_by in insert operations (should only be in updates)
echo "2️⃣  Checking for 'updated_by' in insert operations..."
if grep -r "\.insert.*updated_by" src/ --include="*.ts" > /dev/null; then
    echo -e "${RED}❌ Found 'updated_by' in insert operations (should only be in updates)${NC}"
    grep -r "\.insert.*updated_by" src/ --include="*.ts"
    ((issues_found++))
else
    echo -e "${GREEN}✅ No 'updated_by' in insert operations${NC}"
fi
echo ""

# 3. Check for user_id in chat_messages inserts
echo "3️⃣  Checking for 'user_id' in chat_messages inserts..."
if grep -r "from('chat_messages')" src/ --include="*.ts" -A 10 | grep "user_id" > /dev/null; then
    echo -e "${YELLOW}⚠️  Found 'user_id' in chat_messages operations (verify if it's insert or select)${NC}"
    grep -r "from('chat_messages')" src/ --include="*.ts" -A 10 | grep -B 5 "user_id"
    echo -e "${YELLOW}   Note: user_id is OK in SELECT but NOT in INSERT${NC}"
else
    echo -e "${GREEN}✅ No user_id issues in chat_messages${NC}"
fi
echo ""

# 4. Check for recipe_id in stock_reservations inserts
echo "4️⃣  Checking for 'recipe_id' in stock_reservations inserts..."
if grep -r "from('stock_reservations')" src/ --include="*.ts" -A 10 | grep "recipe_id" > /dev/null; then
    echo -e "${RED}❌ Found 'recipe_id' in stock_reservations (this column doesn't exist)${NC}"
    grep -r "from('stock_reservations')" src/ --include="*.ts" -A 10 | grep -B 5 "recipe_id"
    ((issues_found++))
else
    echo -e "${GREEN}✅ No recipe_id issues in stock_reservations${NC}"
fi
echo ""

# 5. Check for missing user_id in required tables
echo "5️⃣  Checking for missing 'user_id' in insert operations..."
echo -e "${YELLOW}   Checking stock_reservations...${NC}"
if grep -r "from('stock_reservations').*insert" src/ --include="*.ts" -A 15 | grep -v "user_id" > /dev/null; then
    echo -e "${YELLOW}⚠️  Verify stock_reservations inserts have user_id${NC}"
else
    echo -e "${GREEN}✅ stock_reservations inserts look good${NC}"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $issues_found -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! No schema issues found.${NC}"
    echo ""
    echo "Your codebase is compliant with the database schema."
else
    echo -e "${RED}❌ Found $issues_found issue(s) that need attention.${NC}"
    echo ""
    echo "Please review the issues above and fix them."
    exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

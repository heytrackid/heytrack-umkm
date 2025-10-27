#!/bin/bash

# API Routes Audit Script
# Checks all API routes for common issues

echo "🔍 API Routes Comprehensive Audit"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

total_routes=0
routes_with_get=0
routes_with_post=0
routes_with_put=0
routes_with_patch=0
routes_with_delete=0
routes_with_auth=0
routes_with_validation=0
routes_with_cache=0
routes_with_error_handling=0

echo "📊 Scanning API routes..."
echo ""

for file in $(find src/app/api -name "route.ts" -type f | sort); do
  ((total_routes++))
  
  route_path=$(echo "$file" | sed 's|src/app/api/||' | sed 's|/route.ts||')
  
  # Check HTTP methods
  has_get=$(grep -c "export async function GET" "$file" || echo 0)
  has_post=$(grep -c "export async function POST" "$file" || echo 0)
  has_put=$(grep -c "export async function PUT" "$file" || echo 0)
  has_patch=$(grep -c "export async function PATCH" "$file" || echo 0)
  has_delete=$(grep -c "export async function DELETE" "$file" || echo 0)
  
  # Check for auth
  has_auth=$(grep -c "auth.getUser\|createClient" "$file" || echo 0)
  
  # Check for validation
  has_validation=$(grep -c "safeParse\|validate\|schema" "$file" || echo 0)
  
  # Check for caching
  has_cache=$(grep -c "withCache\|cacheKeys" "$file" || echo 0)
  
  # Check for error handling
  has_error=$(grep -c "try.*catch\|error:" "$file" || echo 0)
  
  # Count totals
  [ $has_get -gt 0 ] && ((routes_with_get++))
  [ $has_post -gt 0 ] && ((routes_with_post++))
  [ $has_put -gt 0 ] && ((routes_with_put++))
  [ $has_patch -gt 0 ] && ((routes_with_patch++))
  [ $has_delete -gt 0 ] && ((routes_with_delete++))
  [ $has_auth -gt 0 ] && ((routes_with_auth++))
  [ $has_validation -gt 0 ] && ((routes_with_validation++))
  [ $has_cache -gt 0 ] && ((routes_with_cache++))
  [ $has_error -gt 0 ] && ((routes_with_error_handling++))
  
  # Build methods string
  methods=""
  [ $has_get -gt 0 ] && methods="${methods}GET "
  [ $has_post -gt 0 ] && methods="${methods}POST "
  [ $has_put -gt 0 ] && methods="${methods}PUT "
  [ $has_patch -gt 0 ] && methods="${methods}PATCH "
  [ $has_delete -gt 0 ] && methods="${methods}DELETE "
  
  # Build features string
  features=""
  [ $has_auth -gt 0 ] && features="${features}🔐 "
  [ $has_validation -gt 0 ] && features="${features}✓ "
  [ $has_cache -gt 0 ] && features="${features}⚡ "
  [ $has_error -gt 0 ] && features="${features}🛡️ "
  
  echo "/$route_path"
  echo "  Methods: $methods"
  echo "  Features: $features"
  echo ""
done

echo ""
echo "📈 Summary Statistics"
echo "===================="
echo "Total Routes: $total_routes"
echo ""
echo "HTTP Methods:"
echo "  GET:    $routes_with_get"
echo "  POST:   $routes_with_post"
echo "  PUT:    $routes_with_put"
echo "  PATCH:  $routes_with_patch"
echo "  DELETE: $routes_with_delete"
echo ""
echo "Features:"
echo "  🔐 Auth:       $routes_with_auth"
echo "  ✓ Validation: $routes_with_validation"
echo "  ⚡ Caching:    $routes_with_cache"
echo "  🛡️ Error:      $routes_with_error_handling"
echo ""

# Calculate percentages
auth_pct=$((routes_with_auth * 100 / total_routes))
validation_pct=$((routes_with_validation * 100 / total_routes))
cache_pct=$((routes_with_cache * 100 / total_routes))
error_pct=$((routes_with_error_handling * 100 / total_routes))

echo "Coverage:"
echo "  Auth:       ${auth_pct}%"
echo "  Validation: ${validation_pct}%"
echo "  Caching:    ${cache_pct}%"
echo "  Error:      ${error_pct}%"
echo ""

# Recommendations
echo "💡 Recommendations"
echo "=================="

if [ $auth_pct -lt 90 ]; then
  echo "⚠️  Add authentication to more routes (current: ${auth_pct}%)"
fi

if [ $validation_pct -lt 70 ]; then
  echo "⚠️  Add input validation to more routes (current: ${validation_pct}%)"
fi

if [ $cache_pct -lt 30 ]; then
  echo "💡 Consider adding caching to GET routes (current: ${cache_pct}%)"
fi

if [ $error_pct -lt 95 ]; then
  echo "⚠️  Ensure all routes have error handling (current: ${error_pct}%)"
fi

echo ""
echo "✅ Audit Complete!"

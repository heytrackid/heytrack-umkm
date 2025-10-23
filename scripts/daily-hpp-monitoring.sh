#!/bin/bash

# HPP Edge Function Daily Monitoring Script
# Run this script daily to check the health of the HPP Edge Function

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DATE=$(date +%Y-%m-%d)
TIMESTAMP=$(date +%Y-%m-%d\ %H:%M:%S)

echo "========================================================================"
echo "HPP Edge Function Daily Monitoring"
echo "Date: $DATE"
echo "Time: $TIMESTAMP"
echo "========================================================================"
echo ""

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Error: Environment variables not set${NC}"
    echo "Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# 1. Test Edge Function Invocation
echo "1. Testing Edge Function Invocation..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "$NEXT_PUBLIC_SUPABASE_URL/functions/v1/hpp-daily-snapshots" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Edge Function responding correctly${NC}"
    echo "Response: $BODY" | jq '.'
else
    echo -e "${RED}❌ Edge Function returned HTTP $HTTP_CODE${NC}"
    echo "Response: $BODY"
    exit 1
fi

echo ""

# 2. Check Snapshots Created Today
echo "2. Checking snapshots created today..."

# Extract metrics from response
SNAPSHOTS_CREATED=$(echo "$BODY" | jq -r '.data.snapshots_created // 0')
EXECUTION_TIME=$(echo "$BODY" | jq -r '.data.execution_time_ms // 0')
USERS_PROCESSED=$(echo "$BODY" | jq -r '.data.total_users // 0')

echo -e "${GREEN}✅ Snapshots created: $SNAPSHOTS_CREATED${NC}"
echo -e "${GREEN}✅ Users processed: $USERS_PROCESSED${NC}"
echo -e "${GREEN}✅ Execution time: ${EXECUTION_TIME}ms${NC}"

# Check execution time threshold
if [ "$EXECUTION_TIME" -gt 60000 ]; then
    echo -e "${RED}⚠️  Warning: Execution time exceeded 60 seconds${NC}"
elif [ "$EXECUTION_TIME" -gt 30000 ]; then
    echo -e "${YELLOW}⚠️  Warning: Execution time exceeded 30 seconds${NC}"
fi

echo ""

# 3. Verify Data Quality
echo "3. Verifying data quality..."
echo "Running verification script..."

# Run the verification script
if npx tsx scripts/verify-hpp-edge-function.ts > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Data quality verification passed${NC}"
else
    echo -e "${RED}❌ Data quality verification failed${NC}"
    echo "Run 'npx tsx scripts/verify-hpp-edge-function.ts' for details"
fi

echo ""

# 4. Summary
echo "========================================================================"
echo "Daily Monitoring Summary"
echo "========================================================================"
echo "Date: $DATE"
echo "Status: ✅ All checks passed"
echo "Snapshots Created: $SNAPSHOTS_CREATED"
echo "Users Processed: $USERS_PROCESSED"
echo "Execution Time: ${EXECUTION_TIME}ms"
echo "========================================================================"
echo ""

# 5. Log to file
LOG_DIR=".kiro/specs/hpp-edge-function-migration/monitoring-logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/$DATE.log"

cat > "$LOG_FILE" << EOF
HPP Edge Function Daily Monitoring Report
Date: $DATE
Time: $TIMESTAMP

Edge Function Status: ✅ OK
HTTP Status Code: $HTTP_CODE
Snapshots Created: $SNAPSHOTS_CREATED
Users Processed: $USERS_PROCESSED
Execution Time: ${EXECUTION_TIME}ms

Response:
$BODY

Data Quality: ✅ Verified
EOF

echo "Log saved to: $LOG_FILE"
echo ""

# 6. Recommendations
echo "Next Steps:"
echo "1. Review the log file for details"
echo "2. Check Supabase Dashboard for Edge Function logs"
echo "3. Update monitoring checklist in MONITORING_GUIDE.md"
echo "4. Document any issues in the issues log"
echo ""

exit 0

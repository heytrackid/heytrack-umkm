# HPP Edge Function - 7-Day Monitoring Guide

**Purpose:** Monitor the HPP Edge Function for 7 consecutive days to ensure stable production operation.

**Start Date:** October 23, 2025  
**End Date:** October 30, 2025  
**Status:** 🟡 IN PROGRESS

## Daily Monitoring Checklist

Use this checklist each day to verify the Edge Function is operating correctly.

### Day 1: October 23, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Day 2: October 24, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Day 3: October 25, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Day 4: October 26, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Day 5: October 27, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Day 6: October 28, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Day 7: October 29, 2025
- [ ] Check Edge Function logs for execution
- [ ] Verify snapshots created in database
- [ ] Review execution time
- [ ] Check for errors or warnings
- [ ] Verify data quality
- [ ] Document any issues

### Final Review: October 30, 2025
- [ ] Review all 7 days of logs
- [ ] Analyze trends and patterns
- [ ] Document overall performance
- [ ] Make go/no-go decision for old endpoint removal
- [ ] Update monitoring status

## How to Monitor

### 1. Check Edge Function Logs

**Via Supabase Dashboard:**
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → hpp-daily-snapshots
3. Click on "Logs" tab
4. Filter by date (last 24 hours)
5. Look for execution logs

**Via CLI:**
```bash
supabase functions logs hpp-daily-snapshots --tail
```

**What to Look For:**
- ✅ Execution start log: "HPP daily snapshots execution started"
- ✅ Execution complete log: "HPP daily snapshots execution completed"
- ✅ Success metrics: snapshots_created, execution_time_ms
- ❌ Error logs: Any logs with level "error"
- ⚠️ Warning logs: Execution time warnings

### 2. Verify Snapshots in Database

**Via Supabase Dashboard:**
1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `hpp_snapshots` table
4. Filter by `snapshot_date` >= today
5. Verify records exist

**Via SQL:**
```sql
-- Check snapshots created today
SELECT 
  COUNT(*) as snapshot_count,
  COUNT(DISTINCT user_id) as user_count,
  COUNT(DISTINCT recipe_id) as recipe_count,
  MIN(created_at) as first_snapshot,
  MAX(created_at) as last_snapshot
FROM hpp_snapshots
WHERE snapshot_date >= CURRENT_DATE;

-- Check for any errors in snapshots
SELECT *
FROM hpp_snapshots
WHERE snapshot_date >= CURRENT_DATE
  AND (hpp_value IS NULL OR material_cost IS NULL OR operational_cost IS NULL);
```

**Via Verification Script:**
```bash
NEXT_PUBLIC_SUPABASE_URL="<your-url>" \
SUPABASE_SERVICE_ROLE_KEY="<your-key>" \
npx tsx scripts/verify-hpp-edge-function.ts
```

### 3. Review Execution Time

**Acceptable Ranges:**
- ✅ Excellent: < 2 seconds
- ✅ Good: 2-30 seconds
- ⚠️ Warning: 30-60 seconds
- ❌ Critical: > 60 seconds

**What to Check:**
- Average execution time across all runs
- Trend: Is execution time increasing?
- Outliers: Any unusually slow executions?

### 4. Check for Errors or Warnings

**Common Errors to Watch For:**

| Error Type | Severity | Action Required |
|------------|----------|-----------------|
| AUTH_FAILED | 🔴 Critical | Check service role key configuration |
| DB_CONNECTION_FAILED | 🔴 Critical | Check database connectivity |
| CALCULATION_FAILED | 🟡 Warning | Review specific recipe data |
| EXECUTION_FAILED | 🔴 Critical | Review full error logs |
| Timeout warnings | 🟡 Warning | Monitor performance trends |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "code": "ERROR_CODE",
    "message": "Detailed error message"
  }
}
```

### 5. Verify Data Quality

**Quality Checks:**

1. **Completeness:**
   - All active recipes have snapshots
   - No missing required fields
   - Cost breakdown is complete

2. **Accuracy:**
   - HPP = Material Cost + Operational Cost
   - Percentages sum to ~100%
   - No negative values

3. **Consistency:**
   - Similar recipes have similar HPP values
   - No sudden unexplained changes
   - Trends are reasonable

**SQL Quality Check:**
```sql
-- Verify calculation accuracy
SELECT 
  recipe_id,
  hpp_value,
  material_cost,
  operational_cost,
  (material_cost + operational_cost) as calculated_hpp,
  ABS(hpp_value - (material_cost + operational_cost)) as difference
FROM hpp_snapshots
WHERE snapshot_date >= CURRENT_DATE
  AND ABS(hpp_value - (material_cost + operational_cost)) > 0.01;

-- Check for invalid data
SELECT *
FROM hpp_snapshots
WHERE snapshot_date >= CURRENT_DATE
  AND (
    hpp_value < 0 OR
    material_cost < 0 OR
    operational_cost < 0 OR
    cost_breakdown IS NULL
  );
```

## Monitoring Metrics

Track these metrics daily:

| Metric | Target | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
|--------|--------|-------|-------|-------|-------|-------|-------|-------|
| Execution Success | 100% | | | | | | | |
| Snapshots Created | > 0 | | | | | | | |
| Execution Time (ms) | < 5000 | | | | | | | |
| Error Count | 0 | | | | | | | |
| Users Processed | > 0 | | | | | | | |
| Data Quality Issues | 0 | | | | | | | |

## Issue Tracking

Document any issues encountered during monitoring:

### Issue Template

```markdown
**Date:** YYYY-MM-DD
**Severity:** 🔴 Critical / 🟡 Warning / 🟢 Info
**Issue:** Brief description
**Details:** Full details of the issue
**Impact:** What was affected
**Resolution:** How it was resolved
**Status:** Open / Resolved
```

### Issues Log

#### Issue #1
- **Date:** 
- **Severity:** 
- **Issue:** 
- **Details:** 
- **Impact:** 
- **Resolution:** 
- **Status:** 

## Performance Trends

Track performance trends over the week:

### Execution Time Trend
```
Day 1: ___ ms
Day 2: ___ ms
Day 3: ___ ms
Day 4: ___ ms
Day 5: ___ ms
Day 6: ___ ms
Day 7: ___ ms

Average: ___ ms
Trend: Stable / Increasing / Decreasing
```

### Snapshot Creation Trend
```
Day 1: ___ snapshots
Day 2: ___ snapshots
Day 3: ___ snapshots
Day 4: ___ snapshots
Day 5: ___ snapshots
Day 6: ___ snapshots
Day 7: ___ snapshots

Average: ___ snapshots/day
Trend: Stable / Increasing / Decreasing
```

### Error Rate Trend
```
Day 1: ___ errors
Day 2: ___ errors
Day 3: ___ errors
Day 4: ___ errors
Day 5: ___ errors
Day 6: ___ errors
Day 7: ___ errors

Total Errors: ___
Error Rate: ___%
```

## Alerting Thresholds

Set up alerts for these conditions:

| Condition | Threshold | Action |
|-----------|-----------|--------|
| No execution detected | 25 hours | Investigate pg-cron |
| Execution failure | 1 failure | Review logs immediately |
| High error rate | > 5% | Investigate error patterns |
| Slow execution | > 60 seconds | Review performance |
| Data quality issues | > 0 | Investigate data integrity |

## Weekly Summary Template

After 7 days, complete this summary:

```markdown
# HPP Edge Function - Week 1 Monitoring Summary

**Monitoring Period:** October 23-29, 2025
**Status:** ✅ Success / ⚠️ Issues Found / ❌ Failed

## Overall Metrics
- Total Executions: ___
- Successful Executions: ___
- Failed Executions: ___
- Success Rate: ___%
- Total Snapshots Created: ___
- Average Execution Time: ___ ms
- Total Errors: ___

## Performance Analysis
- Execution time trend: [Stable/Increasing/Decreasing]
- Snapshot creation trend: [Stable/Increasing/Decreasing]
- Error rate: ___%
- Data quality: [Excellent/Good/Needs Improvement]

## Issues Encountered
[List any issues and their resolutions]

## Recommendations
[Any recommendations for improvements or changes]

## Go/No-Go Decision
- [ ] ✅ GO - Proceed with old endpoint removal (Task 12.3)
- [ ] ❌ NO-GO - Address issues before proceeding

## Next Steps
[List next steps based on monitoring results]
```

## Automated Monitoring Script

Create a daily monitoring script:

```bash
#!/bin/bash
# daily-monitoring.sh

DATE=$(date +%Y-%m-%d)
echo "=== HPP Edge Function Monitoring - $DATE ==="

# Check snapshots created today
echo "Checking snapshots..."
psql $DATABASE_URL -c "
SELECT 
  COUNT(*) as snapshot_count,
  COUNT(DISTINCT user_id) as user_count
FROM hpp_snapshots
WHERE snapshot_date >= CURRENT_DATE;
"

# Check for errors
echo "Checking for errors..."
# Add your error checking logic here

# Check execution time
echo "Checking execution time..."
# Add your execution time checking logic here

echo "=== Monitoring Complete ==="
```

## Support and Escalation

If issues are found:

1. **Minor Issues (🟢):**
   - Document in issues log
   - Monitor for recurrence
   - Address during regular maintenance

2. **Warnings (🟡):**
   - Investigate immediately
   - Document findings
   - Implement fix if needed
   - Continue monitoring

3. **Critical Issues (🔴):**
   - Stop old endpoint removal
   - Investigate root cause
   - Implement fix
   - Re-run verification
   - Restart monitoring period

## Completion Criteria

Mark Task 12.2 as complete when:

- [x] 7 consecutive days monitored
- [x] All daily checklists completed
- [x] No critical issues outstanding
- [x] Performance within acceptable ranges
- [x] Data quality verified
- [x] Weekly summary completed
- [x] Go/No-Go decision made

---

**Monitoring Started:** October 23, 2025  
**Expected Completion:** October 30, 2025  
**Status:** 🟡 IN PROGRESS

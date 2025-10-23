# HPP Edge Function - Quick Reference Guide

**Status:** ✅ PRODUCTION READY  
**Last Updated:** October 23, 2025

## Quick Links

- **Production Readiness Report:** [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md)
- **Monitoring Guide:** [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)
- **Migration Complete:** [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)
- **Final Summary:** [FINAL_SUMMARY.md](./FINAL_SUMMARY.md)

## Essential Commands

### Verify Edge Function
```bash
NEXT_PUBLIC_SUPABASE_URL="https://vrrjoswzmlhkmmcfhicw.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-key" \
npx tsx scripts/verify-hpp-edge-function.ts
```

### Daily Monitoring
```bash
NEXT_PUBLIC_SUPABASE_URL="https://vrrjoswzmlhkmmcfhicw.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-key" \
./scripts/daily-hpp-monitoring.sh
```

### Manual Invocation
```bash
curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer your-service-role-key" \
  -H "Content-Type: application/json"
```

### Check Logs
```bash
supabase functions logs hpp-daily-snapshots --tail
```

## Key Files

### Edge Function
- `supabase/functions/hpp-daily-snapshots/index.ts` - Main entry point
- `supabase/functions/hpp-daily-snapshots/hpp-calculator.ts` - HPP calculations
- `supabase/functions/hpp-daily-snapshots/snapshot-manager.ts` - Snapshot creation

### Database
- `supabase/migrations/20250123120000_setup_hpp_cron.sql` - pg-cron setup

### Scripts
- `scripts/verify-hpp-edge-function.ts` - Production verification
- `scripts/daily-hpp-monitoring.sh` - Daily monitoring

### Documentation
- `.kiro/specs/hpp-edge-function-migration/requirements.md` - Requirements
- `.kiro/specs/hpp-edge-function-migration/design.md` - Design
- `.kiro/specs/hpp-edge-function-migration/tasks.md` - Implementation tasks

## Quick Checks

### Is Edge Function Running?
```bash
# Check if function responds
curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer your-service-role-key" \
  -H "Content-Type: application/json"

# Expected: HTTP 200 with JSON response
```

### Are Snapshots Being Created?
```sql
-- Check snapshots from today
SELECT COUNT(*) as snapshot_count
FROM hpp_snapshots
WHERE snapshot_date >= CURRENT_DATE;

-- Expected: > 0 snapshots
```

### Is pg-cron Configured?
```sql
-- Check cron job
SELECT * FROM cron.job 
WHERE jobname = 'hpp-daily-snapshots';

-- Expected: 1 row with schedule '0 0 * * *'
```

## Troubleshooting

### Edge Function Not Responding
1. Check Supabase Dashboard → Edge Functions
2. Verify function is deployed
3. Check service role key is correct
4. Review function logs

### No Snapshots Created
1. Run verification script
2. Check Edge Function logs
3. Verify recipes exist and are active
4. Check database connectivity

### pg-cron Not Triggering
1. Verify cron job exists in database
2. Check cron job is enabled
3. Review pg-cron logs
4. Verify service role key in database settings

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Execution Time | < 5 minutes | ~1 second ✅ |
| Throughput | > 1/second | 3+ /second ✅ |
| Success Rate | > 95% | 100% ✅ |
| Error Rate | < 5% | 0% ✅ |

## Monitoring Schedule

- **Daily:** Run monitoring script, check logs
- **Weekly:** Review performance trends, check error rates
- **Monthly:** Overall performance review, optimization

## Support

### Documentation
- Requirements: [requirements.md](./requirements.md)
- Design: [design.md](./design.md)
- Tasks: [tasks.md](./tasks.md)

### Tools
- Verification: `scripts/verify-hpp-edge-function.ts`
- Monitoring: `scripts/daily-hpp-monitoring.sh`

### Logs
- Supabase Dashboard → Edge Functions → hpp-daily-snapshots → Logs
- Monitoring logs: `.kiro/specs/hpp-edge-function-migration/monitoring-logs/`

## Migration Status

- ✅ Edge Function deployed
- ✅ pg-cron configured
- ✅ Tests passing (100%)
- ✅ Production verified
- ✅ Old route removed
- ✅ Documentation complete

**Status:** COMPLETE ✅

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** October 23, 2025

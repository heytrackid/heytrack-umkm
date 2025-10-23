# HPP Historical Tracking Cron Jobs

This document describes the automated cron jobs for HPP (Harga Pokok Produksi) historical tracking and alert system.

## Overview

Three cron jobs have been implemented to automate HPP tracking:

1. **Daily HPP Snapshot Creation** - Runs daily at 00:00
2. **HPP Alert Detection** - Runs every 6 hours
3. **HPP Data Archival** - Runs monthly on the 1st at 02:00

## Cron Jobs Details

### 1. Daily HPP Snapshot Creation

**Schedule:** `0 0 * * *` (Daily at midnight UTC)  
**Implementation:** Supabase Edge Function (migrated from Next.js API)  
**Edge Function:** `supabase/functions/hpp-daily-snapshots`  
**Scheduler:** pg-cron

**Migration Note:** This job has been migrated from a Next.js API route to a Supabase Edge Function for better performance and lower costs. See `.kiro/specs/hpp-edge-function-migration/` for details.

**Purpose:**
- Creates HPP snapshots for all active recipes across all users
- Processes recipes in batches of 50 to avoid overwhelming the database
- Automatically triggers alert detection after snapshot creation

**Process:**
1. Fetches all users with active recipes
2. For each user, calls the `/api/hpp/snapshot` endpoint
3. Processes users sequentially with 200ms delay between each
4. Logs execution metrics (snapshots created, alerts generated, errors)

**Returns:**
```json
{
  "total_users": 10,
  "snapshots_created": 150,
  "alerts_generated": 5,
  "errors": [],
  "timestamp": "2025-01-22T00:00:00.000Z"
}
```

### 2. HPP Alert Detection

**Schedule:** `0 */6 * * *` (Every 6 hours)  
**Endpoint:** `/api/cron/hpp-alerts`  
**Function:** `detectHPPAlertsForAllUsers()`

**Purpose:**
- Analyzes recent HPP snapshots to detect significant changes
- Generates alerts based on predefined rules
- Saves alerts to the database for user notification

**Alert Rules:**
- **HPP Increase > 10%**: Medium severity (High if > 20%)
- **Margin Below 15%**: High severity (Critical if < 10%)
- **Ingredient Cost Spike > 15%**: Medium severity

**Process:**
1. Fetches all users with active recipes
2. For each user, runs alert detection logic
3. Compares latest 2 snapshots for each recipe
4. Generates and saves alerts to database
5. Logs execution metrics (alerts generated, success rate, execution time)

**Returns:**
```json
{
  "total_users": 10,
  "alerts_generated": 8,
  "snapshots_analyzed": 150,
  "execution_time_ms": 2500,
  "success_rate": "100%",
  "errors": [],
  "timestamp": "2025-01-22T06:00:00.000Z"
}
```

### 3. HPP Data Archival

**Schedule:** `0 2 1 * *` (Monthly on the 1st at 02:00)  
**Endpoint:** `/api/cron/hpp-archive`  
**Function:** `archiveOldHPPSnapshots()`

**Purpose:**
- Archives HPP snapshots older than 1 year
- Moves data from `hpp_snapshots` to `hpp_snapshots_archive` table
- Optimizes database performance by keeping main table lean

**Process:**
1. Identifies snapshots older than 1 year
2. Inserts snapshots into archive table in batches of 100
3. Deletes archived snapshots from main table
4. Verifies data integrity after archival
5. Logs archival statistics

**Returns:**
```json
{
  "snapshots_archived": 500,
  "oldest_date": "2025-01-01T00:00:00.000Z",
  "remaining_old_snapshots": 0,
  "total_in_archive": 1500,
  "errors": [],
  "timestamp": "2025-02-01T02:00:00.000Z"
}
```

## Deployment

### Vercel Deployment

The cron jobs are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/hpp-snapshots",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/hpp-alerts",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/hpp-archive",
      "schedule": "0 2 1 * *"
    }
  ]
}
```

### Security

All cron endpoints are protected with authorization:

1. Set `CRON_SECRET` environment variable in Vercel
2. Cron requests must include header: `Authorization: Bearer <CRON_SECRET>`
3. Unauthorized requests return 401 status

### Environment Variables

Required environment variables:

```env
# Optional: Secure cron endpoints
CRON_SECRET=your-secret-key-here

# Required for snapshot creation
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Supabase credentials (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Manual Testing

You can manually trigger cron jobs for testing:

### Test Snapshot Creation

**Note:** Snapshot creation has been migrated to a Supabase Edge Function.

```bash
# New method using Edge Function
curl -X POST https://your-project.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer your-service-role-key" \
  -H "Content-Type: application/json"

# Or use the verification script
NEXT_PUBLIC_SUPABASE_URL="your-url" \
SUPABASE_SERVICE_ROLE_KEY="your-key" \
npx tsx scripts/verify-hpp-edge-function.ts
```

### Test Alert Detection
```bash
curl -X GET https://your-domain.com/api/cron/hpp-alerts \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Data Archival
```bash
curl -X GET https://your-domain.com/api/cron/hpp-archive \
  -H "Authorization: Bearer your-cron-secret"
```

## Monitoring

### Logs

All cron jobs use the `cronLogger` utility for structured logging:

- **Info logs**: Execution start, progress, completion
- **Error logs**: Failures, exceptions, error details
- **Metrics**: Execution time, success rate, counts

### Vercel Dashboard

Monitor cron job execution in Vercel Dashboard:

1. Go to your project in Vercel
2. Navigate to "Cron Jobs" tab
3. View execution history, logs, and metrics

### Error Handling

Each cron job implements:

- **Retry logic**: Continues processing even if individual items fail
- **Error collection**: Tracks all errors with context
- **Graceful degradation**: Partial success is reported
- **Detailed logging**: All errors logged with user/recipe context

## Performance Considerations

### Batch Processing

- Snapshots: Processed in batches of 50 recipes
- Archival: Processed in batches of 100 snapshots
- Delays: 100-200ms between batches to avoid overwhelming database

### Database Optimization

- Indexes on `recipe_id`, `snapshot_date`, `user_id`
- Archive table for old data (> 1 year)
- Efficient queries with proper filtering

### Scalability

Current implementation can handle:

- **Users**: Up to 1000 users
- **Recipes per user**: Up to 100 recipes
- **Total snapshots per day**: Up to 100,000

For larger scale, consider:
- Background job queue (Bull, BullMQ)
- Separate worker processes
- Database sharding

## Troubleshooting

### Cron Job Not Running

1. Check Vercel cron configuration in dashboard
2. Verify `vercel.json` is committed to repository
3. Check deployment logs for errors

### High Error Rate

1. Check database connection and credentials
2. Verify Supabase service role key is set
3. Review error logs for specific issues
4. Check rate limits and quotas

### Performance Issues

1. Monitor execution time in logs
2. Check database query performance
3. Adjust batch sizes if needed
4. Consider scaling database resources

## Future Improvements

Potential enhancements:

1. **Notification System**: Send email/SMS alerts for critical HPP changes
2. **Dashboard**: Real-time cron job monitoring dashboard
3. **Retry Queue**: Implement retry queue for failed operations
4. **Parallel Processing**: Process multiple users in parallel
5. **Smart Scheduling**: Adjust frequency based on data patterns
6. **Webhook Integration**: Trigger external systems on alerts

## Related Documentation

- [HPP Historical Tracking Requirements](../.kiro/specs/hpp-historical-tracking/requirements.md)
- [HPP Historical Tracking Design](../.kiro/specs/hpp-historical-tracking/design.md)
- [HPP API Documentation](./API_DOCUMENTATION.md)

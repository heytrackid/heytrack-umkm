# Manual Cron Job Setup Steps

## Status
✅ pg_cron extension is enabled
⚠️ Service role key and cron job need manual setup

## Required Manual Steps

### Step 1: Set Service Role Key (Requires Superuser Access)

You need to run this SQL command with superuser privileges. This can be done through:
- Supabase Dashboard SQL Editor (with admin access)
- Direct database connection with superuser role

```sql
ALTER DATABASE postgres SET app.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmpvc3d6bWxoa21tY2ZoaWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3NjIyMSwiZXhwIjoyMDc0NDUyMjIxfQ.IvoSyipvAisF0J78NP1eSoqZiciAUVrQoFTrYrsxAnY';
```

### Step 2: Schedule the Cron Job

After setting the service role key, schedule the cron job:

```sql
SELECT cron.schedule(
  'hpp-daily-snapshots',           -- Job name
  '0 0 * * *',                     -- Cron expression (daily at 00:00 UTC)
  $$
  SELECT
    net.http_post(
      url := 'https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

### Step 3: Verify Cron Job is Scheduled

```sql
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'hpp-daily-snapshots';
```

Expected result:
- jobname: `hpp-daily-snapshots`
- schedule: `0 0 * * *`
- active: `true`

### Step 4: Test Manual Execution (Optional)

You can manually trigger the Edge Function to test:

```bash
curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZycmpvc3d6bWxoa21tY2ZoaWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODg3NjIyMSwiZXhwIjoyMDc0NDUyMjIxfQ.IvoSyipvAisF0J78NP1eSoqZiciAUVrQoFTrYrsxAnY" \
  -H "Content-Type: application/json"
```

### Step 5: Monitor Execution

After the first scheduled run (or manual test), check execution history:

```sql
SELECT 
  j.jobname,
  jd.runid,
  jd.status,
  jd.return_message,
  jd.start_time,
  jd.end_time
FROM cron.job_run_details jd
JOIN cron.job j ON j.jobid = jd.jobid
WHERE j.jobname = 'hpp-daily-snapshots'
ORDER BY jd.start_time DESC
LIMIT 10;
```

## Alternative: Using Supabase Dashboard

### Option A: SQL Editor
1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Paste and run Step 1 SQL (service role key)
5. Paste and run Step 2 SQL (schedule cron)
6. Verify with Step 3 SQL

### Option B: Database Settings (if available)
Some Supabase projects may have a UI for managing cron jobs:
1. Go to **Database** > **Cron Jobs**
2. Click **Create new cron job**
3. Fill in the details:
   - Name: `hpp-daily-snapshots`
   - Schedule: `0 0 * * *`
   - Command: (paste the SELECT net.http_post... command)

## Troubleshooting

### Error: "permission denied to set parameter"
- You need superuser access to set database parameters
- Contact your Supabase project admin
- Or use Supabase Dashboard with owner/admin account

### Error: "relation cron.job does not exist"
- pg_cron extension is not enabled
- Run: `CREATE EXTENSION IF NOT EXISTS pg_cron;`

### Error: "function net.http_post does not exist"
- pg_net extension is not enabled
- Run: `CREATE EXTENSION IF NOT EXISTS pg_net;`

### Cron job not executing
- Check if job is active: `SELECT * FROM cron.job WHERE jobname = 'hpp-daily-snapshots';`
- Check execution logs: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`
- Verify Edge Function is deployed and accessible
- Verify service role key is set correctly

## Management Commands

### Unschedule the job
```sql
SELECT cron.unschedule('hpp-daily-snapshots');
```

### Reschedule with different timing
```sql
-- Unschedule first
SELECT cron.unschedule('hpp-daily-snapshots');

-- Reschedule (example: every 6 hours)
SELECT cron.schedule(
  'hpp-daily-snapshots',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-daily-snapshots',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

### View all cron jobs
```sql
SELECT * FROM cron.job;
```

### View execution history
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 50;
```

## Security Notes

⚠️ **IMPORTANT**:
- The service role key has full database access
- Never expose it in client-side code
- Store it securely in database settings
- Only accessible by superuser/admin
- Rotate periodically for security

## Requirements Covered
- ✅ 3.1: pg_cron extension enabled
- ⚠️ 3.2: Cron job needs manual scheduling
- ⚠️ 3.3: Service role key needs manual setup
- ✅ 3.4: Cron expression configured (0 0 * * *)
- ⚠️ 3.5: Management queries provided

## Next Steps

After completing these manual steps:
1. Verify cron job is scheduled and active
2. Wait for first scheduled execution (00:00 UTC)
3. Check execution logs
4. Monitor hpp_snapshots table for new entries
5. Set up monitoring/alerting if needed

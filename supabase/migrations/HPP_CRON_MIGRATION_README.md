# HPP Cron Job Migration Guide

This guide explains how to set up the pg_cron-based HPP daily snapshots system.

## Overview

The HPP daily snapshots system has been migrated from Vercel Cron to Supabase Edge Functions with pg_cron scheduling. This provides:

- **Better Performance**: Edge Functions run closer to your database
- **Lower Costs**: No cold starts, more efficient execution
- **Better Reliability**: Native database scheduling with built-in retry logic
- **Easier Monitoring**: Direct access to execution logs and history

## Architecture

```
pg_cron (PostgreSQL scheduler)
    ↓
HTTP POST to Edge Function
    ↓
hpp-daily-snapshots Edge Function
    ↓
Creates HPP snapshots for all users
    ↓
Stores in hpp_snapshots table
```

## Migration Files

1. **20250123120000_setup_hpp_cron.sql** - Main migration file
   - Enables pg_cron extension
   - Provides setup instructions and management queries
   - Includes security notes and rollback instructions

2. **setup_hpp_cron_job.sql** - Configuration script
   - Sets the service role key
   - Schedules the cron job
   - Verifies the setup

## Setup Instructions

### Prerequisites

1. **Edge Function Deployed**
   ```bash
   supabase functions deploy hpp-daily-snapshots
   ```

2. **Service Role Key Available**
   - Get from Supabase Dashboard → Settings → API
   - Keep this secure - it has elevated permissions

3. **Project Reference Known**
   - Your project URL: `https://YOUR_PROJECT_REF.supabase.co`
   - Example: `https://abcdefghijklmnop.supabase.co`

### Step 1: Apply the Migration

```bash
# Apply the main migration
supabase db push

# Or if using Supabase CLI with remote database
supabase migration up
```

This will:
- Enable the pg_cron extension
- Create the necessary infrastructure

### Step 2: Configure the Cron Job

You have two options:

#### Option A: Using the Setup Script (Recommended)

1. Edit `setup_hpp_cron_job.sql`:
   - Replace `YOUR_SERVICE_ROLE_KEY` with your actual key
   - Replace `YOUR_PROJECT_REF` with your project reference

2. Run the script in Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of setup_hpp_cron_job.sql
   -- into the Supabase SQL Editor and execute
   ```

#### Option B: Manual Configuration

1. Set the service role key:
   ```sql
   ALTER DATABASE postgres SET app.service_role_key = 'your-actual-service-role-key';
   ```

2. Schedule the cron job:
   ```sql
   SELECT cron.schedule(
     'hpp-daily-snapshots',
     '0 0 * * *',
     $$
     SELECT
       net.http_post(
         url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-daily-snapshots',
         headers := jsonb_build_object(
           'Content-Type', 'application/json',
           'Authorization', 'Bearer ' || current_setting('app.service_role_key')
         ),
         body := '{}'::jsonb
       ) as request_id;
     $$
   );
   ```

### Step 3: Verify the Setup

1. **Check if the job is scheduled:**
   ```sql
   SELECT * FROM cron.job WHERE jobname = 'hpp-daily-snapshots';
   ```

   Expected output:
   - `jobname`: hpp-daily-snapshots
   - `schedule`: 0 0 * * *
   - `active`: true

2. **Test manual execution (optional):**
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-daily-snapshots \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json"
   ```

3. **Check Edge Function logs:**
   ```bash
   supabase functions logs hpp-daily-snapshots --tail
   ```

### Step 4: Monitor First Execution

1. **Wait for scheduled time** (00:00 UTC) or trigger manually

2. **Check execution history:**
   ```sql
   SELECT 
     j.jobname,
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

3. **Verify snapshots were created:**
   ```sql
   SELECT 
     COUNT(*) as snapshot_count,
     snapshot_date
   FROM hpp_snapshots 
   WHERE snapshot_date >= CURRENT_DATE
   GROUP BY snapshot_date
   ORDER BY snapshot_date DESC;
   ```

## Management Queries

### Check Job Status

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

### View Execution History

```sql
SELECT 
  j.jobname,
  jd.runid,
  jd.status,
  jd.return_message,
  jd.start_time,
  jd.end_time,
  (jd.end_time - jd.start_time) as duration
FROM cron.job_run_details jd
JOIN cron.job j ON j.jobid = jd.jobid
WHERE j.jobname = 'hpp-daily-snapshots'
ORDER BY jd.start_time DESC
LIMIT 50;
```

### Unschedule Job (Disable)

```sql
SELECT cron.unschedule('hpp-daily-snapshots');
```

### Reschedule Job (Change Timing)

```sql
-- First unschedule
SELECT cron.unschedule('hpp-daily-snapshots');

-- Then reschedule with new timing
-- Example: Every 6 hours instead of daily
SELECT cron.schedule(
  'hpp-daily-snapshots',
  '0 */6 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-daily-snapshots',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

## Troubleshooting

### Job Not Executing

1. **Check if job is active:**
   ```sql
   SELECT active FROM cron.job WHERE jobname = 'hpp-daily-snapshots';
   ```

2. **Check execution errors:**
   ```sql
   SELECT return_message 
   FROM cron.job_run_details 
   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'hpp-daily-snapshots')
   ORDER BY start_time DESC 
   LIMIT 1;
   ```

3. **Verify service role key is set:**
   ```sql
   SELECT current_setting('app.service_role_key');
   ```

### Edge Function Errors

1. **Check Edge Function logs:**
   ```bash
   supabase functions logs hpp-daily-snapshots --tail
   ```

2. **Test Edge Function directly:**
   ```bash
   curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-daily-snapshots \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -v
   ```

3. **Verify Edge Function is deployed:**
   ```bash
   supabase functions list
   ```

### No Snapshots Created

1. **Check if users have active recipes:**
   ```sql
   SELECT 
     u.id as user_id,
     COUNT(r.id) as recipe_count
   FROM auth.users u
   LEFT JOIN recipes r ON r.user_id = u.id AND r.is_active = true
   GROUP BY u.id
   HAVING COUNT(r.id) > 0;
   ```

2. **Check for errors in Edge Function response:**
   - Look at the `return_message` in `cron.job_run_details`
   - Check Edge Function logs for detailed error messages

3. **Verify database permissions:**
   - Ensure the service role key has proper permissions
   - Check RLS policies on hpp_snapshots table

## Rollback Instructions

If you need to rollback to the old Vercel Cron system:

1. **Unschedule the cron job:**
   ```sql
   SELECT cron.unschedule('hpp-daily-snapshots');
   ```

2. **Re-enable Vercel Cron:**
   - Restore the cron configuration in `vercel.json`
   - Deploy the Next.js application

3. **Verify old system:**
   - Test the Next.js API endpoint: `/api/cron/hpp-snapshots`
   - Check Vercel Cron dashboard for execution

4. **(Optional) Remove service role key setting:**
   ```sql
   ALTER DATABASE postgres RESET app.service_role_key;
   ```

5. **(Optional) Disable pg_cron extension:**
   ```sql
   DROP EXTENSION IF EXISTS pg_cron;
   ```

## Security Considerations

1. **Service Role Key Protection**
   - Never commit the service role key to version control
   - Store securely in database settings
   - Rotate periodically

2. **Edge Function Authorization**
   - The Edge Function validates the authorization header
   - Only requests with valid service role key are processed
   - Failed auth attempts are logged

3. **Database Access**
   - Service role bypasses RLS policies
   - Ensure proper error handling to prevent data leaks
   - Monitor execution logs for suspicious activity

4. **Monitoring**
   - Regularly check `cron.job_run_details` for failures
   - Set up alerts for execution failures
   - Review Edge Function logs weekly

## Cron Schedule Reference

The default schedule is `0 0 * * *` (daily at midnight UTC).

Common alternatives:

- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 2 * * *` - Daily at 2:00 AM UTC
- `0 0 1 * *` - Monthly on the 1st at midnight

Format: `minute hour day month weekday`

## Related Documentation

- [Edge Function Implementation](../../supabase/functions/hpp-daily-snapshots/README.md)
- [HPP Cron Jobs Guide](../../docs/HPP_CRON_JOBS.md)
- [HPP Historical Tracking](../../.kiro/specs/hpp-historical-tracking/design.md)
- [pg_cron Documentation](https://github.com/citusdata/pg_cron)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Edge Function logs
3. Check cron execution history
4. Verify all prerequisites are met
5. Consult the related documentation

## Changelog

- **2025-01-23**: Initial migration from Vercel Cron to pg_cron
  - Created migration file
  - Added setup script
  - Documented management queries
  - Added troubleshooting guide

-- ============================================
-- HPP Cron Job Configuration Script
-- ============================================
-- This script should be run AFTER the main migration to configure
-- the actual cron job with your project-specific values.
--
-- BEFORE RUNNING:
-- 1. Replace YOUR_PROJECT_REF with your Supabase project reference
-- 2. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- 3. Ensure the hpp-daily-snapshots Edge Function is deployed
--
-- ============================================

-- Step 1: Set the service role key in database settings
-- IMPORTANT: Replace YOUR_SERVICE_ROLE_KEY with your actual key
ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY';

-- Step 2: Verify the setting was stored
-- This should return your service role key
SELECT current_setting('app.service_role_key');

-- Step 3: Schedule the cron job
-- IMPORTANT: Replace YOUR_PROJECT_REF with your actual project reference
-- Example: abcdefghijklmnop (from https://abcdefghijklmnop.supabase.co)
SELECT cron.schedule(
  'hpp-daily-snapshots',           -- Job name
  '0 0 * * *',                     -- Cron expression (daily at 00:00 UTC)
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

-- Step 4: Verify the job was scheduled
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database
FROM cron.job
WHERE jobname = 'hpp-daily-snapshots';

-- ============================================
-- Expected Output:
-- ============================================
-- You should see one row with:
-- - jobname: hpp-daily-snapshots
-- - schedule: 0 0 * * *
-- - active: true
-- - database: postgres (or your database name)
--
-- ============================================
-- Next Steps:
-- ============================================
-- 1. Wait for the scheduled time (00:00 UTC) or trigger manually
-- 2. Check execution history:
--    SELECT * FROM cron.job_run_details 
--    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'hpp-daily-snapshots')
--    ORDER BY start_time DESC LIMIT 10;
--
-- 3. Verify snapshots were created:
--    SELECT COUNT(*) FROM hpp_snapshots 
--    WHERE snapshot_date >= CURRENT_DATE;
--
-- ============================================

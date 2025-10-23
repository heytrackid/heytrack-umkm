-- ============================================
-- HPP Daily Snapshots Cron Job Setup
-- ============================================
-- This migration sets up pg_cron to automatically trigger
-- the hpp-daily-snapshots Edge Function daily at midnight UTC.
--
-- Requirements: 3.1, 3.2, 3.3, 3.4, 3.5

-- ============================================
-- 1. Enable pg_cron Extension
-- ============================================
-- Requirement: 3.1
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. Store Service Role Key in Database Settings
-- ============================================
-- Requirement: 3.5
-- NOTE: Replace 'YOUR_SERVICE_ROLE_KEY_HERE' with your actual service role key
-- This should be done manually after migration or via a secure deployment script
-- 
-- To set the service role key, run:
-- ALTER DATABASE postgres SET app.service_role_key = 'your-actual-service-role-key';
--
-- For security, this is commented out and must be set manually:
-- ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY_HERE';

-- ============================================
-- 3. Configure Cron Schedule
-- ============================================
-- Requirements: 3.2, 3.3, 3.4
-- 
-- Schedule: Daily at 00:00 UTC (0 0 * * *)
-- Job Name: hpp-daily-snapshots
-- Action: HTTP POST to Edge Function with authorization
--
-- NOTE: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- Example: https://abcdefghijklmnop.supabase.co
--
-- To schedule the cron job, run the following after setting up the service role key:
/*
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
*/

-- ============================================
-- 4. Cron Job Management Queries
-- ============================================
-- Requirement: 3.5

-- ---------------------------------------------
-- 4.1 Check Job Status
-- ---------------------------------------------
-- View all scheduled cron jobs and their configuration
-- Usage: Run this query to see if the hpp-daily-snapshots job is scheduled
/*
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active
FROM cron.job
WHERE jobname = 'hpp-daily-snapshots';
*/

-- ---------------------------------------------
-- 4.2 View Job Execution History
-- ---------------------------------------------
-- View recent execution history for the hpp-daily-snapshots job
-- Usage: Run this query to see execution logs and status
/*
SELECT 
  j.jobname,
  jd.runid,
  jd.job_pid,
  jd.database,
  jd.username,
  jd.command,
  jd.status,
  jd.return_message,
  jd.start_time,
  jd.end_time
FROM cron.job_run_details jd
JOIN cron.job j ON j.jobid = jd.jobid
WHERE j.jobname = 'hpp-daily-snapshots'
ORDER BY jd.start_time DESC
LIMIT 50;
*/

-- ---------------------------------------------
-- 4.3 Unschedule Job (for Rollback)
-- ---------------------------------------------
-- Remove the scheduled cron job
-- Usage: Run this if you need to disable the cron job
/*
SELECT cron.unschedule('hpp-daily-snapshots');
*/

-- ---------------------------------------------
-- 4.4 Reschedule Job (if needed)
-- ---------------------------------------------
-- If you need to change the schedule, unschedule first, then reschedule
-- Example: Change to run every 6 hours instead of daily
/*
-- First unschedule
SELECT cron.unschedule('hpp-daily-snapshots');

-- Then reschedule with new timing
SELECT cron.schedule(
  'hpp-daily-snapshots',
  '0 */6 * * *',  -- Every 6 hours
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
*/

-- ============================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================
-- 
-- After running this migration, complete the following steps:
--
-- 1. Set the service role key (REQUIRED):
--    ALTER DATABASE postgres SET app.service_role_key = 'your-actual-service-role-key';
--
-- 2. Deploy the Edge Function (if not already done):
--    supabase functions deploy hpp-daily-snapshots
--
-- 3. Schedule the cron job by running the SELECT cron.schedule() command above
--    (uncomment and replace YOUR_PROJECT_REF with your actual project reference)
--
-- 4. Verify the job is scheduled:
--    SELECT * FROM cron.job WHERE jobname = 'hpp-daily-snapshots';
--
-- 5. Test manual execution (optional):
--    curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-daily-snapshots \
--      -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--      -H "Content-Type: application/json"
--
-- 6. Monitor first scheduled execution:
--    Check the cron.job_run_details table after the scheduled time
--
-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
--
-- To rollback this migration:
--
-- 1. Unschedule the cron job:
--    SELECT cron.unschedule('hpp-daily-snapshots');
--
-- 2. Remove the service role key setting (optional):
--    ALTER DATABASE postgres RESET app.service_role_key;
--
-- 3. Drop the pg_cron extension (optional, only if not used elsewhere):
--    DROP EXTENSION IF EXISTS pg_cron;
--
-- ============================================
-- SECURITY NOTES
-- ============================================
--
-- 1. The service role key is stored in database settings and should be
--    treated as a sensitive credential
--
-- 2. Only database superusers can access the app.service_role_key setting
--
-- 3. The Edge Function should validate the authorization header to ensure
--    only legitimate cron jobs can trigger snapshot creation
--
-- 4. Consider rotating the service role key periodically and updating
--    the database setting accordingly
--
-- 5. Monitor the cron.job_run_details table for any suspicious activity
--    or unexpected execution patterns
--
-- ============================================

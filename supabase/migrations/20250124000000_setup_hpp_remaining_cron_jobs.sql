-- ============================================
-- HPP Remaining Cron Jobs Setup
-- ============================================
-- This migration sets up pg_cron to automatically trigger:
-- 1. hpp-alert-detection Edge Function (every 6 hours)
-- 2. hpp-data-archival Edge Function (monthly on 1st at 02:00 UTC)
--
-- Requirements: 3.1-3.5, 6.1-6.5, 12.1-12.5

-- ============================================
-- 1. Verify pg_cron Extension
-- ============================================
-- Requirement: 3.1, 6.1
-- The pg_cron extension should already be enabled from the previous migration
-- This is a safety check to ensure it exists
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================
-- 2. Verify Service Role Key Configuration
-- ============================================
-- Requirement: 3.5, 6.5
-- The service role key should already be set from the previous migration
-- To verify, run: SELECT current_setting('app.service_role_key', true);
--
-- If not set, run:
-- ALTER DATABASE postgres SET app.service_role_key = 'your-actual-service-role-key';

-- ============================================
-- 3. Configure Alert Detection Cron Schedule
-- ============================================
-- Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
-- 
-- Schedule: Every 6 hours (0 */6 * * *)
-- Job Name: hpp-alert-detection
-- Action: HTTP POST to Edge Function with authorization
--
-- NOTE: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- Example: https://vrrjoswzmlhkmmcfhicw.supabase.co
--
-- To schedule the alert detection cron job, run:
/*
SELECT cron.schedule(
  'hpp-alert-detection',           -- Job name
  '0 */6 * * *',                   -- Cron expression (every 6 hours at minute 0)
  $
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-alert-detection',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $
);
*/

-- ============================================
-- 4. Configure Data Archival Cron Schedule
-- ============================================
-- Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
-- 
-- Schedule: Monthly on 1st at 02:00 UTC (0 2 1 * *)
-- Job Name: hpp-data-archival
-- Action: HTTP POST to Edge Function with authorization
--
-- NOTE: Replace 'YOUR_PROJECT_REF' with your actual Supabase project reference
-- Example: https://vrrjoswzmlhkmmcfhicw.supabase.co
--
-- To schedule the data archival cron job, run:
/*
SELECT cron.schedule(
  'hpp-data-archival',             -- Job name
  '0 2 1 * *',                     -- Cron expression (monthly on 1st at 02:00 UTC)
  $
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-data-archival',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $
);
*/

-- ============================================
-- 5. Cron Job Management Queries
-- ============================================
-- Requirements: 3.5, 6.5

-- ---------------------------------------------
-- 5.1 Check All HPP Cron Jobs Status
-- ---------------------------------------------
-- View all scheduled HPP-related cron jobs and their configuration
-- Usage: Run this query to see if all HPP jobs are scheduled
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
WHERE jobname LIKE 'hpp-%'
ORDER BY jobname;
*/

-- ---------------------------------------------
-- 5.2 Check Alert Detection Job Status
-- ---------------------------------------------
-- View the alert detection cron job configuration
/*
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'hpp-alert-detection';
*/

-- ---------------------------------------------
-- 5.3 Check Data Archival Job Status
-- ---------------------------------------------
-- View the data archival cron job configuration
/*
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'hpp-data-archival';
*/

-- ---------------------------------------------
-- 5.4 View Alert Detection Execution History
-- ---------------------------------------------
-- View recent execution history for the alert detection job
-- Usage: Run this query to see execution logs and status
/*
SELECT 
  j.jobname,
  jd.runid,
  jd.job_pid,
  jd.database,
  jd.username,
  jd.status,
  jd.return_message,
  jd.start_time,
  jd.end_time,
  EXTRACT(EPOCH FROM (jd.end_time - jd.start_time)) as duration_seconds
FROM cron.job_run_details jd
JOIN cron.job j ON j.jobid = jd.jobid
WHERE j.jobname = 'hpp-alert-detection'
ORDER BY jd.start_time DESC
LIMIT 50;
*/

-- ---------------------------------------------
-- 5.5 View Data Archival Execution History
-- ---------------------------------------------
-- View recent execution history for the data archival job
-- Usage: Run this query to see execution logs and status
/*
SELECT 
  j.jobname,
  jd.runid,
  jd.job_pid,
  jd.database,
  jd.username,
  jd.status,
  jd.return_message,
  jd.start_time,
  jd.end_time,
  EXTRACT(EPOCH FROM (jd.end_time - jd.start_time)) as duration_seconds
FROM cron.job_run_details jd
JOIN cron.job j ON j.jobid = jd.jobid
WHERE j.jobname = 'hpp-data-archival'
ORDER BY jd.start_time DESC
LIMIT 50;
*/

-- ---------------------------------------------
-- 5.6 View All HPP Jobs Execution History
-- ---------------------------------------------
-- View recent execution history for all HPP cron jobs
/*
SELECT 
  j.jobname,
  jd.runid,
  jd.status,
  jd.return_message,
  jd.start_time,
  jd.end_time,
  EXTRACT(EPOCH FROM (jd.end_time - jd.start_time)) as duration_seconds
FROM cron.job_run_details jd
JOIN cron.job j ON j.jobid = jd.jobid
WHERE j.jobname LIKE 'hpp-%'
ORDER BY jd.start_time DESC
LIMIT 100;
*/

-- ---------------------------------------------
-- 5.7 Unschedule Alert Detection Job (for Rollback)
-- ---------------------------------------------
-- Remove the alert detection cron job
-- Usage: Run this if you need to disable the alert detection job
/*
SELECT cron.unschedule('hpp-alert-detection');
*/

-- ---------------------------------------------
-- 5.8 Unschedule Data Archival Job (for Rollback)
-- ---------------------------------------------
-- Remove the data archival cron job
-- Usage: Run this if you need to disable the data archival job
/*
SELECT cron.unschedule('hpp-data-archival');
*/

-- ---------------------------------------------
-- 5.9 Unschedule All HPP Jobs (for Complete Rollback)
-- ---------------------------------------------
-- Remove all HPP-related cron jobs
-- Usage: Run this if you need to disable all HPP automation
/*
DO $
DECLARE
  job_record RECORD;
BEGIN
  FOR job_record IN 
    SELECT jobname FROM cron.job WHERE jobname LIKE 'hpp-%'
  LOOP
    PERFORM cron.unschedule(job_record.jobname);
    RAISE NOTICE 'Unscheduled job: %', job_record.jobname;
  END LOOP;
END;
$;
*/

-- ---------------------------------------------
-- 5.10 Reschedule Alert Detection Job (if needed)
-- ---------------------------------------------
-- If you need to change the alert detection schedule
-- Example: Change to run every 4 hours instead of 6
/*
-- First unschedule
SELECT cron.unschedule('hpp-alert-detection');

-- Then reschedule with new timing
SELECT cron.schedule(
  'hpp-alert-detection',
  '0 */4 * * *',  -- Every 4 hours
  $
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-alert-detection',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $
);
*/

-- ---------------------------------------------
-- 5.11 Reschedule Data Archival Job (if needed)
-- ---------------------------------------------
-- If you need to change the data archival schedule
-- Example: Change to run on 15th of each month instead of 1st
/*
-- First unschedule
SELECT cron.unschedule('hpp-data-archival');

-- Then reschedule with new timing
SELECT cron.schedule(
  'hpp-data-archival',
  '0 2 15 * *',  -- Monthly on 15th at 02:00 UTC
  $
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/hpp-data-archival',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $
);
*/

-- ============================================
-- 6. Verify Archive Table and RLS Policies
-- ============================================
-- Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
--
-- The hpp_snapshots_archive table and RLS policies were created in migration
-- 20250122000000_hpp_historical_tracking.sql
--
-- To verify the archive table exists:
/*
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'hpp_snapshots_archive';
*/

-- To verify RLS is enabled on archive table:
/*
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'hpp_snapshots_archive';
*/

-- To verify RLS policies on archive table:
/*
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'hpp_snapshots_archive';
*/

-- To verify indexes on archive table:
/*
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'hpp_snapshots_archive'
ORDER BY indexname;
*/

-- ============================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================
-- 
-- After running this migration, complete the following steps:
--
-- 1. Verify the service role key is set (should be done from previous migration):
--    SELECT current_setting('app.service_role_key', true);
--
--    If not set, run:
--    ALTER DATABASE postgres SET app.service_role_key = 'your-actual-service-role-key';
--
-- 2. Deploy the Edge Functions (if not already done):
--    supabase functions deploy hpp-alert-detection
--    supabase functions deploy hpp-data-archival
--
-- 3. Set Edge Function secrets:
--    supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
--    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
--
-- 4. Schedule the alert detection cron job:
--    Run the SELECT cron.schedule() command from section 3 above
--    (uncomment and replace YOUR_PROJECT_REF with: vrrjoswzmlhkmmcfhicw)
--
-- 5. Schedule the data archival cron job:
--    Run the SELECT cron.schedule() command from section 4 above
--    (uncomment and replace YOUR_PROJECT_REF with: vrrjoswzmlhkmmcfhicw)
--
-- 6. Verify both jobs are scheduled:
--    SELECT * FROM cron.job WHERE jobname LIKE 'hpp-%';
--
-- 7. Test manual execution (optional):
--    # Test alert detection
--    curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-alert-detection \
--      -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--      -H "Content-Type: application/json"
--
--    # Test data archival
--    curl -X POST https://vrrjoswzmlhkmmcfhicw.supabase.co/functions/v1/hpp-data-archival \
--      -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
--      -H "Content-Type: application/json"
--
-- 8. Monitor first scheduled executions:
--    Check the cron.job_run_details table after the scheduled times
--
-- 9. Disable Vercel Cron (after confirming Edge Functions work):
--    Remove hpp-alerts and hpp-archive from vercel.json
--    Deploy Next.js app with updated configuration
--
-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
--
-- To rollback this migration:
--
-- 1. Unschedule both cron jobs:
--    SELECT cron.unschedule('hpp-alert-detection');
--    SELECT cron.unschedule('hpp-data-archival');
--
-- 2. Re-enable Vercel Cron (if needed):
--    Add hpp-alerts and hpp-archive back to vercel.json
--    Deploy Next.js app
--
-- 3. Verify old system is working:
--    Check Vercel Cron logs
--    Verify alerts and archival are functioning
--
-- Note: The archive table and RLS policies will remain as they were created
-- in the previous migration and are still needed for the system to function.
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
-- 3. Both Edge Functions validate the authorization header to ensure
--    only legitimate cron jobs can trigger their execution
--
-- 4. Consider rotating the service role key periodically and updating
--    the database setting and Edge Function secrets accordingly
--
-- 5. Monitor the cron.job_run_details table for any suspicious activity
--    or unexpected execution patterns
--
-- 6. The alert detection job runs every 6 hours, generating alerts for
--    cost anomalies. Monitor alert volume to detect potential issues.
--
-- 7. The data archival job runs monthly and moves old data to the archive
--    table. Verify data integrity after each archival run.
--
-- ============================================
-- MONITORING RECOMMENDATIONS
-- ============================================
--
-- 1. Set up alerts for cron job failures:
--    Monitor cron.job_run_details for status != 'succeeded'
--
-- 2. Track execution duration:
--    Alert if execution time exceeds 5 minutes (potential timeout)
--
-- 3. Monitor alert generation rate:
--    Track number of alerts created per execution
--    Alert if no alerts generated for extended period (potential issue)
--
-- 4. Monitor archival metrics:
--    Track number of snapshots archived per month
--    Verify archive table growth is consistent
--
-- 5. Check Edge Function logs:
--    Review Supabase Edge Function logs for errors
--    Monitor for authentication failures
--
-- 6. Database performance:
--    Monitor query performance on hpp_snapshots and hpp_snapshots_archive
--    Ensure indexes are being used effectively
--
-- ============================================
-- SCHEDULE REFERENCE
-- ============================================
--
-- Cron Expression Format: minute hour day month weekday
--
-- Alert Detection: 0 */6 * * *
--   - Runs at: 00:00, 06:00, 12:00, 18:00 UTC daily
--   - Frequency: Every 6 hours
--   - Purpose: Detect HPP anomalies and generate alerts
--
-- Data Archival: 0 2 1 * *
--   - Runs at: 02:00 UTC on the 1st of each month
--   - Frequency: Monthly
--   - Purpose: Archive snapshots older than 1 year
--
-- Daily Snapshots: 0 0 * * * (from previous migration)
--   - Runs at: 00:00 UTC daily
--   - Frequency: Daily
--   - Purpose: Create HPP snapshots for all recipes
--
-- ============================================


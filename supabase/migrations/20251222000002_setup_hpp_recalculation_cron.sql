-- ============================================================================
-- SUPABASE PG_CRON: HPP RECALCULATION BACKGROUND JOB
-- ============================================================================
-- Setup automated background processing for HPP recalculation queue
-- Runs every 5 minutes to process pending recalculations
-- ============================================================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create function to process all users' HPP recalculation queues
CREATE OR REPLACE FUNCTION public.process_all_hpp_recalculation_queues()
RETURNS TABLE (
  total_users INTEGER,
  total_processed INTEGER,
  total_failed INTEGER,
  total_pending INTEGER,
  execution_time_ms INTEGER
) AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_user_record RECORD;
  v_total_users INTEGER := 0;
  v_total_processed INTEGER := 0;
  v_total_failed INTEGER := 0;
  v_total_pending INTEGER := 0;
  v_result RECORD;
BEGIN
  v_start_time := clock_timestamp();
  
  -- Get all users with pending recalculations
  FOR v_user_record IN 
    SELECT DISTINCT user_id 
    FROM public.hpp_recalculation_queue 
    WHERE status = 'pending'
    LIMIT 100  -- Process max 100 users per run
  LOOP
    v_total_users := v_total_users + 1;
    
    -- Process this user's queue (10 items per user)
    SELECT * INTO v_result
    FROM public.process_hpp_recalculation_queue(v_user_record.user_id, 10);
    
    v_total_processed := v_total_processed + COALESCE(v_result.processed_count, 0);
    v_total_failed := v_total_failed + COALESCE(v_result.failed_count, 0);
    v_total_pending := v_total_pending + COALESCE(v_result.pending_count, 0);
  END LOOP;
  
  -- Log execution
  RAISE NOTICE 'HPP Recalculation Cron: Processed % users, % items processed, % failed, % pending in % ms',
    v_total_users, v_total_processed, v_total_failed, v_total_pending,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time);
  
  -- Return results
  RETURN QUERY SELECT 
    v_total_users,
    v_total_processed,
    v_total_failed,
    v_total_pending,
    CAST(EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start_time) AS INTEGER);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.process_all_hpp_recalculation_queues() TO postgres;

-- Schedule the cron job to run every 5 minutes
-- Note: Cron jobs in Supabase run in UTC timezone
SELECT cron.schedule(
  'hpp-recalculation-every-5min',           -- Job name
  '*/5 * * * *',                             -- Every 5 minutes (cron expression)
  $$SELECT public.process_all_hpp_recalculation_queues();$$  -- SQL to execute
);

-- Create monitoring view for cron job status
CREATE OR REPLACE VIEW public.hpp_cron_job_status AS
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
WHERE jobname = 'hpp-recalculation-every-5min';

-- Create view for cron job execution history
CREATE OR REPLACE VIEW public.hpp_cron_job_history AS
SELECT 
  runid,
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time,
  end_time - start_time AS duration
FROM cron.job_run_details
WHERE jobid = (
  SELECT jobid 
  FROM cron.job 
  WHERE jobname = 'hpp-recalculation-every-5min'
)
ORDER BY start_time DESC
LIMIT 100;

-- Grant select on monitoring views
GRANT SELECT ON public.hpp_cron_job_status TO authenticated;
GRANT SELECT ON public.hpp_cron_job_history TO authenticated;

-- Create function to manually trigger the cron job (for testing)
CREATE OR REPLACE FUNCTION public.trigger_hpp_recalculation_cron()
RETURNS TABLE (
  total_users INTEGER,
  total_processed INTEGER,
  total_failed INTEGER,
  total_pending INTEGER,
  execution_time_ms INTEGER
) AS $$
BEGIN
  RAISE NOTICE 'Manually triggering HPP recalculation cron job';
  RETURN QUERY SELECT * FROM public.process_all_hpp_recalculation_queues();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission for manual trigger
GRANT EXECUTE ON FUNCTION public.trigger_hpp_recalculation_cron() TO authenticated;

-- Create function to get cron job statistics
CREATE OR REPLACE FUNCTION public.get_hpp_cron_statistics()
RETURNS TABLE (
  total_runs BIGINT,
  successful_runs BIGINT,
  failed_runs BIGINT,
  avg_duration_seconds NUMERIC,
  last_run_time TIMESTAMPTZ,
  last_run_status TEXT,
  next_scheduled_run TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH job_stats AS (
    SELECT 
      COUNT(*) AS total_runs,
      COUNT(*) FILTER (WHERE status = 'succeeded') AS successful_runs,
      COUNT(*) FILTER (WHERE status = 'failed') AS failed_runs,
      AVG(EXTRACT(EPOCH FROM (end_time - start_time))) AS avg_duration_seconds,
      MAX(start_time) AS last_run_time,
      (SELECT status FROM cron.job_run_details 
       WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'hpp-recalculation-every-5min')
       ORDER BY start_time DESC LIMIT 1) AS last_run_status
    FROM cron.job_run_details
    WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'hpp-recalculation-every-5min')
  ),
  next_run AS (
    SELECT 
      -- Calculate next run based on last run + 5 minutes
      COALESCE(
        (SELECT MAX(start_time) + INTERVAL '5 minutes' 
         FROM cron.job_run_details 
         WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'hpp-recalculation-every-5min')),
        NOW() + INTERVAL '5 minutes'
      ) AS next_scheduled_run
  )
  SELECT 
    js.total_runs,
    js.successful_runs,
    js.failed_runs,
    ROUND(js.avg_duration_seconds::numeric, 2) AS avg_duration_seconds,
    js.last_run_time,
    js.last_run_status,
    nr.next_scheduled_run
  FROM job_stats js
  CROSS JOIN next_run nr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_hpp_cron_statistics() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.process_all_hpp_recalculation_queues() IS 'Background job function that processes HPP recalculation queue for all users';
COMMENT ON FUNCTION public.trigger_hpp_recalculation_cron() IS 'Manually trigger HPP recalculation cron job for testing';
COMMENT ON FUNCTION public.get_hpp_cron_statistics() IS 'Get statistics and status of HPP recalculation cron job';
COMMENT ON VIEW public.hpp_cron_job_status IS 'Current status of HPP recalculation cron job';
COMMENT ON VIEW public.hpp_cron_job_history IS 'Execution history of HPP recalculation cron job (last 100 runs)';

-- Log successful setup
DO $$
BEGIN
  RAISE NOTICE '✅ HPP Recalculation Cron Job Setup Complete';
  RAISE NOTICE '   - Job Name: hpp-recalculation-every-5min';
  RAISE NOTICE '   - Schedule: Every 5 minutes (*/5 * * * *)';
  RAISE NOTICE '   - Function: process_all_hpp_recalculation_queues()';
  RAISE NOTICE '   - Monitoring: hpp_cron_job_status view';
  RAISE NOTICE '   - History: hpp_cron_job_history view';
  RAISE NOTICE '   - Manual Trigger: trigger_hpp_recalculation_cron()';
  RAISE NOTICE '   - Statistics: get_hpp_cron_statistics()';
END $$;

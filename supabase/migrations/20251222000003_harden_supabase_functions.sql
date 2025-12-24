-- ============================================================================
-- SECURITY HARDENING: Ensure functions use deterministic search_path & views use
-- security invoker semantics (per Supabase advisor recommendations)
-- ============================================================================

-- Fix views flagged as SECURITY DEFINER by enabling security_invoker so they run
-- under the requesting user's privileges
ALTER VIEW public.hpp_cron_job_status SET (security_invoker = true);
ALTER VIEW public.hpp_cron_job_history SET (security_invoker = true);

-- Ensure helper/trigger functions always run with a deterministic search_path
ALTER FUNCTION public.trigger_hpp_recalc_on_ingredient_wac_change()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_hpp_recalc_on_operational_cost_change()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.process_hpp_recalculation_queue(uuid, integer)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.initialize_user_stock_settings()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.validate_stock_deduction(uuid, numeric, uuid)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.deduct_ingredient_stock_safe(uuid, numeric, uuid, character varying, uuid)
  SET search_path = public, pg_temp;

ALTER FUNCTION public.process_all_hpp_recalculation_queues()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.trigger_hpp_recalculation_cron()
  SET search_path = public, pg_temp;

ALTER FUNCTION public.get_hpp_cron_statistics()
  SET search_path = public, pg_temp;

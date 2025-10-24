-- Migration: Fix Security Advisor Warnings
-- Date: 2025-10-24
-- Description: Fix function search_path and move extensions to proper schema

-- ============================================================================
-- 1. Fix Function Search Path (Security)
-- ============================================================================

-- Fix update_hpp_alerts_updated_at function
ALTER FUNCTION IF EXISTS public.update_hpp_alerts_updated_at() 
SET search_path = public, pg_temp;

-- Fix get_unread_alert_count function  
ALTER FUNCTION IF EXISTS public.get_unread_alert_count() 
SET search_path = public, pg_temp;

-- ============================================================================
-- 2. Move Extensions to Extensions Schema (Security Best Practice)
-- ============================================================================

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_trgm' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION pg_trgm SET SCHEMA extensions;
  END IF;
END $$;

-- Move pg_net extension
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension 
    WHERE extname = 'pg_net' 
    AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    ALTER EXTENSION pg_net SET SCHEMA extensions;
  END IF;
END $$;

-- ============================================================================
-- 3. Grant Necessary Permissions
-- ============================================================================

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- ============================================================================
-- Verification Queries (for manual check)
-- ============================================================================

-- Check function search_path
-- SELECT 
--   proname as function_name,
--   prosrc as function_body,
--   proconfig as search_path_config
-- FROM pg_proc 
-- WHERE proname IN ('update_hpp_alerts_updated_at', 'get_unread_alert_count');

-- Check extension schemas
-- SELECT 
--   extname as extension_name,
--   nspname as schema_name
-- FROM pg_extension e
-- JOIN pg_namespace n ON e.extnamespace = n.oid
-- WHERE extname IN ('pg_trgm', 'pg_net');

COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions (security best practice)';

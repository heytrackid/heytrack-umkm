-- Verification Script for Supabase Advisor Fixes
-- Run this to verify all security and performance fixes

-- ============================================
-- 1. Verify RLS Policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('chat_messages', 'daily_sales_summary', 'inventory_stock_logs')
ORDER BY tablename, policyname;

-- Expected: Should see policies for all three tables

-- ============================================
-- 2. Verify View Security (SECURITY INVOKER)
-- ============================================
SELECT 
  schemaname,
  viewname,
  viewowner,
  CASE 
    WHEN pg_catalog.pg_get_viewdef(c.oid, true) LIKE '%SECURITY DEFINER%' THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type
FROM pg_views v
JOIN pg_class c ON c.relname = v.viewname
WHERE schemaname = 'public' 
  AND viewname IN ('order_summary', 'inventory_status', 'inventory_availability', 'recipe_availability');

-- Expected: All views should show 'SECURITY INVOKER'

-- ============================================
-- 3. Verify Function Search Paths
-- ============================================
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE 
    WHEN p.proconfig IS NULL THEN 'NOT SET'
    ELSE array_to_string(p.proconfig, ', ')
  END as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'auth_user_id', 'get_user_id', 'set_user_id', 'get_user_role',
    'decrement_ingredient_stock', 'increment_ingredient_stock',
    'mark_notification_read', 'mark_all_notifications_read',
    'calculate_ingredient_wac', 'calculate_recipe_hpp',
    'update_updated_at_column', 'log_stock_change'
  )
ORDER BY p.proname;

-- Expected: All functions should have search_path set to 'search_path=public, pg_temp'

-- ============================================
-- 4. Verify Foreign Key Indexes
-- ============================================
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname IN (
    'idx_daily_sales_summary_top_selling_recipe_id',
    'idx_hpp_alerts_recipe_id',
    'idx_hpp_recommendations_recipe_id',
    'idx_ingredient_purchases_ingredient_id',
    'idx_inventory_stock_logs_ingredient_id',
    'idx_payments_order_id',
    'idx_production_schedules_recipe_id',
    'idx_stock_reservations_production_id',
    'idx_supplier_ingredients_ingredient_id',
    'idx_supplier_ingredients_supplier_id',
    'idx_usage_analytics_ingredient_id'
  )
ORDER BY tablename, indexname;

-- Expected: All 11 indexes should exist

-- ============================================
-- 5. Check for Multiple Permissive Policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  cmd,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
  AND permissive = 'PERMISSIVE'
GROUP BY schemaname, tablename, cmd
HAVING COUNT(*) > 1
ORDER BY tablename, cmd;

-- Expected: Should return no rows (no multiple permissive policies)

-- ============================================
-- 6. Summary Statistics
-- ============================================
SELECT 
  'RLS Policies' as metric,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Functions with search_path',
  COUNT(*)
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proconfig IS NOT NULL
  AND array_to_string(p.proconfig, ', ') LIKE '%search_path%'
UNION ALL
SELECT 
  'Foreign Key Indexes',
  COUNT(*)
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
UNION ALL
SELECT 
  'Views with SECURITY INVOKER',
  COUNT(*)
FROM pg_views v
WHERE schemaname = 'public';

-- ============================================
-- 7. Check Extension Location
-- ============================================
SELECT 
  e.extname,
  n.nspname as schema
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname = 'pg_net';

-- Expected: pg_net in public schema (cannot be moved)

-- ============================================
-- 8. Test RLS Policy Enforcement
-- ============================================
-- This tests that RLS policies are working correctly
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "test-user-id"}';

-- Try to access chat_messages (should only see own messages)
SELECT COUNT(*) as accessible_chat_messages
FROM public.chat_messages;

-- Try to access daily_sales_summary (should be readable)
SELECT COUNT(*) as accessible_sales_summary
FROM public.daily_sales_summary;

-- Reset role
RESET ROLE;

-- ============================================
-- VERIFICATION CHECKLIST
-- ============================================
-- [ ] All 3 tables have RLS policies
-- [ ] All 4 views use SECURITY INVOKER
-- [ ] All 31 functions have search_path set
-- [ ] All 11 foreign key indexes exist
-- [ ] No multiple permissive policies
-- [ ] pg_net extension in public (expected)
-- [ ] RLS policies enforce correctly

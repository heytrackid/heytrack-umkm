-- ============================================================================
-- HeyTrack Database Schema - Part 0: Clean Database
-- ============================================================================
-- Run this FIRST if you want to start fresh
-- WARNING: This will delete ALL data!

-- Drop all existing tables
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS chat_context_cache CASCADE;
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS conversation_sessions CASCADE;
DROP TABLE IF EXISTS whatsapp_templates CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS hpp_recommendations CASCADE;
DROP TABLE IF EXISTS hpp_alerts CASCADE;
DROP TABLE IF EXISTS hpp_history CASCADE;
DROP TABLE IF EXISTS hpp_calculations CASCADE;
DROP TABLE IF EXISTS operational_costs CASCADE;
DROP TABLE IF EXISTS financial_records CASCADE;
DROP TABLE IF EXISTS production_schedules CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS productions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS usage_analytics CASCADE;
DROP TABLE IF EXISTS supplier_ingredients CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS inventory_stock_logs CASCADE;
DROP TABLE IF EXISTS inventory_reorder_rules CASCADE;
DROP TABLE IF EXISTS inventory_alerts CASCADE;
DROP TABLE IF EXISTS stock_reservations CASCADE;
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS ingredient_purchases CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS daily_sales_summary CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS performance_logs CASCADE;

-- Drop views
DROP VIEW IF EXISTS recipe_availability CASCADE;
DROP VIEW IF EXISTS order_summary CASCADE;
DROP VIEW IF EXISTS inventory_availability CASCADE;
DROP VIEW IF EXISTS inventory_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.auth_user_id() CASCADE;
DROP FUNCTION IF EXISTS calculate_ingredient_wac(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_recipe_hpp(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_ingredient_stock(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS decrement_ingredient_stock(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS get_unread_alert_count(TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_default_whatsapp_templates(TEXT) CASCADE;
DROP FUNCTION IF EXISTS clean_old_logs() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_context_cache() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(TEXT) CASCADE;
DROP FUNCTION IF EXISTS user_has_permission(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS user_has_business_unit_access(business_unit, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_stock_change() CASCADE;
DROP FUNCTION IF EXISTS update_ingredient_wac_on_purchase() CASCADE;
DROP FUNCTION IF EXISTS update_customer_stats_on_order() CASCADE;
DROP FUNCTION IF EXISTS update_recipe_stats_on_production() CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS business_unit CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS production_status CASCADE;
DROP TYPE IF EXISTS record_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Database cleaned successfully!';
  RAISE NOTICE 'You can now run the migration files.';
END $$;

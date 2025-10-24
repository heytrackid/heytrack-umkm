-- Migration: Fix RLS Performance and Security Issues
-- Date: 2025-01-24
-- 
-- This migration addresses critical performance and security issues:
-- 1. RLS performance: Using subqueries for auth functions (prevents re-evaluation per row)
-- 2. Function security: Adding search_path to SECURITY DEFINER functions
-- 3. Duplicate policies: Removing duplicate RLS policies

-- ============================================================================
-- PART 1: Fix Function Search Paths (Security)
-- ============================================================================

-- Fix update_hpp_alerts_updated_at function
DROP FUNCTION IF EXISTS update_hpp_alerts_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_hpp_alerts_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_hpp_alerts_updated_at_trigger ON hpp_alerts;
CREATE TRIGGER update_hpp_alerts_updated_at_trigger
  BEFORE UPDATE ON hpp_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_hpp_alerts_updated_at();

-- Fix get_unread_alert_count function
DROP FUNCTION IF EXISTS get_unread_alert_count(uuid) CASCADE;
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)::integer INTO v_count
  FROM hpp_alerts
  WHERE user_id = p_user_id
    AND is_read = false;
  
  RETURN COALESCE(v_count, 0);
END;
$$;

-- ============================================================================
-- PART 2: Fix RLS Policies Performance
-- ============================================================================

-- Tables with user_id column
-- inventory_reorder_rules
DROP POLICY IF EXISTS inventory_reorder_rules_select_policy ON inventory_reorder_rules;
CREATE POLICY inventory_reorder_rules_select_policy ON inventory_reorder_rules
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_reorder_rules_insert_policy ON inventory_reorder_rules;
CREATE POLICY inventory_reorder_rules_insert_policy ON inventory_reorder_rules
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_reorder_rules_update_policy ON inventory_reorder_rules;
CREATE POLICY inventory_reorder_rules_update_policy ON inventory_reorder_rules
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_reorder_rules_delete_policy ON inventory_reorder_rules;
CREATE POLICY inventory_reorder_rules_delete_policy ON inventory_reorder_rules
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- operational_costs
DROP POLICY IF EXISTS operational_costs_select_policy ON operational_costs;
CREATE POLICY operational_costs_select_policy ON operational_costs
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS operational_costs_insert_policy ON operational_costs;
CREATE POLICY operational_costs_insert_policy ON operational_costs
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS operational_costs_update_policy ON operational_costs;
CREATE POLICY operational_costs_update_policy ON operational_costs
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS operational_costs_delete_policy ON operational_costs;
CREATE POLICY operational_costs_delete_policy ON operational_costs
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- production_schedules
DROP POLICY IF EXISTS production_schedules_select_policy ON production_schedules;
CREATE POLICY production_schedules_select_policy ON production_schedules
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS production_schedules_insert_policy ON production_schedules;
CREATE POLICY production_schedules_insert_policy ON production_schedules
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS production_schedules_update_policy ON production_schedules;
CREATE POLICY production_schedules_update_policy ON production_schedules
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS production_schedules_delete_policy ON production_schedules;
CREATE POLICY production_schedules_delete_policy ON production_schedules
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- supplier_ingredients
DROP POLICY IF EXISTS supplier_ingredients_select_policy ON supplier_ingredients;
CREATE POLICY supplier_ingredients_select_policy ON supplier_ingredients
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS supplier_ingredients_insert_policy ON supplier_ingredients;
CREATE POLICY supplier_ingredients_insert_policy ON supplier_ingredients
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS supplier_ingredients_update_policy ON supplier_ingredients;
CREATE POLICY supplier_ingredients_update_policy ON supplier_ingredients
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS supplier_ingredients_delete_policy ON supplier_ingredients;
CREATE POLICY supplier_ingredients_delete_policy ON supplier_ingredients
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- suppliers
DROP POLICY IF EXISTS suppliers_select_policy ON suppliers;
CREATE POLICY suppliers_select_policy ON suppliers
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS suppliers_insert_policy ON suppliers;
CREATE POLICY suppliers_insert_policy ON suppliers
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS suppliers_update_policy ON suppliers;
CREATE POLICY suppliers_update_policy ON suppliers
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS suppliers_delete_policy ON suppliers;
CREATE POLICY suppliers_delete_policy ON suppliers
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- usage_analytics
DROP POLICY IF EXISTS usage_analytics_select_policy ON usage_analytics;
CREATE POLICY usage_analytics_select_policy ON usage_analytics
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS usage_analytics_insert_policy ON usage_analytics;
CREATE POLICY usage_analytics_insert_policy ON usage_analytics
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS usage_analytics_update_policy ON usage_analytics;
CREATE POLICY usage_analytics_update_policy ON usage_analytics
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS usage_analytics_delete_policy ON usage_analytics;
CREATE POLICY usage_analytics_delete_policy ON usage_analytics
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- whatsapp_templates
DROP POLICY IF EXISTS whatsapp_templates_select_policy ON whatsapp_templates;
CREATE POLICY whatsapp_templates_select_policy ON whatsapp_templates
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS whatsapp_templates_insert_policy ON whatsapp_templates;
CREATE POLICY whatsapp_templates_insert_policy ON whatsapp_templates
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS whatsapp_templates_update_policy ON whatsapp_templates;
CREATE POLICY whatsapp_templates_update_policy ON whatsapp_templates
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS whatsapp_templates_delete_policy ON whatsapp_templates;
CREATE POLICY whatsapp_templates_delete_policy ON whatsapp_templates
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- order_items
DROP POLICY IF EXISTS order_items_select_policy ON order_items;
CREATE POLICY order_items_select_policy ON order_items
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS order_items_insert_policy ON order_items;
CREATE POLICY order_items_insert_policy ON order_items
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS order_items_delete_policy ON order_items;
CREATE POLICY order_items_delete_policy ON order_items
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- recipe_ingredients
DROP POLICY IF EXISTS recipe_ingredients_select_policy ON recipe_ingredients;
CREATE POLICY recipe_ingredients_select_policy ON recipe_ingredients
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS recipe_ingredients_insert_policy ON recipe_ingredients;
CREATE POLICY recipe_ingredients_insert_policy ON recipe_ingredients
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS recipe_ingredients_update_policy ON recipe_ingredients;
CREATE POLICY recipe_ingredients_update_policy ON recipe_ingredients
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS recipe_ingredients_delete_policy ON recipe_ingredients;
CREATE POLICY recipe_ingredients_delete_policy ON recipe_ingredients
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- customers
DROP POLICY IF EXISTS customers_select_policy ON customers;
CREATE POLICY customers_select_policy ON customers
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS customers_insert_policy ON customers;
CREATE POLICY customers_insert_policy ON customers
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS customers_update_policy ON customers;
CREATE POLICY customers_update_policy ON customers
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS customers_delete_policy ON customers;
CREATE POLICY customers_delete_policy ON customers
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- hpp_snapshots
DROP POLICY IF EXISTS "Users can view their own hpp snapshots" ON hpp_snapshots;
CREATE POLICY "Users can view their own hpp snapshots" ON hpp_snapshots
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own hpp snapshots" ON hpp_snapshots;
CREATE POLICY "Users can insert their own hpp snapshots" ON hpp_snapshots
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own hpp snapshots" ON hpp_snapshots;
CREATE POLICY "Users can update their own hpp snapshots" ON hpp_snapshots
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own hpp snapshots" ON hpp_snapshots;
CREATE POLICY "Users can delete their own hpp snapshots" ON hpp_snapshots
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ingredients
DROP POLICY IF EXISTS ingredients_select_policy ON ingredients;
CREATE POLICY ingredients_select_policy ON ingredients
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ingredients_insert_policy ON ingredients;
CREATE POLICY ingredients_insert_policy ON ingredients
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ingredients_update_policy ON ingredients;
CREATE POLICY ingredients_update_policy ON ingredients
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ingredients_delete_policy ON ingredients;
CREATE POLICY ingredients_delete_policy ON ingredients
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- hpp_snapshots_archive
DROP POLICY IF EXISTS "Users can view own hpp_snapshots_archive" ON hpp_snapshots_archive;
CREATE POLICY "Users can view own hpp_snapshots_archive" ON hpp_snapshots_archive
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- recipes
DROP POLICY IF EXISTS recipes_select_policy ON recipes;
CREATE POLICY recipes_select_policy ON recipes
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS recipes_insert_policy ON recipes;
CREATE POLICY recipes_insert_policy ON recipes
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS recipes_update_policy ON recipes;
CREATE POLICY recipes_update_policy ON recipes
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS recipes_delete_policy ON recipes;
CREATE POLICY recipes_delete_policy ON recipes
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- hpp_alerts
DROP POLICY IF EXISTS "Users can view own hpp_alerts" ON hpp_alerts;
CREATE POLICY "Users can view own hpp_alerts" ON hpp_alerts
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own hpp_alerts" ON hpp_alerts;
CREATE POLICY "Users can insert own hpp_alerts" ON hpp_alerts
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own hpp_alerts" ON hpp_alerts;
CREATE POLICY "Users can update own hpp_alerts" ON hpp_alerts
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete own hpp_alerts" ON hpp_alerts;
CREATE POLICY "Users can delete own hpp_alerts" ON hpp_alerts
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- orders
DROP POLICY IF EXISTS orders_select_policy ON orders;
CREATE POLICY orders_select_policy ON orders
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS orders_insert_policy ON orders;
CREATE POLICY orders_insert_policy ON orders
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS orders_update_policy ON orders;
CREATE POLICY orders_update_policy ON orders
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS orders_delete_policy ON orders;
CREATE POLICY orders_delete_policy ON orders
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- productions
DROP POLICY IF EXISTS productions_select_policy ON productions;
CREATE POLICY productions_select_policy ON productions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS productions_insert_policy ON productions;
CREATE POLICY productions_insert_policy ON productions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS productions_update_policy ON productions;
CREATE POLICY productions_update_policy ON productions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS productions_delete_policy ON productions;
CREATE POLICY productions_delete_policy ON productions
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- payments
DROP POLICY IF EXISTS payments_select_policy ON payments;
CREATE POLICY payments_select_policy ON payments
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS payments_insert_policy ON payments;
CREATE POLICY payments_insert_policy ON payments
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- expenses
DROP POLICY IF EXISTS expenses_select_policy ON expenses;
CREATE POLICY expenses_select_policy ON expenses
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS expenses_insert_policy ON expenses;
CREATE POLICY expenses_insert_policy ON expenses
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS expenses_update_policy ON expenses;
CREATE POLICY expenses_update_policy ON expenses
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS expenses_delete_policy ON expenses;
CREATE POLICY expenses_delete_policy ON expenses
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- stock_transactions
DROP POLICY IF EXISTS stock_transactions_select_policy ON stock_transactions;
CREATE POLICY stock_transactions_select_policy ON stock_transactions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS stock_transactions_insert_policy ON stock_transactions;
CREATE POLICY stock_transactions_insert_policy ON stock_transactions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- financial_records
DROP POLICY IF EXISTS financial_records_select_policy ON financial_records;
CREATE POLICY financial_records_select_policy ON financial_records
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS financial_records_insert_policy ON financial_records;
CREATE POLICY financial_records_insert_policy ON financial_records
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- ingredient_purchases
DROP POLICY IF EXISTS ingredient_purchases_select_policy ON ingredient_purchases;
CREATE POLICY ingredient_purchases_select_policy ON ingredient_purchases
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ingredient_purchases_insert_policy ON ingredient_purchases;
CREATE POLICY ingredient_purchases_insert_policy ON ingredient_purchases
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ingredient_purchases_update_policy ON ingredient_purchases;
CREATE POLICY ingredient_purchases_update_policy ON ingredient_purchases
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS ingredient_purchases_delete_policy ON ingredient_purchases;
CREATE POLICY ingredient_purchases_delete_policy ON ingredient_purchases
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- inventory_alerts
DROP POLICY IF EXISTS inventory_alerts_select_policy ON inventory_alerts;
CREATE POLICY inventory_alerts_select_policy ON inventory_alerts
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_alerts_insert_policy ON inventory_alerts;
CREATE POLICY inventory_alerts_insert_policy ON inventory_alerts
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_alerts_update_policy ON inventory_alerts;
CREATE POLICY inventory_alerts_update_policy ON inventory_alerts
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_alerts_delete_policy ON inventory_alerts;
CREATE POLICY inventory_alerts_delete_policy ON inventory_alerts
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- ============================================================================
-- PART 3: Fix Tables Without user_id (use auth check only)
-- ============================================================================

-- daily_sales_summary
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON daily_sales_summary;
CREATE POLICY "Allow all operations for authenticated users" ON daily_sales_summary
  FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- notifications
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON notifications;
CREATE POLICY "Allow all operations for authenticated users" ON notifications
  FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- user_profiles (uses id instead of user_id)
DROP POLICY IF EXISTS users_select_policy ON user_profiles;
CREATE POLICY users_select_policy ON user_profiles
  FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS users_update_policy ON user_profiles;
CREATE POLICY users_update_policy ON user_profiles
  FOR UPDATE USING (id = (SELECT auth.uid()));

-- ============================================================================
-- PART 4: Fix Duplicate Policies
-- ============================================================================

-- inventory_stock_logs (remove duplicates)
DROP POLICY IF EXISTS inventory_stock_logs_select_policy ON inventory_stock_logs;
DROP POLICY IF EXISTS inventory_stock_logs_secure_select ON inventory_stock_logs;
CREATE POLICY inventory_stock_logs_select_policy ON inventory_stock_logs
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS inventory_stock_logs_insert_policy ON inventory_stock_logs;
DROP POLICY IF EXISTS inventory_stock_logs_secure_insert ON inventory_stock_logs;
CREATE POLICY inventory_stock_logs_insert_policy ON inventory_stock_logs
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- sync_events (remove duplicates)
DROP POLICY IF EXISTS sync_events_access_policy ON sync_events;
DROP POLICY IF EXISTS sync_events_secure_access ON sync_events;
CREATE POLICY sync_events_access_policy ON sync_events
  FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- system_metrics (remove duplicates)
DROP POLICY IF EXISTS system_metrics_access_policy ON system_metrics;
DROP POLICY IF EXISTS system_metrics_secure_access ON system_metrics;
CREATE POLICY system_metrics_access_policy ON system_metrics
  FOR ALL USING ((SELECT auth.uid()) IS NOT NULL);

-- app_settings (remove duplicates)
DROP POLICY IF EXISTS "Allow public read access to app_settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public insert access to app_settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public update access to app_settings" ON app_settings;
DROP POLICY IF EXISTS "Allow public delete access to app_settings" ON app_settings;

DROP POLICY IF EXISTS authenticated_select_app_settings ON app_settings;
CREATE POLICY authenticated_select_app_settings ON app_settings
  FOR SELECT USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS authenticated_insert_app_settings ON app_settings;
CREATE POLICY authenticated_insert_app_settings ON app_settings
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS authenticated_update_app_settings ON app_settings;
CREATE POLICY authenticated_update_app_settings ON app_settings
  FOR UPDATE USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS authenticated_delete_app_settings ON app_settings;
CREATE POLICY authenticated_delete_app_settings ON app_settings
  FOR DELETE USING ((SELECT auth.uid()) IS NOT NULL);

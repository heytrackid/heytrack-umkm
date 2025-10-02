-- Simplified Role System - Admin and User Only
-- This migration simplifies the role system to only 'admin' and 'user'

-- First, update existing user_role enum to only include admin and user
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- Update user_profiles table to use new enum
ALTER TABLE user_profiles ALTER COLUMN role TYPE user_role USING 
  CASE 
    WHEN role::text IN ('super_admin', 'admin') THEN 'admin'::user_role
    ELSE 'user'::user_role
  END;

-- Drop old enum type
DROP TYPE user_role_old;

-- Simplify business_unit enum to remove specific units (keep 'all' for flexibility)
ALTER TYPE business_unit RENAME TO business_unit_old;
CREATE TYPE business_unit AS ENUM ('all');

-- Update user_profiles to use simplified business unit
ALTER TABLE user_profiles ALTER COLUMN business_unit TYPE business_unit USING 'all'::business_unit;

-- Drop old business unit enum
DROP TYPE business_unit_old;

-- Drop all existing RLS policies that reference the old complex role system
DROP POLICY IF EXISTS "users_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "users_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "users_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "users_delete_policy" ON user_profiles;

DROP POLICY IF EXISTS "customers_select_policy" ON customers;
DROP POLICY IF EXISTS "customers_insert_policy" ON customers;
DROP POLICY IF EXISTS "customers_update_policy" ON customers;
DROP POLICY IF EXISTS "customers_delete_policy" ON customers;

DROP POLICY IF EXISTS "ingredients_select_policy" ON ingredients;
DROP POLICY IF EXISTS "ingredients_insert_policy" ON ingredients;
DROP POLICY IF EXISTS "ingredients_update_policy" ON ingredients;
DROP POLICY IF EXISTS "ingredients_delete_policy" ON ingredients;

DROP POLICY IF EXISTS "recipes_select_policy" ON recipes;
DROP POLICY IF EXISTS "recipes_insert_policy" ON recipes;
DROP POLICY IF EXISTS "recipes_update_policy" ON recipes;
DROP POLICY IF EXISTS "recipes_delete_policy" ON recipes;

DROP POLICY IF EXISTS "recipe_ingredients_select_policy" ON recipe_ingredients;
DROP POLICY IF EXISTS "recipe_ingredients_insert_policy" ON recipe_ingredients;
DROP POLICY IF EXISTS "recipe_ingredients_update_policy" ON recipe_ingredients;
DROP POLICY IF EXISTS "recipe_ingredients_delete_policy" ON recipe_ingredients;

DROP POLICY IF EXISTS "orders_select_policy" ON orders;
DROP POLICY IF EXISTS "orders_insert_policy" ON orders;
DROP POLICY IF EXISTS "orders_update_policy" ON orders;
DROP POLICY IF EXISTS "orders_delete_policy" ON orders;

DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_update_policy" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_policy" ON order_items;

DROP POLICY IF EXISTS "payments_select_policy" ON payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;
DROP POLICY IF EXISTS "payments_update_policy" ON payments;
DROP POLICY IF EXISTS "payments_delete_policy" ON payments;

DROP POLICY IF EXISTS "productions_select_policy" ON productions;
DROP POLICY IF EXISTS "productions_insert_policy" ON productions;
DROP POLICY IF EXISTS "productions_update_policy" ON productions;
DROP POLICY IF EXISTS "productions_delete_policy" ON productions;

DROP POLICY IF EXISTS "stock_transactions_select_policy" ON stock_transactions;
DROP POLICY IF EXISTS "stock_transactions_insert_policy" ON stock_transactions;
DROP POLICY IF EXISTS "stock_transactions_update_policy" ON stock_transactions;
DROP POLICY IF EXISTS "stock_transactions_delete_policy" ON stock_transactions;

DROP POLICY IF EXISTS "financial_records_select_policy" ON financial_records;
DROP POLICY IF EXISTS "financial_records_insert_policy" ON financial_records;
DROP POLICY IF EXISTS "financial_records_update_policy" ON financial_records;
DROP POLICY IF EXISTS "financial_records_delete_policy" ON financial_records;

DROP POLICY IF EXISTS "sync_events_select_policy" ON sync_events;
DROP POLICY IF EXISTS "sync_events_insert_policy" ON sync_events;
DROP POLICY IF EXISTS "sync_events_update_policy" ON sync_events;

DROP POLICY IF EXISTS "system_metrics_select_policy" ON system_metrics;
DROP POLICY IF EXISTS "system_metrics_insert_policy" ON system_metrics;

DROP POLICY IF EXISTS "inventory_stock_logs_select_policy" ON inventory_stock_logs;
DROP POLICY IF EXISTS "inventory_stock_logs_insert_policy" ON inventory_stock_logs;

-- Update helper functions to work with simplified roles
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_profiles 
        WHERE user_id = user_uuid AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (get_user_role(user_uuid) = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old complex business unit function since we simplified it
DROP FUNCTION IF EXISTS user_has_business_unit_access(business_unit, UUID);

-- ========================================
-- SIMPLIFIED RLS POLICIES
-- ========================================

-- USER PROFILES POLICIES
-- Users can view their own profile and admins can view all
CREATE POLICY "users_select_policy" ON user_profiles FOR SELECT USING (
    user_id = auth.uid() OR is_admin()
);

-- Only admins can create users
CREATE POLICY "users_insert_policy" ON user_profiles FOR INSERT WITH CHECK (
    is_admin()
);

-- Users can update their own basic info, admins can update role/permissions
CREATE POLICY "users_update_policy" ON user_profiles FOR UPDATE USING (
    user_id = auth.uid() OR is_admin()
) WITH CHECK (
    user_id = auth.uid() OR is_admin()
);

-- Only admins can delete users
CREATE POLICY "users_delete_policy" ON user_profiles FOR DELETE USING (
    is_admin()
);

-- CUSTOMERS POLICIES
-- All authenticated users can view customers, admins can do everything
CREATE POLICY "customers_select_policy" ON customers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "customers_insert_policy" ON customers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "customers_update_policy" ON customers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "customers_delete_policy" ON customers FOR DELETE USING (is_admin());

-- INGREDIENTS POLICIES
-- All authenticated users can view ingredients, admins can manage them
CREATE POLICY "ingredients_select_policy" ON ingredients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "ingredients_insert_policy" ON ingredients FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "ingredients_update_policy" ON ingredients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "ingredients_delete_policy" ON ingredients FOR DELETE USING (is_admin());

-- RECIPES POLICIES
-- All authenticated users can view and use recipes, admins can manage them
CREATE POLICY "recipes_select_policy" ON recipes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "recipes_insert_policy" ON recipes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "recipes_update_policy" ON recipes FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "recipes_delete_policy" ON recipes FOR DELETE USING (is_admin());

-- RECIPE INGREDIENTS POLICIES
CREATE POLICY "recipe_ingredients_select_policy" ON recipe_ingredients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "recipe_ingredients_insert_policy" ON recipe_ingredients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "recipe_ingredients_update_policy" ON recipe_ingredients FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "recipe_ingredients_delete_policy" ON recipe_ingredients FOR DELETE USING (is_admin());

-- ORDERS POLICIES
-- All authenticated users can manage orders
CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "orders_update_policy" ON orders FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "orders_delete_policy" ON orders FOR DELETE USING (is_admin());

-- ORDER ITEMS POLICIES
CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "order_items_update_policy" ON order_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "order_items_delete_policy" ON order_items FOR DELETE USING (is_admin());

-- PAYMENTS POLICIES
CREATE POLICY "payments_select_policy" ON payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "payments_insert_policy" ON payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "payments_update_policy" ON payments FOR UPDATE USING (is_admin());
CREATE POLICY "payments_delete_policy" ON payments FOR DELETE USING (is_admin());

-- PRODUCTIONS POLICIES
CREATE POLICY "productions_select_policy" ON productions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "productions_insert_policy" ON productions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "productions_update_policy" ON productions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "productions_delete_policy" ON productions FOR DELETE USING (is_admin());

-- STOCK TRANSACTIONS POLICIES
CREATE POLICY "stock_transactions_select_policy" ON stock_transactions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "stock_transactions_insert_policy" ON stock_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "stock_transactions_update_policy" ON stock_transactions FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "stock_transactions_delete_policy" ON stock_transactions FOR DELETE USING (is_admin());

-- FINANCIAL RECORDS POLICIES
CREATE POLICY "financial_records_select_policy" ON financial_records FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "financial_records_insert_policy" ON financial_records FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "financial_records_update_policy" ON financial_records FOR UPDATE USING (is_admin());
CREATE POLICY "financial_records_delete_policy" ON financial_records FOR DELETE USING (is_admin());

-- SYNC EVENTS POLICIES (Admin only for system management)
CREATE POLICY "sync_events_select_policy" ON sync_events FOR SELECT USING (is_admin());
CREATE POLICY "sync_events_insert_policy" ON sync_events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "sync_events_update_policy" ON sync_events FOR UPDATE USING (is_admin());

-- SYSTEM METRICS POLICIES (Admin only)
CREATE POLICY "system_metrics_select_policy" ON system_metrics FOR SELECT USING (is_admin());
CREATE POLICY "system_metrics_insert_policy" ON system_metrics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- INVENTORY STOCK LOGS POLICIES
CREATE POLICY "inventory_stock_logs_select_policy" ON inventory_stock_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "inventory_stock_logs_insert_policy" ON inventory_stock_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Update comments
COMMENT ON TYPE user_role IS 'Simplified user roles: admin (full access) and user (standard access)';
COMMENT ON TYPE business_unit IS 'Simplified to single unit type for future flexibility';
COMMENT ON FUNCTION get_user_role IS 'Get current user role (admin or user)';
COMMENT ON FUNCTION is_admin IS 'Check if current user is admin';
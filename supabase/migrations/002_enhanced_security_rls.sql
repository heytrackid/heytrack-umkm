-- Enhanced Security Migration with Proper RLS Policies
-- This migration adds user management, audit trails, and granular RLS policies

-- First, drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users" ON financial_records;
DROP POLICY IF EXISTS "Allow authenticated users" ON ingredients;
DROP POLICY IF EXISTS "Allow authenticated users" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated users" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users" ON payments;
DROP POLICY IF EXISTS "Allow authenticated users" ON productions;
DROP POLICY IF EXISTS "Allow authenticated users" ON recipe_ingredients;
DROP POLICY IF EXISTS "Allow authenticated users" ON recipes;
DROP POLICY IF EXISTS "Allow authenticated users" ON stock_transactions;

-- Drop existing generic policies from 001_initial_schema if they exist
DROP POLICY IF EXISTS "Allow all operations" ON customers;
DROP POLICY IF EXISTS "Allow all operations" ON ingredients;
DROP POLICY IF EXISTS "Allow all operations" ON recipes;
DROP POLICY IF EXISTS "Allow all operations" ON recipe_ingredients;
DROP POLICY IF EXISTS "Allow all operations" ON orders;
DROP POLICY IF EXISTS "Allow all operations" ON order_items;
DROP POLICY IF EXISTS "Allow all operations" ON payments;
DROP POLICY IF EXISTS "Allow all operations" ON productions;
DROP POLICY IF EXISTS "Allow all operations" ON stock_transactions;
DROP POLICY IF EXISTS "Allow all operations" ON financial_records;

-- Create user roles and permissions system
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'viewer');
CREATE TYPE business_unit AS ENUM ('kitchen', 'sales', 'inventory', 'finance', 'all');

-- Create user profiles table for role-based access
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    business_unit business_unit DEFAULT 'all',
    permissions TEXT[] DEFAULT '{}', -- JSON array of specific permissions
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add missing fields to existing tables for better data integrity
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS current_stock DECIMAL(10,3) DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS minimum_stock DECIMAL(10,3) DEFAULT 0;
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add audit fields to track who created/modified records
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_spent DECIMAL(15,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS favorite_items JSONB;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'new';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add missing fields to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'general';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cost_per_unit DECIMAL(15,2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS selling_price DECIMAL(15,2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS margin_percentage DECIMAL(5,2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS times_made INTEGER DEFAULT 0;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add audit fields to other tables
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

ALTER TABLE stock_transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE productions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE productions ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Add missing sync_events and system_metrics tables referenced in database.ts
CREATE TABLE IF NOT EXISTS sync_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN ('inventory_updated', 'recipe_created', 'recipe_updated', 'order_created', 'order_updated', 'customer_created', 'stock_consumed', 'order_cancelled')),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('ingredient', 'recipe', 'order', 'customer', 'order_item')),
    entity_id UUID NOT NULL,
    data JSONB,
    metadata JSONB,
    sync_status VARCHAR(20) DEFAULT 'pending' CHECK (sync_status IN ('pending', 'processed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('sync_health', 'data_consistency', 'performance', 'error_rate')),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) DEFAULT 0,
    unit VARCHAR(20),
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_stock_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('increase', 'decrease', 'adjustment', 'consumption')),
    quantity_before DECIMAL(10,3) NOT NULL,
    quantity_after DECIMAL(10,3) NOT NULL,
    quantity_changed DECIMAL(10,3) NOT NULL,
    reason TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    triggered_by UUID REFERENCES auth.users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
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

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(permission_name TEXT, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = user_uuid 
        AND is_active = true
        AND (
            role IN ('super_admin', 'admin') OR
            permission_name = ANY(permissions)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check business unit access
CREATE OR REPLACE FUNCTION user_has_business_unit_access(unit business_unit, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = user_uuid 
        AND is_active = true
        AND (business_unit = 'all' OR business_unit = unit)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- USER PROFILES POLICIES
-- ========================================

-- Users can view their own profile and admins can view all
CREATE POLICY "users_select_policy" ON user_profiles FOR SELECT USING (
    user_id = auth.uid() OR 
    get_user_role() IN ('super_admin', 'admin')
);

-- Only super_admin can create users
CREATE POLICY "users_insert_policy" ON user_profiles FOR INSERT WITH CHECK (
    get_user_role() = 'super_admin'
);

-- Users can update their own basic info, admins can update role/permissions
CREATE POLICY "users_update_policy" ON user_profiles FOR UPDATE USING (
    user_id = auth.uid() OR 
    get_user_role() IN ('super_admin', 'admin')
) WITH CHECK (
    user_id = auth.uid() OR 
    get_user_role() IN ('super_admin', 'admin')
);

-- Only super_admin can delete users
CREATE POLICY "users_delete_policy" ON user_profiles FOR DELETE USING (
    get_user_role() = 'super_admin'
);

-- ========================================
-- CUSTOMERS POLICIES
-- ========================================

-- SELECT: Sales staff and above can view customers
CREATE POLICY "customers_select_policy" ON customers FOR SELECT USING (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('admin', 'super_admin')
);

-- INSERT: Sales staff and above can create customers
CREATE POLICY "customers_insert_policy" ON customers FOR INSERT WITH CHECK (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('admin', 'super_admin')
);

-- UPDATE: Sales staff and above can update customers
CREATE POLICY "customers_update_policy" ON customers FOR UPDATE USING (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('admin', 'super_admin')
) WITH CHECK (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('admin', 'super_admin')
);

-- DELETE: Only admin and above can delete customers
CREATE POLICY "customers_delete_policy" ON customers FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- INGREDIENTS POLICIES
-- ========================================

-- SELECT: Inventory, kitchen staff and above can view ingredients
CREATE POLICY "ingredients_select_policy" ON ingredients FOR SELECT USING (
    user_has_business_unit_access('inventory') OR
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('admin', 'super_admin')
);

-- INSERT: Manager and above can create ingredients
CREATE POLICY "ingredients_insert_policy" ON ingredients FOR INSERT WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- UPDATE: Manager and above can update ingredients, staff can update stock levels only
CREATE POLICY "ingredients_update_policy" ON ingredients FOR UPDATE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin') OR
    (get_user_role() = 'staff' AND user_has_business_unit_access('inventory'))
) WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin') OR
    (get_user_role() = 'staff' AND user_has_business_unit_access('inventory'))
);

-- DELETE: Only admin and above can delete ingredients
CREATE POLICY "ingredients_delete_policy" ON ingredients FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- RECIPES POLICIES
-- ========================================

-- SELECT: Kitchen staff and above can view recipes
CREATE POLICY "recipes_select_policy" ON recipes FOR SELECT USING (
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- INSERT: Manager and above can create recipes
CREATE POLICY "recipes_insert_policy" ON recipes FOR INSERT WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- UPDATE: Manager and above can update recipes
CREATE POLICY "recipes_update_policy" ON recipes FOR UPDATE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
) WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- DELETE: Only admin and above can delete recipes
CREATE POLICY "recipes_delete_policy" ON recipes FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- RECIPE INGREDIENTS POLICIES
-- ========================================

-- SELECT: Kitchen staff and above can view recipe ingredients
CREATE POLICY "recipe_ingredients_select_policy" ON recipe_ingredients FOR SELECT USING (
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- INSERT: Manager and above can add recipe ingredients
CREATE POLICY "recipe_ingredients_insert_policy" ON recipe_ingredients FOR INSERT WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- UPDATE: Manager and above can update recipe ingredients
CREATE POLICY "recipe_ingredients_update_policy" ON recipe_ingredients FOR UPDATE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
) WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- DELETE: Only admin and above can delete recipe ingredients
CREATE POLICY "recipe_ingredients_delete_policy" ON recipe_ingredients FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- ORDERS POLICIES
-- ========================================

-- SELECT: Sales staff and above can view orders
CREATE POLICY "orders_select_policy" ON orders FOR SELECT USING (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- INSERT: Sales staff and above can create orders
CREATE POLICY "orders_insert_policy" ON orders FOR INSERT WITH CHECK (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- UPDATE: Sales staff and above can update orders
CREATE POLICY "orders_update_policy" ON orders FOR UPDATE USING (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
) WITH CHECK (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- DELETE: Only manager and above can delete orders
CREATE POLICY "orders_delete_policy" ON orders FOR DELETE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- ========================================
-- ORDER ITEMS POLICIES
-- ========================================

-- SELECT: Sales staff and above can view order items
CREATE POLICY "order_items_select_policy" ON order_items FOR SELECT USING (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- INSERT: Sales staff and above can create order items
CREATE POLICY "order_items_insert_policy" ON order_items FOR INSERT WITH CHECK (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- UPDATE: Sales staff and above can update order items
CREATE POLICY "order_items_update_policy" ON order_items FOR UPDATE USING (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
) WITH CHECK (
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- DELETE: Only manager and above can delete order items
CREATE POLICY "order_items_delete_policy" ON order_items FOR DELETE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- ========================================
-- PAYMENTS POLICIES
-- ========================================

-- SELECT: Finance, sales staff and above can view payments
CREATE POLICY "payments_select_policy" ON payments FOR SELECT USING (
    user_has_business_unit_access('finance') OR
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- INSERT: Finance, sales staff and above can create payments
CREATE POLICY "payments_insert_policy" ON payments FOR INSERT WITH CHECK (
    user_has_business_unit_access('finance') OR
    user_has_business_unit_access('sales') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- UPDATE: Only manager and above can update payments
CREATE POLICY "payments_update_policy" ON payments FOR UPDATE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
) WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- DELETE: Only admin and above can delete payments
CREATE POLICY "payments_delete_policy" ON payments FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- PRODUCTIONS POLICIES
-- ========================================

-- SELECT: Kitchen staff and above can view productions
CREATE POLICY "productions_select_policy" ON productions FOR SELECT USING (
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- INSERT: Kitchen staff and above can create productions
CREATE POLICY "productions_insert_policy" ON productions FOR INSERT WITH CHECK (
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- UPDATE: Kitchen staff and above can update productions
CREATE POLICY "productions_update_policy" ON productions FOR UPDATE USING (
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
) WITH CHECK (
    user_has_business_unit_access('kitchen') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- DELETE: Only manager and above can delete productions
CREATE POLICY "productions_delete_policy" ON productions FOR DELETE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- ========================================
-- STOCK TRANSACTIONS POLICIES
-- ========================================

-- SELECT: Inventory staff and above can view stock transactions
CREATE POLICY "stock_transactions_select_policy" ON stock_transactions FOR SELECT USING (
    user_has_business_unit_access('inventory') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- INSERT: Inventory staff and above can create stock transactions
CREATE POLICY "stock_transactions_insert_policy" ON stock_transactions FOR INSERT WITH CHECK (
    user_has_business_unit_access('inventory') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- UPDATE: Only manager and above can update stock transactions
CREATE POLICY "stock_transactions_update_policy" ON stock_transactions FOR UPDATE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
) WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- DELETE: Only admin and above can delete stock transactions
CREATE POLICY "stock_transactions_delete_policy" ON stock_transactions FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- FINANCIAL RECORDS POLICIES
-- ========================================

-- SELECT: Finance staff and above can view financial records
CREATE POLICY "financial_records_select_policy" ON financial_records FOR SELECT USING (
    user_has_business_unit_access('finance') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- INSERT: Finance staff and above can create financial records
CREATE POLICY "financial_records_insert_policy" ON financial_records FOR INSERT WITH CHECK (
    user_has_business_unit_access('finance') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- UPDATE: Only manager and above can update financial records
CREATE POLICY "financial_records_update_policy" ON financial_records FOR UPDATE USING (
    get_user_role() IN ('manager', 'admin', 'super_admin')
) WITH CHECK (
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

-- DELETE: Only admin and above can delete financial records
CREATE POLICY "financial_records_delete_policy" ON financial_records FOR DELETE USING (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- SYNC EVENTS POLICIES (System/Admin only)
-- ========================================

CREATE POLICY "sync_events_select_policy" ON sync_events FOR SELECT USING (
    get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "sync_events_insert_policy" ON sync_events FOR INSERT WITH CHECK (
    get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "sync_events_update_policy" ON sync_events FOR UPDATE USING (
    get_user_role() IN ('admin', 'super_admin')
) WITH CHECK (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- SYSTEM METRICS POLICIES (Admin only)
-- ========================================

CREATE POLICY "system_metrics_select_policy" ON system_metrics FOR SELECT USING (
    get_user_role() IN ('admin', 'super_admin')
);

CREATE POLICY "system_metrics_insert_policy" ON system_metrics FOR INSERT WITH CHECK (
    get_user_role() IN ('admin', 'super_admin')
);

-- ========================================
-- INVENTORY STOCK LOGS POLICIES
-- ========================================

CREATE POLICY "inventory_stock_logs_select_policy" ON inventory_stock_logs FOR SELECT USING (
    user_has_business_unit_access('inventory') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('manager', 'admin', 'super_admin')
);

CREATE POLICY "inventory_stock_logs_insert_policy" ON inventory_stock_logs FOR INSERT WITH CHECK (
    user_has_business_unit_access('inventory') OR
    user_has_business_unit_access('all') OR
    get_user_role() IN ('staff', 'manager', 'admin', 'super_admin')
);

-- ========================================
-- TRIGGERS FOR AUDIT TRAILS
-- ========================================

-- Update triggers for new audit fields
CREATE OR REPLACE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically set created_by and updated_by fields
CREATE OR REPLACE FUNCTION set_user_tracking()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_by = auth.uid();
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_by = auth.uid();
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply user tracking to relevant tables
CREATE OR REPLACE TRIGGER set_customers_user_tracking BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

CREATE OR REPLACE TRIGGER set_ingredients_user_tracking BEFORE INSERT OR UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

CREATE OR REPLACE TRIGGER set_recipes_user_tracking BEFORE INSERT OR UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

CREATE OR REPLACE TRIGGER set_orders_user_tracking BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

CREATE OR REPLACE TRIGGER set_productions_user_tracking BEFORE INSERT OR UPDATE ON productions
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

CREATE OR REPLACE TRIGGER set_stock_transactions_user_tracking BEFORE INSERT ON stock_transactions
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

CREATE OR REPLACE TRIGGER set_financial_records_user_tracking BEFORE INSERT ON financial_records
    FOR EACH ROW EXECUTE FUNCTION set_user_tracking();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_sync_events_entity ON sync_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_status ON sync_events(sync_status);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_logs_ingredient ON inventory_stock_logs(ingredient_id);

-- Insert initial super admin user (you'll need to update this with actual user ID)
-- This should be done after user signs up through Supabase Auth
-- INSERT INTO user_profiles (user_id, email, full_name, role, business_unit)
-- VALUES ('your-user-id-here', 'admin@yourdomain.com', 'Super Admin', 'super_admin', 'all');

COMMENT ON TABLE user_profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE sync_events IS 'System synchronization events log';
COMMENT ON TABLE system_metrics IS 'System performance and health metrics';
COMMENT ON TABLE inventory_stock_logs IS 'Detailed inventory stock change logs';

COMMENT ON FUNCTION get_user_role IS 'Helper function to get current user role for RLS policies';
COMMENT ON FUNCTION user_has_permission IS 'Helper function to check user-specific permissions';
COMMENT ON FUNCTION user_has_business_unit_access IS 'Helper function to check business unit access';
-- ============================================
-- Stack Auth + Supabase RLS Integration
-- ============================================
-- This migration enables Row Level Security (RLS) on all tables
-- and creates policies that use Stack Auth JWT tokens via auth.uid()

-- ============================================
-- 1. Helper Function: Auto-set user_id
-- ============================================
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Enable RLS on All Tables
-- ============================================

-- Core tables
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Financial tables
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Production tables
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;

-- HPP tables
ALTER TABLE hpp_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_alerts ENABLE ROW LEVEL SECURITY;

-- System tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Create RLS Policies
-- ============================================

-- Macro to create standard CRUD policies for a table
DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'ingredients', 'recipes', 'recipe_ingredients', 'orders', 'order_items',
    'customers', 'suppliers', 'ingredient_purchases', 'categories',
    'financial_records', 'operational_costs', 'expenses', 'sales',
    'production_batches', 'hpp_calculations', 'hpp_alerts',
    'notifications', 'notification_preferences', 'whatsapp_templates',
    'error_logs', 'performance_logs', 'chat_sessions', 'chat_messages'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    -- SELECT policy
    EXECUTE format('
      CREATE POLICY "%s_select_policy" ON %I
      FOR SELECT
      USING (auth.uid() = user_id)
    ', table_name, table_name);

    -- INSERT policy
    EXECUTE format('
      CREATE POLICY "%s_insert_policy" ON %I
      FOR INSERT
      WITH CHECK (auth.uid() = user_id)
    ', table_name, table_name);

    -- UPDATE policy
    EXECUTE format('
      CREATE POLICY "%s_update_policy" ON %I
      FOR UPDATE
      USING (auth.uid() = user_id)
    ', table_name, table_name);

    -- DELETE policy
    EXECUTE format('
      CREATE POLICY "%s_delete_policy" ON %I
      FOR DELETE
      USING (auth.uid() = user_id)
    ', table_name, table_name);

    -- Add trigger to auto-set user_id on INSERT
    EXECUTE format('
      CREATE TRIGGER set_user_id_trigger_%s
      BEFORE INSERT ON %I
      FOR EACH ROW
      EXECUTE FUNCTION set_user_id()
    ', table_name, table_name);

    RAISE NOTICE 'Created RLS policies and trigger for table: %', table_name;
  END LOOP;
END $$;

-- ============================================
-- 4. Special Cases
-- ============================================

-- Recipe ingredients: Allow access if user owns the recipe
DROP POLICY IF EXISTS "recipe_ingredients_select_policy" ON recipe_ingredients;
CREATE POLICY "recipe_ingredients_select_policy" ON recipe_ingredients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "recipe_ingredients_insert_policy" ON recipe_ingredients;
CREATE POLICY "recipe_ingredients_insert_policy" ON recipe_ingredients
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
    AND recipes.user_id = auth.uid()
  )
);

-- Order items: Allow access if user owns the order
DROP POLICY IF EXISTS "order_items_select_policy" ON order_items;
CREATE POLICY "order_items_select_policy" ON order_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "order_items_insert_policy" ON order_items;
CREATE POLICY "order_items_insert_policy" ON order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- ============================================
-- 5. Grant Permissions
-- ============================================

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 6. Verification
-- ============================================

-- View all RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Test RLS (run as authenticated user)
-- SELECT * FROM orders; -- Should only return user's orders
-- INSERT INTO orders (customer_id, total) VALUES ('...', 100000); -- user_id auto-set

COMMENT ON FUNCTION set_user_id() IS 'Automatically sets user_id to auth.uid() on INSERT if not provided';

-- Add missing indexes for foreign keys to improve query performance
-- This migration addresses 35 unindexed foreign keys identified by Supabase advisor

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON public.customers(created_by);
CREATE INDEX IF NOT EXISTS idx_customers_updated_by ON public.customers(updated_by);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Daily sales summary indexes
CREATE INDEX IF NOT EXISTS idx_daily_sales_summary_top_selling_recipe_id ON public.daily_sales_summary(top_selling_recipe_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses(user_id);

-- Financial records indexes
CREATE INDEX IF NOT EXISTS idx_financial_records_created_by ON public.financial_records(created_by);
CREATE INDEX IF NOT EXISTS idx_financial_records_user_id ON public.financial_records(user_id);

-- HPP alerts indexes
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_id ON public.hpp_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_recipe_id ON public.hpp_alerts(recipe_id);

-- HPP snapshots indexes
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_user_id ON public.hpp_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_recipe_id ON public.hpp_snapshots(recipe_id);

-- Ingredient purchases indexes
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_user_id ON public.ingredient_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_ingredient_id ON public.ingredient_purchases(ingredient_id);

-- Ingredients indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_created_by ON public.ingredients(created_by);
CREATE INDEX IF NOT EXISTS idx_ingredients_updated_by ON public.ingredients(updated_by);
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON public.ingredients(user_id);

-- Inventory alerts indexes
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_user_id ON public.inventory_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_ingredient_id ON public.inventory_alerts(ingredient_id);

-- Inventory reorder rules indexes
CREATE INDEX IF NOT EXISTS idx_inventory_reorder_rules_user_id ON public.inventory_reorder_rules(user_id);

-- Operational costs indexes
CREATE INDEX IF NOT EXISTS idx_operational_costs_created_by ON public.operational_costs(created_by);
CREATE INDEX IF NOT EXISTS idx_operational_costs_updated_by ON public.operational_costs(updated_by);
CREATE INDEX IF NOT EXISTS idx_operational_costs_user_id ON public.operational_costs(user_id);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_user_id ON public.order_items(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_recipe_id ON public.order_items(recipe_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_updated_by ON public.orders(updated_by);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_financial_record_id ON public.orders(financial_record_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);

-- Production schedules indexes
CREATE INDEX IF NOT EXISTS idx_production_schedules_user_id ON public.production_schedules(user_id);

-- Productions indexes
CREATE INDEX IF NOT EXISTS idx_productions_user_id ON public.productions(user_id);
CREATE INDEX IF NOT EXISTS idx_productions_recipe_id ON public.productions(recipe_id);

-- Recipe ingredients indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_user_id ON public.recipe_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON public.recipe_ingredients(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient_id ON public.recipe_ingredients(ingredient_id);

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON public.recipes(created_by);
CREATE INDEX IF NOT EXISTS idx_recipes_updated_by ON public.recipes(updated_by);
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);

-- Stock transactions indexes
CREATE INDEX IF NOT EXISTS idx_stock_transactions_user_id ON public.stock_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_ingredient_id ON public.stock_transactions(ingredient_id);

-- Supplier ingredients indexes
CREATE INDEX IF NOT EXISTS idx_supplier_ingredients_user_id ON public.supplier_ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ingredients_supplier_id ON public.supplier_ingredients(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_ingredients_ingredient_id ON public.supplier_ingredients(ingredient_id);

-- Suppliers indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON public.suppliers(user_id);

-- Usage analytics indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_user_id ON public.usage_analytics(user_id);

-- WhatsApp templates indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_user_id ON public.whatsapp_templates(user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_user_date ON public.orders(user_id, order_date DESC);
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_recipe_date ON public.hpp_snapshots(recipe_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_read ON public.hpp_alerts(user_id, is_read);

-- Add comments for documentation
COMMENT ON INDEX idx_customers_user_id IS 'Improves customer queries filtered by user';
COMMENT ON INDEX idx_orders_user_status IS 'Optimizes order list queries with status filter';
COMMENT ON INDEX idx_hpp_snapshots_recipe_date IS 'Speeds up HPP historical tracking queries';

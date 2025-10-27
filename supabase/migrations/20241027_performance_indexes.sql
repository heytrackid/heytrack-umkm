-- Performance Optimization: Additional Composite Indexes
-- Created: 2024-10-27
-- Purpose: Speed up common queries with composite indexes

-- Recipes: user_id + is_active (most common filter)
CREATE INDEX IF NOT EXISTS idx_recipes_user_active 
ON recipes(user_id, is_active) 
WHERE is_active = true;

-- Orders: user_id + status (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status);

-- Orders: user_id + order_date (date range queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_date 
ON orders(user_id, order_date DESC);

-- Ingredients: user_id + current_stock (low stock alerts)
CREATE INDEX IF NOT EXISTS idx_ingredients_user_stock 
ON ingredients(user_id, current_stock) 
WHERE current_stock <= min_stock;

-- HPP Snapshots: recipe_id + snapshot_date (trend queries)
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_recipe_date 
ON hpp_snapshots(recipe_id, snapshot_date DESC);

-- HPP Alerts: user_id + is_read (unread alerts)
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_unread 
ON hpp_alerts(user_id, is_read, created_at DESC) 
WHERE is_read = false;

-- Recipe Ingredients: recipe_id (join optimization)
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe 
ON recipe_ingredients(recipe_id);

-- Order Items: order_id (join optimization)
CREATE INDEX IF NOT EXISTS idx_order_items_order 
ON order_items(order_id);

-- Customers: user_id + customer_type (segmentation)
CREATE INDEX IF NOT EXISTS idx_customers_user_type 
ON customers(user_id, customer_type);

-- Expenses: user_id + expense_date (financial reports)
CREATE INDEX IF NOT EXISTS idx_expenses_user_date 
ON expenses(user_id, expense_date DESC);

-- Analyze tables to update statistics
ANALYZE recipes;
ANALYZE orders;
ANALYZE ingredients;
ANALYZE hpp_snapshots;
ANALYZE hpp_alerts;
ANALYZE customers;
ANALYZE expenses;

-- Add comments for documentation
COMMENT ON INDEX idx_recipes_user_active IS 'Optimizes active recipes queries by user';
COMMENT ON INDEX idx_orders_user_status IS 'Optimizes order filtering by status';
COMMENT ON INDEX idx_ingredients_user_stock IS 'Optimizes low stock alerts';
COMMENT ON INDEX idx_hpp_alerts_user_unread IS 'Optimizes unread alerts queries';

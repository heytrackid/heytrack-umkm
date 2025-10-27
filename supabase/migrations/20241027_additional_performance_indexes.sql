-- Additional Performance Indexes for HeyTrack
-- Created: 2024-10-27
-- Purpose: Optimize common query patterns with composite indexes

-- Recipes: User + Active status (common filter)
CREATE INDEX IF NOT EXISTS idx_recipes_user_active 
ON recipes(user_id, is_active) 
WHERE is_active = true;

-- Orders: User + Status (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_status 
ON orders(user_id, status);

-- Orders: User + Payment Status (financial reports)
CREATE INDEX IF NOT EXISTS idx_orders_user_payment 
ON orders(user_id, payment_status);

-- Orders: User + Created Date (date range queries)
CREATE INDEX IF NOT EXISTS idx_orders_user_created 
ON orders(user_id, created_at DESC);

-- Ingredients: User + Stock Level (inventory alerts)
CREATE INDEX IF NOT EXISTS idx_ingredients_user_stock 
ON ingredients(user_id, current_stock);

-- Ingredient Purchases: User + Date (cost tracking)
CREATE INDEX IF NOT EXISTS idx_purchases_user_date 
ON ingredient_purchases(user_id, purchase_date DESC);

-- HPP Snapshots: Recipe + Date (trend analysis)
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_recipe_date 
ON hpp_daily_snapshots(recipe_id, snapshot_date DESC);

-- HPP Alerts: User + Read Status (notification center)
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_read 
ON hpp_alerts(user_id, is_read, created_at DESC);

-- Order Items: Order ID (join optimization)
CREATE INDEX IF NOT EXISTS idx_order_items_order 
ON order_items(order_id);

-- Recipe Ingredients: Recipe ID (join optimization)
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe 
ON recipe_ingredients(recipe_id);

-- Operational Costs: User + Date (expense tracking)
CREATE INDEX IF NOT EXISTS idx_operational_costs_user_date 
ON operational_costs(user_id, cost_date DESC);

-- Add statistics for better query planning
ANALYZE recipes;
ANALYZE orders;
ANALYZE ingredients;
ANALYZE hpp_daily_snapshots;
ANALYZE hpp_alerts;
ANALYZE order_items;
ANALYZE recipe_ingredients;

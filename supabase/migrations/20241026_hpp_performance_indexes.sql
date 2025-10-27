-- Performance optimization indexes for HPP features
-- Created: 2024-10-26

-- HPP Snapshots indexes
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_user_date 
ON hpp_snapshots(user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_recipe_date 
ON hpp_snapshots(recipe_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_user_recipe 
ON hpp_snapshots(user_id, recipe_id, snapshot_date DESC);

-- HPP Alerts indexes
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_read_created 
ON hpp_alerts(user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hpp_alerts_recipe_created 
ON hpp_alerts(recipe_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_type 
ON hpp_alerts(user_id, alert_type, created_at DESC);

-- HPP Calculations indexes
CREATE INDEX IF NOT EXISTS idx_hpp_calculations_user_recipe 
ON hpp_calculations(user_id, recipe_id);

CREATE INDEX IF NOT EXISTS idx_hpp_calculations_recipe_created 
ON hpp_calculations(recipe_id, created_at DESC);

-- HPP Recommendations indexes
CREATE INDEX IF NOT EXISTS idx_hpp_recommendations_user_implemented 
ON hpp_recommendations(user_id, is_implemented, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hpp_recommendations_recipe_priority 
ON hpp_recommendations(recipe_id, priority, created_at DESC);

-- Recipes indexes for HPP queries
CREATE INDEX IF NOT EXISTS idx_recipes_user_active_category 
ON recipes(user_id, is_active, category);

CREATE INDEX IF NOT EXISTS idx_recipes_user_active_created 
ON recipes(user_id, is_active, created_at DESC);

-- Recipe ingredients indexes
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe 
ON recipe_ingredients(recipe_id);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient 
ON recipe_ingredients(ingredient_id);

-- Ingredients indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_user_active 
ON ingredients(user_id, is_active);

-- Ingredient purchases indexes for WAC calculation
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_ingredient_date 
ON ingredient_purchases(ingredient_id, purchase_date DESC);

CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_user_date 
ON ingredient_purchases(user_id, purchase_date DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_hpp_snapshots_user_date IS 'Optimize HPP snapshots queries by user and date';
COMMENT ON INDEX idx_hpp_alerts_user_read_created IS 'Optimize unread alerts queries';
COMMENT ON INDEX idx_hpp_calculations_user_recipe IS 'Optimize HPP calculations lookup';
COMMENT ON INDEX idx_ingredient_purchases_ingredient_date IS 'Optimize WAC calculations';

-- Analyze tables to update statistics
ANALYZE hpp_snapshots;
ANALYZE hpp_alerts;
ANALYZE hpp_calculations;
ANALYZE hpp_recommendations;
ANALYZE recipes;
ANALYZE recipe_ingredients;
ANALYZE ingredients;
ANALYZE ingredient_purchases;

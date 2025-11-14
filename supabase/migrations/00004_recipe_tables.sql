-- ============================================================================
-- HeyTrack Database Schema - Part 4: Recipe Tables
-- ============================================================================

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  instructions TEXT,
  servings INTEGER,
  batch_size NUMERIC,
  prep_time INTEGER,
  cook_time INTEGER,
  difficulty TEXT,
  rating NUMERIC,
  image_url TEXT,
  cost_per_unit NUMERIC,
  previous_cost NUMERIC,
  selling_price NUMERIC,
  margin_percentage NUMERIC,
  times_made INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  last_made_at TIMESTAMPTZ,
  seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL
);

-- ChefWise Generations Table
CREATE TABLE IF NOT EXISTS chefwise_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  request JSONB NOT NULL DEFAULT '{}',
  recipe JSONB NOT NULL DEFAULT '{}',
  optimization_applied JSONB DEFAULT '{}',
  saved_to_recipes BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ChefWise Preferences Table
CREATE TABLE IF NOT EXISTS chefwise_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  dietary_restrictions TEXT[] DEFAULT '{}',
  preferred_cuisines TEXT[] DEFAULT '{}',
  budget_range NUMERIC(12,2),
  complexity_preference TEXT CHECK (complexity_preference IN ('simple', 'medium', 'complex')),
  default_servings INTEGER DEFAULT 4,
  max_cooking_time INTEGER, -- in minutes
  favorite_ingredients TEXT[] DEFAULT '{}',
  allergen_ingredients TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chefwise_generations_user_id ON chefwise_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_chefwise_generations_created_at ON chefwise_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chefwise_generations_saved_to_recipes ON chefwise_generations(saved_to_recipes);

-- Create updated_at trigger for chefwise_generations
CREATE OR REPLACE FUNCTION update_chefwise_generations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chefwise_generations_updated_at
  BEFORE UPDATE ON chefwise_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_chefwise_generations_updated_at();

-- Create updated_at trigger for chefwise_preferences
CREATE OR REPLACE FUNCTION update_chefwise_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chefwise_preferences_updated_at
  BEFORE UPDATE ON chefwise_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_chefwise_preferences_updated_at();

-- Row Level Security (RLS)
ALTER TABLE chefwise_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chefwise_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chefwise_generations
CREATE POLICY "Users can view their own chefwise generations"
  ON chefwise_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chefwise generations"
  ON chefwise_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chefwise generations"
  ON chefwise_generations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chefwise generations"
  ON chefwise_generations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for chefwise_preferences
CREATE POLICY "Users can view their own chefwise preferences"
  ON chefwise_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chefwise preferences"
  ON chefwise_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chefwise preferences"
  ON chefwise_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chefwise preferences"
  ON chefwise_preferences FOR DELETE
  USING (auth.uid() = user_id);

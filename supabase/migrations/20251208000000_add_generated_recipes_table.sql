-- Migration: Add generated_recipes table for AI recipe history
-- Created: 2025-12-08

-- Create table for storing AI-generated recipes
CREATE TABLE IF NOT EXISTS generated_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  servings INTEGER DEFAULT 4,
  cuisine TEXT,
  recipe_data JSONB NOT NULL,
  total_estimated_cost NUMERIC(12,2),
  is_saved BOOLEAN DEFAULT FALSE,
  saved_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_recipes_user_id ON generated_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_recipes_created_at ON generated_recipes(created_at DESC);

-- Enable RLS
ALTER TABLE generated_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own generated recipes"
  ON generated_recipes FOR SELECT
  USING (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can insert own generated recipes"
  ON generated_recipes FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can update own generated recipes"
  ON generated_recipes FOR UPDATE
  USING (user_id = (SELECT auth.uid()::text));

CREATE POLICY "Users can delete own generated recipes"
  ON generated_recipes FOR DELETE
  USING (user_id = (SELECT auth.uid()::text));

-- Add comment
COMMENT ON TABLE generated_recipes IS 'Stores AI-generated recipe history for users';

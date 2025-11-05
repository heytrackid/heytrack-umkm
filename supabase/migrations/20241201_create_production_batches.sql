-- Create production_batches table for tracking production batches
CREATE TABLE production_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_no VARCHAR(50) NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  planned_quantity INTEGER NOT NULL,
  produced_quantity INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_production_batches_user_id ON production_batches(user_id);
CREATE INDEX idx_production_batches_recipe_id ON production_batches(recipe_id);
CREATE INDEX idx_production_batches_status ON production_batches(status);
CREATE INDEX idx_production_batches_created_at ON production_batches(created_at);

-- Enable RLS
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own production batches" ON production_batches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own production batches" ON production_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own production batches" ON production_batches
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own production batches" ON production_batches
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_production_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_production_batches_updated_at
  BEFORE UPDATE ON production_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_production_batches_updated_at();
-- Create ingredient_purchases table
CREATE TABLE IF NOT EXISTS ingredient_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  supplier TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_ingredient_id ON ingredient_purchases(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_purchase_date ON ingredient_purchases(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_supplier ON ingredient_purchases(supplier);
CREATE INDEX IF NOT EXISTS idx_ingredient_purchases_created_at ON ingredient_purchases(created_at DESC);

-- Enable RLS
ALTER TABLE ingredient_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON ingredient_purchases
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON ingredient_purchases
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON ingredient_purchases
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON ingredient_purchases
  FOR DELETE USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ingredient_purchases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ingredient_purchases_updated_at
  BEFORE UPDATE ON ingredient_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_ingredient_purchases_updated_at();

-- Add comment for documentation
COMMENT ON TABLE ingredient_purchases IS 'Stores ingredient purchase history for inventory tracking';
COMMENT ON COLUMN ingredient_purchases.ingredient_id IS 'Reference to the ingredient being purchased';
COMMENT ON COLUMN ingredient_purchases.quantity IS 'Quantity purchased in the ingredient unit';
COMMENT ON COLUMN ingredient_purchases.unit_price IS 'Price per unit at time of purchase';
COMMENT ON COLUMN ingredient_purchases.total_price IS 'Total cost of the purchase (quantity * unit_price)';
COMMENT ON COLUMN ingredient_purchases.supplier IS 'Name of the supplier';
COMMENT ON COLUMN ingredient_purchases.purchase_date IS 'Date when the purchase was made';
COMMENT ON COLUMN ingredient_purchases.notes IS 'Additional notes about the purchase';

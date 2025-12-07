-- Add waste_factor column to ingredients table
-- This represents the waste/spoilage multiplier (e.g., 1.05 = 5% waste)
-- Default is 1.0 (no waste)

ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS waste_factor DECIMAL(5,3) DEFAULT 1.000 CHECK (waste_factor >= 1.000 AND waste_factor <= 2.000);

COMMENT ON COLUMN ingredients.waste_factor IS 'Waste/spoilage multiplier for cost calculation. 1.05 = 5% waste, 1.10 = 10% waste. Range: 1.000-2.000';

-- Update existing ingredients to have default waste factor
UPDATE ingredients
SET waste_factor = 1.000
WHERE waste_factor IS NULL;

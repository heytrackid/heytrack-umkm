-- Add packaging_cost_per_unit field to recipes table
-- This field tracks the packaging cost per serving/unit for each recipe
-- Essential for accurate HPP calculation in food business

ALTER TABLE recipes 
ADD COLUMN packaging_cost_per_unit DECIMAL(10,2) DEFAULT 0.00 NOT NULL;

-- Add comment
COMMENT ON COLUMN recipes.packaging_cost_per_unit IS 'Packaging cost per serving/unit in IDR. Includes boxes, wrappers, labels, etc.';

-- Create index for frequently accessed packaging_cost column
CREATE INDEX idx_recipes_packaging_cost ON recipes(packaging_cost_per_unit) WHERE packaging_cost_per_unit > 0;

-- Add check constraint to ensure non-negative values
ALTER TABLE recipes 
ADD CONSTRAINT chk_recipes_packaging_cost_non_negative 
CHECK (packaging_cost_per_unit >= 0);

-- Update existing recipes with estimated packaging costs based on category
UPDATE recipes 
SET packaging_cost_per_unit = CASE 
  WHEN LOWER(category) LIKE '%cake%' OR LOWER(category) LIKE '%kue%' THEN 500.00 -- Cake boxes
  WHEN LOWER(category) LIKE '%bread%' OR LOWER(category) LIKE '%roti%' THEN 200.00 -- Bread bags
  WHEN LOWER(category) LIKE '%drink%' OR LOWER(category) LIKE '%minuman%' OR LOWER(category) LIKE '%jus%' THEN 300.00 -- Cups/lids
  WHEN LOWER(category) LIKE '%rice%' OR LOWER(category) LIKE '%nasi%' OR LOWER(category) LIKE '%meal%' THEN 1000.00 -- Food containers
  WHEN LOWER(category) LIKE '%snack%' OR LOWER(category) LIKE '%cemilan%' THEN 150.00 -- Small bags
  ELSE 250.00 -- Default packaging
END
WHERE packaging_cost_per_unit = 0.00; -- Only update those still at default

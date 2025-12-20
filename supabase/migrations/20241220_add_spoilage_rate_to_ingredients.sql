-- Add spoilage_rate field to ingredients table
-- This field tracks the expected spoilage percentage for each ingredient
-- Default 0.05 (5%) for food items, 0.01 (1%) for non-perishables

ALTER TABLE ingredients 
ADD COLUMN spoilage_rate DECIMAL(5,4) DEFAULT 0.0500 NOT NULL;

-- Add comment
COMMENT ON COLUMN ingredients.spoilage_rate IS 'Expected spoilage rate as decimal (0.0500 = 5%). Used to adjust WAC for accurate costing.';

-- Create index for frequently accessed spoilage_rate column
CREATE INDEX idx_ingredients_spoilage_rate ON ingredients(spoilage_rate) WHERE spoilage_rate > 0.01;

-- Update existing ingredients with category-based defaults
UPDATE ingredients 
SET spoilage_rate = CASE 
  WHEN LOWER(category) LIKE '%dairy%' OR LOWER(category) LIKE '%susu%' OR LOWER(category) LIKE '%keju%' THEN 0.0800 -- 8% for dairy
  WHEN LOWER(category) LIKE '%meat%' OR LOWER(category) LIKE '%daging%' OR LOWER(category) LIKE '%ayam%' OR LOWER(category) LIKE '%ikan%' THEN 0.1000 -- 10% for meat/fish
  WHEN LOWER(category) LIKE '%vegetable%' OR LOWER(category) LIKE '%sayur%' OR LOWER(category) LIKE '%buah%' THEN 0.1500 -- 15% for produce
  WHEN LOWER(category) LIKE '%frozen%' OR LOWER(category) LIKE '%beku%' THEN 0.0500 -- 5% for frozen
  WHEN LOWER(category) LIKE '%dry%' OR LOWER(category) LIKE '%kering%' OR LOWER(category) LIKE '%spice%' OR LOWER(category) LIKE '%rempah%' THEN 0.0200 -- 2% for dry goods
  ELSE 0.0500 -- 5% default
END
WHERE spoilage_rate = 0.0500; -- Only update those still at default

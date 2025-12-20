-- Add packaging_cost field to hpp_calculations table
-- This field tracks the packaging cost component of HPP

ALTER TABLE hpp_calculations 
ADD COLUMN packaging_cost DECIMAL(12,2) DEFAULT 0.00 NOT NULL;

-- Add comment
COMMENT ON COLUMN hpp_calculations.packaging_cost IS 'Packaging cost component of HPP calculation in IDR.';

-- Add check constraint to ensure non-negative values
ALTER TABLE hpp_calculations 
ADD CONSTRAINT chk_hpp_calculations_packaging_cost_non_negative 
CHECK (packaging_cost >= 0);

-- Update existing calculations to estimate packaging costs
-- This is a rough estimation based on material costs (typically 5-15% of material cost)
UPDATE hpp_calculations 
SET packaging_cost = GREATEST(
  LEAST(material_cost * 0.10, 2000), -- Max 10% of material cost or 2000 IDR
  100 -- Minimum 100 IDR
)
WHERE packaging_cost = 0.00 AND material_cost > 0;

-- Create index for frequently accessed packaging_cost column
CREATE INDEX idx_hpp_calculations_packaging_cost ON hpp_calculations(packaging_cost) WHERE packaging_cost > 0;

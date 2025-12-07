-- Add actual_quantity field to production_batches for proper yield tracking
-- This allows the main production UI to track actual production quantities vs planned

ALTER TABLE production_batches
ADD COLUMN actual_quantity numeric;

-- Add comment for documentation
COMMENT ON COLUMN production_batches.actual_quantity IS 'Actual quantity produced (for yield calculation)';

-- Add constraint to ensure actual_quantity is not negative
ALTER TABLE production_batches
ADD CONSTRAINT production_batches_actual_quantity_check
CHECK (actual_quantity >= 0);
-- Add supplier_type enum and column to suppliers table
-- This migration adds classification system for suppliers similar to customer types

-- Create enum type for supplier classification
CREATE TYPE supplier_type AS ENUM ('preferred', 'standard', 'trial', 'blacklisted');

-- Add supplier_type column to suppliers table
ALTER TABLE suppliers
ADD COLUMN supplier_type supplier_type DEFAULT 'standard';

-- Add comment for documentation
COMMENT ON COLUMN suppliers.supplier_type IS 'Supplier classification: preferred (top tier), standard (regular), trial (new/unproven), blacklisted (avoid)';

-- Update existing suppliers to 'standard' if not set (should be default, but explicit)
UPDATE suppliers
SET supplier_type = 'standard'
WHERE supplier_type IS NULL;

-- Make column NOT NULL after setting defaults
ALTER TABLE suppliers
ALTER COLUMN supplier_type SET NOT NULL;
-- Migration: Fix created_by fields for legacy data
-- This ensures all records have proper created_by values for API filtering

-- Update recipes where created_by is null
UPDATE recipes 
SET 
  created_by = user_id, 
  updated_by = user_id,
  updated_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update ingredients where created_by is null
UPDATE ingredients 
SET 
  created_by = user_id, 
  updated_by = user_id,
  updated_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update customers where created_by is null
UPDATE customers 
SET 
  created_by = user_id, 
  updated_by = user_id,
  updated_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update orders where created_by is null
UPDATE orders 
SET 
  created_by = user_id, 
  updated_by = user_id,
  updated_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update operational_costs where created_by is null
UPDATE operational_costs 
SET 
  created_by = user_id, 
  updated_by = user_id,
  updated_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update productions where created_by is null
UPDATE productions 
SET 
  created_by = user_id, 
  updated_by = user_id,
  updated_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update stock_transactions where created_by is null
UPDATE stock_transactions 
SET 
  created_by = user_id,
  created_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Update financial_records where created_by is null
UPDATE financial_records 
SET 
  created_by = user_id,
  created_at = NOW()
WHERE created_by IS NULL AND user_id IS NOT NULL;

-- Add comment
COMMENT ON MIGRATION IS 'Fix created_by fields for legacy data to ensure proper API filtering';

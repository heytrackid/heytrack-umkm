-- Migration: Add triggers to auto-populate created_by from user_id
-- This prevents future records from having NULL created_by values

-- Function to auto-populate created_by and updated_by
CREATE OR REPLACE FUNCTION auto_populate_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT: Set created_by and updated_by from user_id if not provided
  IF TG_OP = 'INSERT' THEN
    IF NEW.created_by IS NULL AND NEW.user_id IS NOT NULL THEN
      NEW.created_by := NEW.user_id;
    END IF;
    IF NEW.updated_by IS NULL AND NEW.user_id IS NOT NULL THEN
      NEW.updated_by := NEW.user_id;
    END IF;
  END IF;
  
  -- On UPDATE: Set updated_by from user_id if not provided
  IF TG_OP = 'UPDATE' THEN
    IF NEW.updated_by IS NULL AND NEW.user_id IS NOT NULL THEN
      NEW.updated_by := NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to recipes table
DROP TRIGGER IF EXISTS recipes_auto_populate_created_by ON recipes;
CREATE TRIGGER recipes_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to ingredients table
DROP TRIGGER IF EXISTS ingredients_auto_populate_created_by ON ingredients;
CREATE TRIGGER ingredients_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON ingredients
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to customers table
DROP TRIGGER IF EXISTS customers_auto_populate_created_by ON customers;
CREATE TRIGGER customers_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to orders table
DROP TRIGGER IF EXISTS orders_auto_populate_created_by ON orders;
CREATE TRIGGER orders_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to operational_costs table
DROP TRIGGER IF EXISTS operational_costs_auto_populate_created_by ON operational_costs;
CREATE TRIGGER operational_costs_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON operational_costs
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to productions table
DROP TRIGGER IF EXISTS productions_auto_populate_created_by ON productions;
CREATE TRIGGER productions_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON productions
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to stock_transactions table
DROP TRIGGER IF EXISTS stock_transactions_auto_populate_created_by ON stock_transactions;
CREATE TRIGGER stock_transactions_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON stock_transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Apply trigger to financial_records table
DROP TRIGGER IF EXISTS financial_records_auto_populate_created_by ON financial_records;
CREATE TRIGGER financial_records_auto_populate_created_by
  BEFORE INSERT OR UPDATE ON financial_records
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_created_by();

-- Add comment
COMMENT ON FUNCTION auto_populate_created_by() IS 'Auto-populate created_by and updated_by from user_id to prevent NULL values';

-- Migration: Add atomic stock increment/decrement functions
-- Purpose: Prevent race conditions in inventory updates
-- Date: 2025-01-29

-- Function: Atomically increment ingredient stock
CREATE OR REPLACE FUNCTION increment_ingredient_stock(
    p_ingredient_id UUID,
    p_quantity DECIMAL
)
RETURNS TABLE (
    id UUID,
    current_stock DECIMAL,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atomic update using PostgreSQL's row-level locking
    RETURN QUERY
    UPDATE ingredients
    SET 
        current_stock = COALESCE(current_stock, 0) + p_quantity,
        updated_at = NOW()
    WHERE ingredients.id = p_ingredient_id
    RETURNING ingredients.id, ingredients.current_stock, ingredients.updated_at;
    
    -- Log the operation
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ingredient not found: %', p_ingredient_id;
    END IF;
END;
$$;

-- Function: Atomically decrement ingredient stock
CREATE OR REPLACE FUNCTION decrement_ingredient_stock(
    p_ingredient_id UUID,
    p_quantity DECIMAL
)
RETURNS TABLE (
    id UUID,
    current_stock DECIMAL,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atomic update with minimum stock check
    RETURN QUERY
    UPDATE ingredients
    SET 
        current_stock = GREATEST(0, COALESCE(current_stock, 0) - p_quantity),
        updated_at = NOW()
    WHERE ingredients.id = p_ingredient_id
    RETURNING ingredients.id, ingredients.current_stock, ingredients.updated_at;
    
    -- Log the operation
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Ingredient not found: %', p_ingredient_id;
    END IF;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION increment_ingredient_stock(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_ingredient_stock(UUID, DECIMAL) TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION increment_ingredient_stock IS 'Atomically increment ingredient stock to prevent race conditions';
COMMENT ON FUNCTION decrement_ingredient_stock IS 'Atomically decrement ingredient stock with minimum 0 check';

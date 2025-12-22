-- ============================================================================
-- STRICT STOCK VALIDATION
-- ============================================================================
-- Add optional strict mode for preventing negative stock
-- Configurable per user via settings table
-- ============================================================================

-- Create user settings table for stock management preferences
CREATE TABLE IF NOT EXISTS public.user_stock_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  allow_negative_stock BOOLEAN NOT NULL DEFAULT false,
  low_stock_alert_threshold DECIMAL(5,2) DEFAULT 20.00 CHECK (low_stock_alert_threshold >= 0 AND low_stock_alert_threshold <= 100),
  auto_reorder_enabled BOOLEAN NOT NULL DEFAULT false,
  stock_valuation_method VARCHAR(20) DEFAULT 'WAC' CHECK (stock_valuation_method IN ('WAC', 'FIFO', 'LIFO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stock_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own stock settings"
  ON public.user_stock_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock settings"
  ON public.user_stock_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock settings"
  ON public.user_stock_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to validate stock before deduction (respects user settings)
CREATE OR REPLACE FUNCTION public.validate_stock_deduction(
  p_ingredient_id UUID,
  p_quantity DECIMAL,
  p_user_id UUID
)
RETURNS TABLE (
  is_valid BOOLEAN,
  available_stock DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  v_current_stock DECIMAL;
  v_reserved_stock DECIMAL;
  v_available_stock DECIMAL;
  v_allow_negative BOOLEAN;
BEGIN
  -- Get user settings
  SELECT allow_negative_stock INTO v_allow_negative
  FROM public.user_stock_settings
  WHERE user_id = p_user_id;
  
  -- Default to false if no settings found
  v_allow_negative := COALESCE(v_allow_negative, false);
  
  -- Get current stock and reserved stock
  SELECT 
    COALESCE(current_stock, 0),
    COALESCE(reserved_stock, 0)
  INTO v_current_stock, v_reserved_stock
  FROM public.ingredients
  WHERE id = p_ingredient_id AND user_id = p_user_id;
  
  -- Calculate available stock
  v_available_stock := v_current_stock - v_reserved_stock;
  
  -- Validate based on settings
  IF v_allow_negative THEN
    -- Allow negative stock - always valid
    RETURN QUERY SELECT true, v_available_stock, NULL::TEXT;
  ELSE
    -- Strict mode - check if sufficient stock
    IF v_available_stock >= p_quantity THEN
      RETURN QUERY SELECT true, v_available_stock, NULL::TEXT;
    ELSE
      RETURN QUERY SELECT 
        false, 
        v_available_stock, 
        format('Insufficient stock. Available: %s, Required: %s', v_available_stock, p_quantity);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced stock deduction function with validation
CREATE OR REPLACE FUNCTION public.deduct_ingredient_stock_safe(
  p_ingredient_id UUID,
  p_quantity DECIMAL,
  p_user_id UUID,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  new_stock DECIMAL,
  error_message TEXT
) AS $$
DECLARE
  v_validation_result RECORD;
  v_current_stock DECIMAL;
  v_new_stock DECIMAL;
BEGIN
  -- Validate stock deduction
  SELECT * INTO v_validation_result
  FROM public.validate_stock_deduction(p_ingredient_id, p_quantity, p_user_id);
  
  IF NOT v_validation_result.is_valid THEN
    -- Validation failed
    RETURN QUERY SELECT false, v_validation_result.available_stock, v_validation_result.error_message;
    RETURN;
  END IF;
  
  -- Get current stock
  SELECT current_stock INTO v_current_stock
  FROM public.ingredients
  WHERE id = p_ingredient_id AND user_id = p_user_id;
  
  -- Calculate new stock
  v_new_stock := v_current_stock - p_quantity;
  
  -- Update stock
  UPDATE public.ingredients
  SET 
    current_stock = v_new_stock,
    updated_at = NOW()
  WHERE id = p_ingredient_id AND user_id = p_user_id;
  
  -- Log the change
  INSERT INTO public.inventory_stock_logs (
    ingredient_id,
    change_type,
    quantity_before,
    quantity_changed,
    quantity_after,
    reason,
    reference_type,
    reference_id,
    triggered_by,
    metadata
  ) VALUES (
    p_ingredient_id,
    'DEDUCTION',
    v_current_stock,
    -p_quantity,
    v_new_stock,
    'Stock deducted via safe function',
    p_reference_type,
    p_reference_id,
    p_user_id,
    jsonb_build_object('validation_passed', true)
  );
  
  -- Return success
  RETURN QUERY SELECT true, v_new_stock, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to initialize default settings for new users
CREATE OR REPLACE FUNCTION public.initialize_user_stock_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stock_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create settings for new users
DROP TRIGGER IF EXISTS trigger_initialize_stock_settings ON auth.users;
CREATE TRIGGER trigger_initialize_stock_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_stock_settings();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.validate_stock_deduction(UUID, DECIMAL, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_ingredient_stock_safe(UUID, DECIMAL, UUID, VARCHAR, UUID) TO authenticated;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_stock_settings_user_id 
  ON public.user_stock_settings(user_id);

COMMENT ON TABLE public.user_stock_settings IS 'User preferences for stock management including strict mode';
COMMENT ON FUNCTION public.validate_stock_deduction(UUID, DECIMAL, UUID) IS 'Validate stock deduction based on user settings (strict mode)';
COMMENT ON FUNCTION public.deduct_ingredient_stock_safe(UUID, DECIMAL, UUID, VARCHAR, UUID) IS 'Safe stock deduction with validation and logging';

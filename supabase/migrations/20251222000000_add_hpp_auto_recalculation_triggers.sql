-- ============================================================================
-- HPP AUTO-RECALCULATION TRIGGERS
-- ============================================================================
-- Automatically recalculate HPP when ingredient WAC or operational costs change
-- This ensures recipe costs are always up-to-date
-- ============================================================================

-- Function to mark recipes for HPP recalculation when ingredient WAC changes
CREATE OR REPLACE FUNCTION public.trigger_hpp_recalc_on_ingredient_wac_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if WAC actually changed
  IF (OLD.weighted_average_cost IS DISTINCT FROM NEW.weighted_average_cost) THEN
    -- Insert notification for affected recipes
    INSERT INTO public.hpp_recalculation_queue (
      user_id,
      recipe_id,
      trigger_reason,
      trigger_details,
      created_at
    )
    SELECT DISTINCT
      ri.recipe_id AS recipe_id,
      NEW.user_id,
      'ingredient_wac_change' AS trigger_reason,
      jsonb_build_object(
        'ingredient_id', NEW.id,
        'ingredient_name', NEW.name,
        'old_wac', OLD.weighted_average_cost,
        'new_wac', NEW.weighted_average_cost
      ) AS trigger_details,
      NOW() AS created_at
    FROM public.recipe_ingredients ri
    WHERE ri.ingredient_id = NEW.id;
    
    -- Log the trigger
    RAISE NOTICE 'HPP recalculation triggered for ingredient % (WAC: % -> %)', 
      NEW.name, OLD.weighted_average_cost, NEW.weighted_average_cost;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all recipes for HPP recalculation when operational costs change
CREATE OR REPLACE FUNCTION public.trigger_hpp_recalc_on_operational_cost_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if amount or frequency changed
  IF (OLD.amount IS DISTINCT FROM NEW.amount) OR 
     (OLD.frequency IS DISTINCT FROM NEW.frequency) OR
     (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    
    -- Insert notification for all active recipes of this user
    INSERT INTO public.hpp_recalculation_queue (
      user_id,
      recipe_id,
      trigger_reason,
      trigger_details,
      created_at
    )
    SELECT DISTINCT
      r.id AS recipe_id,
      NEW.user_id,
      'operational_cost_change' AS trigger_reason,
      jsonb_build_object(
        'cost_id', NEW.id,
        'category', NEW.category,
        'old_amount', OLD.amount,
        'new_amount', NEW.amount,
        'old_frequency', OLD.frequency,
        'new_frequency', NEW.frequency
      ) AS trigger_details,
      NOW() AS created_at
    FROM public.recipes r
    WHERE r.user_id = NEW.user_id
      AND r.is_active = true;
    
    -- Log the trigger
    RAISE NOTICE 'HPP recalculation triggered for all recipes due to operational cost change: %', NEW.category;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create HPP recalculation queue table
CREATE TABLE IF NOT EXISTS public.hpp_recalculation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  trigger_reason VARCHAR(50) NOT NULL,
  trigger_details JSONB,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(recipe_id, trigger_reason, created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hpp_recalc_queue_user_status 
  ON public.hpp_recalculation_queue(user_id, status);
CREATE INDEX IF NOT EXISTS idx_hpp_recalc_queue_recipe_status 
  ON public.hpp_recalculation_queue(recipe_id, status);
CREATE INDEX IF NOT EXISTS idx_hpp_recalc_queue_created_at 
  ON public.hpp_recalculation_queue(created_at);

-- Enable RLS
ALTER TABLE public.hpp_recalculation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own HPP recalculation queue"
  ON public.hpp_recalculation_queue
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own HPP recalculation queue"
  ON public.hpp_recalculation_queue
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own HPP recalculation queue"
  ON public.hpp_recalculation_queue
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create triggers
DROP TRIGGER IF EXISTS trigger_hpp_recalc_on_ingredient_update ON public.ingredients;
CREATE TRIGGER trigger_hpp_recalc_on_ingredient_update
  AFTER UPDATE ON public.ingredients
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_hpp_recalc_on_ingredient_wac_change();

DROP TRIGGER IF EXISTS trigger_hpp_recalc_on_operational_cost_update ON public.operational_costs;
CREATE TRIGGER trigger_hpp_recalc_on_operational_cost_update
  AFTER UPDATE ON public.operational_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_hpp_recalc_on_operational_cost_change();

-- Function to process HPP recalculation queue (to be called by background job or API)
CREATE OR REPLACE FUNCTION public.process_hpp_recalculation_queue(
  p_user_id UUID,
  p_batch_size INTEGER DEFAULT 10
)
RETURNS TABLE (
  processed_count INTEGER,
  failed_count INTEGER,
  pending_count INTEGER
) AS $$
DECLARE
  v_processed INTEGER := 0;
  v_failed INTEGER := 0;
  v_pending INTEGER;
BEGIN
  -- Get pending count
  SELECT COUNT(*) INTO v_pending
  FROM public.hpp_recalculation_queue
  WHERE user_id = p_user_id AND status = 'pending';
  
  -- Mark items as processing (limit to batch size)
  UPDATE public.hpp_recalculation_queue
  SET status = 'processing'
  WHERE id IN (
    SELECT id FROM public.hpp_recalculation_queue
    WHERE user_id = p_user_id AND status = 'pending'
    ORDER BY created_at ASC
    LIMIT p_batch_size
  );
  
  -- Note: Actual HPP recalculation should be done via API/service
  -- This function just marks items for processing
  
  RETURN QUERY SELECT v_processed, v_failed, v_pending;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.process_hpp_recalculation_queue(UUID, INTEGER) TO authenticated;

COMMENT ON TABLE public.hpp_recalculation_queue IS 'Queue for automatic HPP recalculation when ingredient costs or operational costs change';
COMMENT ON FUNCTION public.trigger_hpp_recalc_on_ingredient_wac_change() IS 'Trigger HPP recalculation when ingredient WAC changes';
COMMENT ON FUNCTION public.trigger_hpp_recalc_on_operational_cost_change() IS 'Trigger HPP recalculation when operational costs change';

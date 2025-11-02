-- Migration: Add Stock Reservation System and Production Batch Link
-- Date: 2024-10-31
-- Description: Critical improvements for order-production-inventory flow

-- 1. Add reserved_stock to ingredients table
ALTER TABLE ingredients 
ADD COLUMN IF NOT EXISTS reserved_stock NUMERIC DEFAULT 0 CHECK (reserved_stock >= 0),
ADD COLUMN IF NOT EXISTS available_stock NUMERIC GENERATED ALWAYS AS (current_stock - reserved_stock) STORED;

-- Add helpful comment
COMMENT ON COLUMN ingredients.reserved_stock IS 'Stock reserved for pending/confirmed orders';
COMMENT ON COLUMN ingredients.available_stock IS 'Stock available to promise (current - reserved)';

-- 2. Add production_batch_id to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS production_batch_id UUID REFERENCES productions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS production_priority TEXT DEFAULT 'NORMAL' CHECK (production_priority IN ('URGENT', 'NORMAL', 'LOW')),
ADD COLUMN IF NOT EXISTS estimated_production_time INTEGER; -- in minutes

COMMENT ON COLUMN orders.production_batch_id IS 'Link to production batch for this order';
COMMENT ON COLUMN orders.production_priority IS 'Production priority: URGENT, NORMAL, LOW';
COMMENT ON COLUMN orders.estimated_production_time IS 'Estimated production time in minutes';

-- 3. Add hpp_at_order and profit tracking to order_items table
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS hpp_at_order NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS profit_amount NUMERIC GENERATED ALWAYS AS (total_price - (hpp_at_order * quantity)) STORED,
ADD COLUMN IF NOT EXISTS profit_margin NUMERIC GENERATED ALWAYS AS (
  CASE 
    WHEN total_price > 0 THEN ((total_price - (hpp_at_order * quantity)) / total_price * 100)
    ELSE 0 
  END
) STORED;

COMMENT ON COLUMN order_items.hpp_at_order IS 'HPP (cost) per unit at time of order creation';
COMMENT ON COLUMN order_items.profit_amount IS 'Calculated profit for this item';
COMMENT ON COLUMN order_items.profit_margin IS 'Profit margin percentage for this item';

-- 4. Create stock_reservations table for detailed tracking
CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reserved_quantity NUMERIC NOT NULL CHECK (reserved_quantity > 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CONSUMED', 'RELEASED', 'EXPIRED')),
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consumed_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_active_reservation UNIQUE NULLS NOT DISTINCT (ingredient_id, order_id, status)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_reservations_ingredient ON stock_reservations(ingredient_id) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_stock_reservations_order ON stock_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_status ON stock_reservations(status);
CREATE INDEX IF NOT EXISTS idx_orders_production_batch ON orders(production_batch_id) WHERE production_batch_id IS NOT NULL;

-- Enable RLS
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stock_reservations
CREATE POLICY "Users can view their own reservations"
  ON stock_reservations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reservations"
  ON stock_reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reservations"
  ON stock_reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Create function to auto-update reserved_stock
CREATE OR REPLACE FUNCTION update_ingredient_reserved_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reserved_stock based on active reservations
  UPDATE ingredients
  SET reserved_stock = (
    SELECT COALESCE(SUM(reserved_quantity), 0)
    FROM stock_reservations
    WHERE ingredient_id = NEW.ingredient_id
      AND status = 'ACTIVE'
  )
  WHERE id = NEW.ingredient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update reserved_stock when reservations change
DROP TRIGGER IF EXISTS trigger_update_reserved_stock ON stock_reservations;
CREATE TRIGGER trigger_update_reserved_stock
  AFTER INSERT OR UPDATE OR DELETE ON stock_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_ingredient_reserved_stock();

-- 6. Add production_batch fields for better tracking
ALTER TABLE productions
ADD COLUMN IF NOT EXISTS batch_status TEXT DEFAULT 'PLANNED' CHECK (batch_status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_material_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_overhead_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS actual_total_cost NUMERIC GENERATED ALWAYS AS (actual_material_cost + actual_labor_cost + actual_overhead_cost) STORED,
ADD COLUMN IF NOT EXISTS planned_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_time TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN productions.batch_status IS 'Production batch status';
COMMENT ON COLUMN productions.total_orders IS 'Number of orders in this batch';
COMMENT ON COLUMN productions.actual_material_cost IS 'Actual material cost after production';
COMMENT ON COLUMN productions.actual_labor_cost IS 'Actual labor cost';
COMMENT ON COLUMN productions.actual_overhead_cost IS 'Actual overhead cost';

-- 7. Create helper view for available inventory
CREATE OR REPLACE VIEW inventory_availability AS
SELECT 
  i.id,
  i.name,
  i.current_stock,
  i.reserved_stock,
  i.available_stock,
  i.min_stock,
  i.reorder_point,
  i.unit,
  CASE 
    WHEN i.available_stock <= 0 THEN 'OUT_OF_STOCK'
    WHEN i.available_stock <= i.reorder_point THEN 'LOW_STOCK'
    WHEN i.available_stock <= i.min_stock THEN 'BELOW_MIN'
    ELSE 'AVAILABLE'
  END as availability_status,
  i.user_id
FROM ingredients i;

COMMENT ON VIEW inventory_availability IS 'Real-time inventory availability considering reservations';

-- Grant permissions
GRANT SELECT ON inventory_availability TO authenticated;

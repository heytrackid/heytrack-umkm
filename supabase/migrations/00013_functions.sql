-- ============================================================================
-- HeyTrack Database Schema - Part 13: Functions
-- ============================================================================

-- Calculate Ingredient WAC (Weighted Average Cost)
CREATE OR REPLACE FUNCTION calculate_ingredient_wac(p_ingredient_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_cost NUMERIC;
  v_total_quantity NUMERIC;
  v_wac NUMERIC;
BEGIN
  SELECT 
    SUM(total_price),
    SUM(quantity)
  INTO v_total_cost, v_total_quantity
  FROM ingredient_purchases
  WHERE ingredient_id = p_ingredient_id
    AND created_at >= NOW() - INTERVAL '90 days';
  
  IF v_total_quantity > 0 THEN
    v_wac := v_total_cost / v_total_quantity;
  ELSE
    SELECT price_per_unit INTO v_wac
    FROM ingredients
    WHERE id = p_ingredient_id;
  END IF;
  
  RETURN COALESCE(v_wac, 0);
END;
$$ LANGUAGE plpgsql;

-- Calculate Recipe HPP
CREATE OR REPLACE FUNCTION calculate_recipe_hpp(recipe_uuid UUID)
RETURNS TABLE(
  total_ingredient_cost NUMERIC,
  cost_per_serving NUMERIC,
  can_produce BOOLEAN,
  max_possible_batches NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(ri.quantity * i.weighted_average_cost) AS total_ingredient_cost,
    SUM(ri.quantity * i.weighted_average_cost) / NULLIF(r.servings, 0) AS cost_per_serving,
    BOOL_AND(i.available_stock >= ri.quantity) AS can_produce,
    MIN(FLOOR(i.available_stock / NULLIF(ri.quantity, 0))) AS max_possible_batches
  FROM recipes r
  JOIN recipe_ingredients ri ON r.id = ri.recipe_id
  JOIN ingredients i ON ri.ingredient_id = i.id
  WHERE r.id = recipe_uuid
  GROUP BY r.id, r.servings;
END;
$$ LANGUAGE plpgsql;

-- Increment Ingredient Stock
CREATE OR REPLACE FUNCTION increment_ingredient_stock(
  p_ingredient_id UUID,
  p_quantity NUMERIC
)
RETURNS TABLE(
  id UUID,
  current_stock NUMERIC,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  UPDATE ingredients
  SET 
    current_stock = current_stock + p_quantity,
    available_stock = available_stock + p_quantity,
    updated_at = NOW()
  WHERE ingredients.id = p_ingredient_id
  RETURNING ingredients.id, ingredients.current_stock, ingredients.updated_at
  INTO id, current_stock, updated_at;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Decrement Ingredient Stock
CREATE OR REPLACE FUNCTION decrement_ingredient_stock(
  p_ingredient_id UUID,
  p_quantity NUMERIC
)
RETURNS TABLE(
  id UUID,
  current_stock NUMERIC,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  UPDATE ingredients
  SET 
    current_stock = GREATEST(0, current_stock - p_quantity),
    available_stock = GREATEST(0, available_stock - p_quantity),
    updated_at = NOW()
  WHERE ingredients.id = p_ingredient_id
  RETURNING ingredients.id, ingredients.current_stock, ingredients.updated_at
  INTO id, current_stock, updated_at;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Get Dashboard Stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
  v_user_id TEXT;
BEGIN
  v_user_id := public.get_user_id();
  
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total_amount ELSE 0 END), 0),
    'total_orders', COUNT(o.id),
    'pending_orders', COUNT(CASE WHEN o.status = 'PENDING' THEN 1 END),
    'total_customers', (SELECT COUNT(*) FROM customers WHERE user_id = v_user_id),
    'low_stock_items', (SELECT COUNT(*) FROM ingredients WHERE user_id = v_user_id AND current_stock <= COALESCE(reorder_point, min_stock, 0)),
    'active_recipes', (SELECT COUNT(*) FROM recipes WHERE user_id = v_user_id AND is_active = true)
  )
  INTO v_stats
  FROM orders o
  WHERE o.user_id = v_user_id
    AND o.created_at >= NOW() - INTERVAL '30 days';
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get Unread Alert Count
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND is_read = false
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Create Default WhatsApp Templates
CREATE OR REPLACE FUNCTION create_default_whatsapp_templates(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO whatsapp_templates (user_id, name, category, template_content, is_default)
  VALUES
    (p_user_id, 'Order Confirmation', 'order', 'Halo {{customer_name}}, pesanan Anda #{{order_no}} telah dikonfirmasi. Total: Rp {{total_amount}}. Terima kasih!', true),
    (p_user_id, 'Order Ready', 'order', 'Halo {{customer_name}}, pesanan Anda #{{order_no}} sudah siap untuk diambil/dikirim. Terima kasih!', true),
    (p_user_id, 'Payment Reminder', 'payment', 'Halo {{customer_name}}, ini pengingat pembayaran untuk pesanan #{{order_no}} sebesar Rp {{total_amount}}. Terima kasih!', true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Clean Old Logs
CREATE OR REPLACE FUNCTION clean_old_logs()
RETURNS VOID AS $$
BEGIN
  DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM performance_logs WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM inventory_stock_logs WHERE created_at < NOW() - INTERVAL '180 days';
END;
$$ LANGUAGE plpgsql;

-- Cleanup Expired Context Cache
CREATE OR REPLACE FUNCTION cleanup_expired_context_cache()
RETURNS VOID AS $$
BEGIN
  DELETE FROM chat_context_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Get User Role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid TEXT DEFAULT NULL)
RETURNS user_role AS $$
DECLARE
  v_role user_role;
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE user_id = COALESCE(user_uuid, public.get_user_id());
  
  RETURN COALESCE(v_role, 'viewer'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Has Permission
CREATE OR REPLACE FUNCTION user_has_permission(
  permission_name TEXT,
  user_uuid TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
BEGIN
  SELECT permission_name = ANY(permissions)
  INTO v_has_permission
  FROM user_profiles
  WHERE user_id = COALESCE(user_uuid, public.get_user_id());
  
  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User Has Business Unit Access
CREATE OR REPLACE FUNCTION user_has_business_unit_access(
  business_unit_val business_unit,
  user_uuid TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_unit business_unit;
BEGIN
  SELECT business_unit INTO v_user_unit
  FROM user_profiles
  WHERE user_id = COALESCE(user_uuid, public.get_user_id());
  
  RETURN v_user_unit = 'all' OR v_user_unit = business_unit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

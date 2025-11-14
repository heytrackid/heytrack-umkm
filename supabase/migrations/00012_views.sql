-- ============================================================================
-- HeyTrack Database Schema - Part 12: Views
-- ============================================================================

-- Inventory Status View
CREATE OR REPLACE VIEW inventory_status AS
SELECT 
  i.id,
  i.name,
  i.category,
  i.unit,
  i.current_stock,
  i.min_stock,
  i.max_stock,
  i.reorder_point,
  i.price_per_unit,
  i.cost_per_batch,
  i.supplier,
  i.supplier_contact,
  i.description,
  i.lead_time,
  i.usage_rate,
  i.last_ordered_at,
  i.created_at,
  i.updated_at,
  CASE 
    WHEN i.current_stock <= 0 THEN 'OUT_OF_STOCK'
    WHEN i.current_stock <= COALESCE(i.reorder_point, i.min_stock, 0) THEN 'LOW_STOCK'
    WHEN i.current_stock >= COALESCE(i.max_stock, 999999) THEN 'OVERSTOCK'
    ELSE 'NORMAL'
  END AS stock_status,
  CASE 
    WHEN i.current_stock <= 0 THEN 'critical'
    WHEN i.current_stock <= COALESCE(i.reorder_point, i.min_stock, 0) THEN 'warning'
    WHEN i.current_stock >= COALESCE(i.max_stock, 999999) THEN 'info'
    ELSE 'normal'
  END AS alert_level,
  ROUND((i.current_stock::NUMERIC / NULLIF(COALESCE(i.max_stock, i.current_stock + 1), 0)) * 100, 2) AS stock_percentage,
  CASE 
    WHEN i.usage_rate > 0 THEN ROUND(i.current_stock / NULLIF(i.usage_rate, 0), 0)
    ELSE NULL
  END AS days_remaining
FROM ingredients i;

-- Inventory Availability View
CREATE OR REPLACE VIEW inventory_availability AS
SELECT 
  i.id,
  i.user_id,
  i.name,
  i.unit,
  i.current_stock,
  i.reserved_stock,
  i.available_stock,
  i.min_stock,
  i.reorder_point,
  CASE 
    WHEN i.available_stock <= 0 THEN 'UNAVAILABLE'
    WHEN i.available_stock <= COALESCE(i.reorder_point, i.min_stock, 0) THEN 'LOW'
    ELSE 'AVAILABLE'
  END AS availability_status
FROM ingredients i;

-- Recipe Availability View
CREATE OR REPLACE VIEW recipe_availability AS
SELECT 
  r.id,
  r.name,
  r.category,
  r.cost_per_unit,
  r.selling_price,
  r.is_active,
  CASE 
    WHEN COUNT(ri.id) = 0 THEN true
    WHEN COUNT(ri.id) = COUNT(CASE WHEN i.available_stock >= ri.quantity THEN 1 END) THEN true
    ELSE false
  END AS is_available,
  CASE 
    WHEN COUNT(ri.id) = 0 THEN NULL
    ELSE MIN(FLOOR(i.available_stock / NULLIF(ri.quantity, 0)))
  END AS max_possible_quantity,
  COALESCE(
    json_agg(
      json_build_object(
        'ingredient_id', i.id,
        'ingredient_name', i.name,
        'required', ri.quantity,
        'available', i.available_stock,
        'unit', ri.unit
      )
    ) FILTER (WHERE i.available_stock < ri.quantity),
    '[]'::json
  ) AS missing_ingredients
FROM recipes r
LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
LEFT JOIN ingredients i ON ri.ingredient_id = i.id
GROUP BY r.id, r.name, r.category, r.cost_per_unit, r.selling_price, r.is_active;

-- Order Summary View
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.id,
  o.order_no,
  o.user_id,
  o.customer_id,
  o.customer_name,
  o.customer_phone,
  o.customer_address,
  c.name AS customer_full_name,
  c.phone AS customer_phone_verified,
  c.customer_type,
  c.total_orders AS customer_order_count,
  o.order_date,
  o.delivery_date,
  o.delivery_time,
  o.delivery_fee,
  o.status,
  o.payment_status,
  o.payment_method,
  o.paid_amount,
  o.total_amount,
  o.discount,
  o.tax_amount,
  o.notes,
  o.special_instructions,
  o.priority,
  o.created_at,
  o.updated_at,
  COUNT(oi.id) AS total_items,
  COALESCE(
    json_agg(
      json_build_object(
        'id', oi.id,
        'recipe_id', oi.recipe_id,
        'product_name', oi.product_name,
        'quantity', oi.quantity,
        'unit_price', oi.unit_price,
        'total_price', oi.total_price
      )
    ) FILTER (WHERE oi.id IS NOT NULL),
    '[]'::json
  ) AS items_detail
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY 
  o.id, o.order_no, o.user_id, o.customer_id, o.customer_name, o.customer_phone, 
  o.customer_address, c.name, c.phone, c.customer_type, c.total_orders,
  o.order_date, o.delivery_date, o.delivery_time, o.delivery_fee, o.status,
  o.payment_status, o.payment_method, o.paid_amount, o.total_amount, o.discount,
  o.tax_amount, o.notes, o.special_instructions, o.priority, o.created_at, o.updated_at;

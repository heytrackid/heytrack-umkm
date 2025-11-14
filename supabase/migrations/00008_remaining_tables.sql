-- ============================================================================
-- HeyTrack Database Schema - Part 8: Remaining Tables
-- ============================================================================

-- Stock Reservations
CREATE TABLE stock_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  production_id UUID REFERENCES productions(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  consumed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'ACTIVE',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Alerts
CREATE TABLE inventory_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT,
  message TEXT NOT NULL,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Reorder Rules
CREATE TABLE inventory_reorder_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL UNIQUE REFERENCES ingredients(id) ON DELETE CASCADE,
  reorder_point NUMERIC DEFAULT 0,
  reorder_quantity NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory Stock Logs
CREATE TABLE inventory_stock_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  quantity_before NUMERIC NOT NULL,
  quantity_changed NUMERIC NOT NULL,
  quantity_after NUMERIC NOT NULL,
  reason TEXT,
  reference_type TEXT,
  reference_id TEXT,
  triggered_by TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  payment_terms TEXT,
  lead_time_days INTEGER,
  minimum_order NUMERIC,
  delivery_fee NUMERIC,
  rating NUMERIC,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date DATE,
  notes TEXT,
  metadata JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier Ingredients
CREATE TABLE supplier_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  supplier_price NUMERIC NOT NULL,
  package_size NUMERIC,
  package_unit TEXT,
  minimum_quantity NUMERIC,
  is_preferred BOOLEAN DEFAULT false,
  last_price_update DATE
);

-- Usage Analytics
CREATE TABLE usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  quantity_used NUMERIC NOT NULL,
  quantity_purchased NUMERIC,
  quantity_wasted NUMERIC,
  running_average NUMERIC,
  prediction_next_7_days NUMERIC,
  trend TEXT,
  cost_impact NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Templates
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  template_content TEXT NOT NULL,
  description TEXT,
  variables JSONB,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Sales Summary
CREATE TABLE daily_sales_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sales_date DATE NOT NULL,
  total_revenue NUMERIC,
  total_orders INTEGER,
  total_items_sold INTEGER,
  average_order_value NUMERIC,
  expenses_total NUMERIC,
  profit_estimate NUMERIC,
  new_customers INTEGER,
  top_selling_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error Logs
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  endpoint TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  request_data JSONB,
  severity TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Logs
CREATE TABLE performance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status INTEGER NOT NULL,
  duration_ms NUMERIC NOT NULL,
  request_body JSONB,
  response_body JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

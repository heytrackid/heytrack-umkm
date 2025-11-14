-- ============================================================================
-- HeyTrack Database Schema - Part 3: Inventory Tables
-- ============================================================================

-- Ingredients
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  unit TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL DEFAULT 0,
  weighted_average_cost NUMERIC NOT NULL DEFAULT 0,
  current_stock NUMERIC DEFAULT 0,
  available_stock NUMERIC DEFAULT 0,
  reserved_stock NUMERIC DEFAULT 0,
  min_stock NUMERIC,
  max_stock NUMERIC,
  reorder_point NUMERIC,
  supplier TEXT,
  supplier_contact TEXT,
  description TEXT,
  expiry_date DATE,
  last_purchase_date DATE,
  last_ordered_at TIMESTAMPTZ,
  lead_time INTEGER,
  lead_time_days INTEGER,
  usage_rate NUMERIC,
  cost_per_batch NUMERIC,
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Ingredient Purchases
CREATE TABLE ingredient_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  purchase_date DATE DEFAULT CURRENT_DATE,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  cost_per_unit NUMERIC,
  supplier TEXT,
  notes TEXT,
  expense_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock Transactions
CREATE TABLE stock_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC,
  total_price NUMERIC,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

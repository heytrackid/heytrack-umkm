-- ============================================================================
-- HeyTrack Database Schema - Part 6: Production & Financial Tables
-- ============================================================================

-- Productions
CREATE TABLE productions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL,
  cost_per_unit NUMERIC NOT NULL,
  labor_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC NOT NULL,
  status production_status DEFAULT 'PLANNED',
  batch_status TEXT,
  total_orders INTEGER,
  planned_start_time TIMESTAMPTZ,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  actual_quantity NUMERIC,
  actual_material_cost NUMERIC,
  actual_labor_cost NUMERIC,
  actual_overhead_cost NUMERIC,
  actual_total_cost NUMERIC,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Production Batches
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  batch_number TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  planned_date DATE NOT NULL,
  status TEXT DEFAULT 'PLANNED',
  actual_cost NUMERIC,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Production Schedules
CREATE TABLE production_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  planned_quantity NUMERIC NOT NULL,
  actual_quantity NUMERIC,
  status TEXT DEFAULT 'SCHEDULED',
  priority INTEGER,
  assigned_staff TEXT,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  cost_estimate NUMERIC,
  profit_estimate NUMERIC,
  resource_requirements JSONB,
  dependencies JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Records
CREATE TABLE financial_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  type record_type NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Operational Costs
CREATE TABLE operational_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  recurring BOOLEAN DEFAULT false,
  frequency TEXT,
  is_active BOOLEAN DEFAULT true,
  supplier TEXT,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

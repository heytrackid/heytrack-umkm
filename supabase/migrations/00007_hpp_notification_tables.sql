-- ============================================================================
-- HeyTrack Database Schema - Part 7: HPP & Notification Tables
-- ============================================================================

-- HPP Calculations
CREATE TABLE hpp_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  calculation_date DATE DEFAULT CURRENT_DATE,
  material_cost NUMERIC DEFAULT 0,
  labor_cost NUMERIC DEFAULT 0,
  overhead_cost NUMERIC DEFAULT 0,
  total_hpp NUMERIC DEFAULT 0,
  cost_per_unit NUMERIC DEFAULT 0,
  production_quantity NUMERIC,
  wac_adjustment NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HPP History
CREATE TABLE hpp_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  hpp_value NUMERIC NOT NULL,
  ingredient_cost NUMERIC NOT NULL,
  operational_cost NUMERIC NOT NULL,
  change_percentage NUMERIC,
  change_reason TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HPP Alerts
CREATE TABLE hpp_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  old_value NUMERIC,
  new_value NUMERIC,
  change_percentage NUMERIC,
  threshold NUMERIC,
  affected_components JSONB,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HPP Recommendations
CREATE TABLE hpp_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_savings NUMERIC,
  priority TEXT,
  is_implemented BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT,
  entity_type TEXT,
  entity_id TEXT,
  action_url TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  sound_volume NUMERIC DEFAULT 0.5,
  sound_for_urgent_only BOOLEAN DEFAULT false,
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  group_similar_enabled BOOLEAN DEFAULT true,
  group_time_window INTEGER DEFAULT 300,
  email_digest BOOLEAN DEFAULT false,
  email_digest_frequency TEXT DEFAULT 'daily',
  min_priority TEXT DEFAULT 'low',
  orders_enabled BOOLEAN DEFAULT true,
  inventory_enabled BOOLEAN DEFAULT true,
  production_enabled BOOLEAN DEFAULT true,
  finance_enabled BOOLEAN DEFAULT true,
  system_enabled BOOLEAN DEFAULT true,
  info_enabled BOOLEAN DEFAULT true,
  success_enabled BOOLEAN DEFAULT true,
  warning_enabled BOOLEAN DEFAULT true,
  error_enabled BOOLEAN DEFAULT true,
  alert_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

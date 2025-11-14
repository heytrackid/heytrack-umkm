-- ============================================================================
-- HeyTrack Complete Database Migration
-- ============================================================================
-- This file contains all migrations combined into one
-- Compatible with Stack Auth JWT authentication
-- Generated: $(date)
-- ============================================================================


-- ============================================================================
-- Source: 00000_clean_database.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 0: Clean Database
-- ============================================================================
-- Run this FIRST if you want to start fresh
-- WARNING: This will delete ALL data!

-- Drop all existing tables
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS chat_context_cache CASCADE;
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS conversation_sessions CASCADE;
DROP TABLE IF EXISTS whatsapp_templates CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS hpp_recommendations CASCADE;
DROP TABLE IF EXISTS hpp_alerts CASCADE;
DROP TABLE IF EXISTS hpp_history CASCADE;
DROP TABLE IF EXISTS hpp_calculations CASCADE;
DROP TABLE IF EXISTS operational_costs CASCADE;
DROP TABLE IF EXISTS financial_records CASCADE;
DROP TABLE IF EXISTS production_schedules CASCADE;
DROP TABLE IF EXISTS production_batches CASCADE;
DROP TABLE IF EXISTS productions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS usage_analytics CASCADE;
DROP TABLE IF EXISTS supplier_ingredients CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS inventory_stock_logs CASCADE;
DROP TABLE IF EXISTS inventory_reorder_rules CASCADE;
DROP TABLE IF EXISTS inventory_alerts CASCADE;
DROP TABLE IF EXISTS stock_reservations CASCADE;
DROP TABLE IF EXISTS stock_transactions CASCADE;
DROP TABLE IF EXISTS ingredient_purchases CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS user_onboarding CASCADE;
DROP TABLE IF EXISTS app_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS daily_sales_summary CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS performance_logs CASCADE;

-- Drop views
DROP VIEW IF EXISTS recipe_availability CASCADE;
DROP VIEW IF EXISTS order_summary CASCADE;
DROP VIEW IF EXISTS inventory_availability CASCADE;
DROP VIEW IF EXISTS inventory_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_user_id() CASCADE;
DROP FUNCTION IF EXISTS public.auth_user_id() CASCADE;
DROP FUNCTION IF EXISTS calculate_ingredient_wac(UUID) CASCADE;
DROP FUNCTION IF EXISTS calculate_recipe_hpp(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_ingredient_stock(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS decrement_ingredient_stock(UUID, NUMERIC) CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS get_unread_alert_count(TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_default_whatsapp_templates(TEXT) CASCADE;
DROP FUNCTION IF EXISTS clean_old_logs() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_context_cache() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(TEXT) CASCADE;
DROP FUNCTION IF EXISTS user_has_permission(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS user_has_business_unit_access(business_unit, TEXT) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS log_stock_change() CASCADE;
DROP FUNCTION IF EXISTS update_ingredient_wac_on_purchase() CASCADE;
DROP FUNCTION IF EXISTS update_customer_stats_on_order() CASCADE;
DROP FUNCTION IF EXISTS update_recipe_stats_on_production() CASCADE;

-- Drop enums
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS business_unit CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS production_status CASCADE;
DROP TYPE IF EXISTS record_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ Database cleaned successfully!';
  RAISE NOTICE 'You can now run the migration files.';
END $$;


-- ============================================================================
-- Source: 00000000000000_initial_schema.sql
-- ============================================================================



-- ============================================================================
-- Source: 00001_enums_and_extensions.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 1: Enums and Extensions
-- ============================================================================
-- Compatible with Stack Auth JWT authentication

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS business_unit CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS production_status CASCADE;
DROP TYPE IF EXISTS record_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;

-- Create enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'viewer');
CREATE TYPE business_unit AS ENUM ('kitchen', 'sales', 'inventory', 'finance', 'all');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER');
CREATE TYPE production_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE record_type AS ENUM ('INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL');
CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE');


-- ============================================================================
-- Source: 00002_core_tables.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 2: Core Tables
-- ============================================================================

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'staff',
  business_unit business_unit DEFAULT 'all',
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App Settings
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  settings_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Onboarding
CREATE TABLE user_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  completed BOOLEAN DEFAULT false,
  current_step INTEGER DEFAULT 0,
  steps_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- Source: 00003_inventory_tables.sql
-- ============================================================================

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


-- ============================================================================
-- Source: 00004_recipe_tables.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 4: Recipe Tables
-- ============================================================================

-- Recipes
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  instructions TEXT,
  servings INTEGER,
  batch_size NUMERIC,
  prep_time INTEGER,
  cook_time INTEGER,
  difficulty TEXT,
  rating NUMERIC,
  image_url TEXT,
  cost_per_unit NUMERIC,
  previous_cost NUMERIC,
  selling_price NUMERIC,
  margin_percentage NUMERIC,
  times_made INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  last_made_at TIMESTAMPTZ,
  seasonal BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Recipe Ingredients
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL
);


-- ============================================================================
-- Source: 00005_order_tables.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 5: Order & Customer Tables
-- ============================================================================

-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  customer_type TEXT,
  discount_percentage NUMERIC,
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  last_order_date DATE,
  favorite_items JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  order_no TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  delivery_time TEXT,
  delivery_fee NUMERIC DEFAULT 0,
  status order_status DEFAULT 'PENDING',
  payment_status TEXT,
  payment_method TEXT,
  paid_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  notes TEXT,
  special_instructions TEXT,
  priority TEXT,
  production_priority TEXT,
  estimated_production_time INTEGER,
  production_batch_id UUID,
  financial_record_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE RESTRICT,
  product_name TEXT,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  hpp_at_order NUMERIC,
  profit_margin NUMERIC,
  profit_amount NUMERIC,
  special_requests TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  method payment_method NOT NULL,
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================================
-- Source: 00006_production_financial_tables.sql
-- ============================================================================

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


-- ============================================================================
-- Source: 00007_hpp_notification_tables.sql
-- ============================================================================

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


-- ============================================================================
-- Source: 00008_remaining_tables.sql
-- ============================================================================

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


-- ============================================================================
-- Source: 00009_chat_tables.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 9: AI Chat Tables
-- ============================================================================

-- Chat Sessions
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT DEFAULT 'New Chat',
  context_snapshot JSONB,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Context Cache
CREATE TABLE chat_context_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  context_type TEXT NOT NULL,
  data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Sessions
CREATE TABLE conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT,
  context_summary JSONB,
  message_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation History
CREATE TABLE conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  context JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for chat tables
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_context_cache_user_id ON chat_context_cache(user_id);
CREATE INDEX idx_chat_context_cache_expires_at ON chat_context_cache(expires_at);
CREATE INDEX idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX idx_conversation_history_session_id ON conversation_history(session_id);
CREATE INDEX idx_conversation_sessions_user_id ON conversation_sessions(user_id);


-- ============================================================================
-- Source: 00010_indexes.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 10: Indexes
-- ============================================================================

-- User Profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Ingredients
CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_current_stock ON ingredients(current_stock);

-- Recipes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipes_is_active ON recipes(is_active);

-- Recipe Ingredients
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_recipe_ingredients_user_id ON recipe_ingredients(user_id);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_order_no ON orders(order_no);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_recipe_id ON order_items(recipe_id);
CREATE INDEX idx_order_items_user_id ON order_items(user_id);

-- Customers
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Productions
CREATE INDEX idx_productions_user_id ON productions(user_id);
CREATE INDEX idx_productions_recipe_id ON productions(recipe_id);
CREATE INDEX idx_productions_status ON productions(status);

-- Production Batches
CREATE INDEX idx_production_batches_user_id ON production_batches(user_id);
CREATE INDEX idx_production_batches_recipe_id ON production_batches(recipe_id);
CREATE INDEX idx_production_batches_status ON production_batches(status);
CREATE INDEX idx_production_batches_planned_date ON production_batches(planned_date);

-- Financial Records
CREATE INDEX idx_financial_records_user_id ON financial_records(user_id);
CREATE INDEX idx_financial_records_type ON financial_records(type);
CREATE INDEX idx_financial_records_date ON financial_records(date);
CREATE INDEX idx_financial_records_category ON financial_records(category);

-- Operational Costs
CREATE INDEX idx_operational_costs_user_id ON operational_costs(user_id);
CREATE INDEX idx_operational_costs_category ON operational_costs(category);
CREATE INDEX idx_operational_costs_date ON operational_costs(date);

-- HPP Calculations
CREATE INDEX idx_hpp_calculations_user_id ON hpp_calculations(user_id);
CREATE INDEX idx_hpp_calculations_recipe_id ON hpp_calculations(recipe_id);
CREATE INDEX idx_hpp_calculations_calculation_date ON hpp_calculations(calculation_date);

-- HPP History
CREATE INDEX idx_hpp_history_user_id ON hpp_history(user_id);
CREATE INDEX idx_hpp_history_recipe_id ON hpp_history(recipe_id);
CREATE INDEX idx_hpp_history_recorded_at ON hpp_history(recorded_at);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Stock Transactions
CREATE INDEX idx_stock_transactions_user_id ON stock_transactions(user_id);
CREATE INDEX idx_stock_transactions_ingredient_id ON stock_transactions(ingredient_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);

-- Stock Reservations
CREATE INDEX idx_stock_reservations_user_id ON stock_reservations(user_id);
CREATE INDEX idx_stock_reservations_ingredient_id ON stock_reservations(ingredient_id);
CREATE INDEX idx_stock_reservations_order_id ON stock_reservations(order_id);
CREATE INDEX idx_stock_reservations_status ON stock_reservations(status);

-- Inventory Alerts
CREATE INDEX idx_inventory_alerts_user_id ON inventory_alerts(user_id);
CREATE INDEX idx_inventory_alerts_ingredient_id ON inventory_alerts(ingredient_id);
CREATE INDEX idx_inventory_alerts_is_active ON inventory_alerts(is_active);

-- Suppliers
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_is_active ON suppliers(is_active);

-- WhatsApp Templates
CREATE INDEX idx_whatsapp_templates_user_id ON whatsapp_templates(user_id);
CREATE INDEX idx_whatsapp_templates_category ON whatsapp_templates(category);
CREATE INDEX idx_whatsapp_templates_is_active ON whatsapp_templates(is_active);

-- Error Logs
CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX idx_error_logs_endpoint ON error_logs(endpoint);
CREATE INDEX idx_error_logs_is_resolved ON error_logs(is_resolved);

-- Performance Logs
CREATE INDEX idx_performance_logs_timestamp ON performance_logs(timestamp);
CREATE INDEX idx_performance_logs_endpoint ON performance_logs(endpoint);
CREATE INDEX idx_performance_logs_user_id ON performance_logs(user_id);


-- ============================================================================
-- Source: 00011_rls_policies.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 11: RLS Policies for Stack Auth JWT
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredient_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reorder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_context_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Helper function to get user_id from JWT
-- Note: Using public schema instead of auth schema due to permission restrictions
CREATE OR REPLACE FUNCTION public.get_user_id() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::TEXT;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Create alias for backward compatibility
CREATE OR REPLACE FUNCTION public.auth_user_id() RETURNS TEXT AS $$
  SELECT public.get_user_id();
$$ LANGUAGE SQL STABLE;

-- Create RLS policies for all tables
-- Pattern: Users can only access their own data

-- User Profiles
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (user_id = public.get_user_id());
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (user_id = public.get_user_id());
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (user_id = public.get_user_id());

-- App Settings
CREATE POLICY "Users can manage own settings" ON app_settings FOR ALL USING (user_id = public.get_user_id());

-- User Onboarding
CREATE POLICY "Users can manage own onboarding" ON user_onboarding FOR ALL USING (user_id = public.get_user_id());

-- Ingredients
CREATE POLICY "Users can manage own ingredients" ON ingredients FOR ALL USING (user_id = public.get_user_id());

-- Ingredient Purchases
CREATE POLICY "Users can manage own purchases" ON ingredient_purchases FOR ALL USING (user_id = public.get_user_id());

-- Stock Transactions
CREATE POLICY "Users can manage own transactions" ON stock_transactions FOR ALL USING (user_id = public.get_user_id());

-- Stock Reservations
CREATE POLICY "Users can manage own reservations" ON stock_reservations FOR ALL USING (user_id = public.get_user_id());

-- Inventory Alerts
CREATE POLICY "Users can manage own alerts" ON inventory_alerts FOR ALL USING (user_id = public.get_user_id());

-- Inventory Reorder Rules
CREATE POLICY "Users can manage own reorder rules" ON inventory_reorder_rules FOR ALL USING (user_id = public.get_user_id());

-- Suppliers
CREATE POLICY "Users can manage own suppliers" ON suppliers FOR ALL USING (user_id = public.get_user_id());

-- Supplier Ingredients
CREATE POLICY "Users can manage own supplier ingredients" ON supplier_ingredients FOR ALL USING (user_id = public.get_user_id());

-- Usage Analytics
CREATE POLICY "Users can view own analytics" ON usage_analytics FOR ALL USING (user_id = public.get_user_id());

-- Recipes
CREATE POLICY "Users can manage own recipes" ON recipes FOR ALL USING (user_id = public.get_user_id());

-- Recipe Ingredients
CREATE POLICY "Users can manage own recipe ingredients" ON recipe_ingredients FOR ALL USING (user_id = public.get_user_id());

-- Customers
CREATE POLICY "Users can manage own customers" ON customers FOR ALL USING (user_id = public.get_user_id());

-- Orders
CREATE POLICY "Users can manage own orders" ON orders FOR ALL USING (user_id = public.get_user_id());

-- Order Items
CREATE POLICY "Users can manage own order items" ON order_items FOR ALL USING (user_id = public.get_user_id());

-- Payments
CREATE POLICY "Users can manage own payments" ON payments FOR ALL USING (user_id = public.get_user_id());

-- Productions
CREATE POLICY "Users can manage own productions" ON productions FOR ALL USING (user_id = public.get_user_id());

-- Production Batches
CREATE POLICY "Users can manage own batches" ON production_batches FOR ALL USING (user_id = public.get_user_id());

-- Production Schedules
CREATE POLICY "Users can manage own schedules" ON production_schedules FOR ALL USING (user_id = public.get_user_id());

-- Financial Records
CREATE POLICY "Users can manage own financial records" ON financial_records FOR ALL USING (user_id = public.get_user_id());

-- Operational Costs
CREATE POLICY "Users can manage own operational costs" ON operational_costs FOR ALL USING (user_id = public.get_user_id());

-- HPP Calculations
CREATE POLICY "Users can manage own hpp calculations" ON hpp_calculations FOR ALL USING (user_id = public.get_user_id());

-- HPP History
CREATE POLICY "Users can view own hpp history" ON hpp_history FOR ALL USING (user_id = public.get_user_id());

-- HPP Alerts
CREATE POLICY "Users can manage own hpp alerts" ON hpp_alerts FOR ALL USING (user_id = public.get_user_id());

-- HPP Recommendations
CREATE POLICY "Users can view own recommendations" ON hpp_recommendations FOR ALL USING (user_id = public.get_user_id());

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = public.get_user_id());

-- Notification Preferences
CREATE POLICY "Users can manage own preferences" ON notification_preferences FOR ALL USING (user_id = public.get_user_id());

-- WhatsApp Templates
CREATE POLICY "Users can manage own templates" ON whatsapp_templates FOR ALL USING (user_id = public.get_user_id());

-- Chat Sessions
CREATE POLICY "Users can manage own chat sessions" ON chat_sessions FOR ALL USING (user_id = public.get_user_id());

-- Chat Context Cache
CREATE POLICY "Users can manage own chat cache" ON chat_context_cache FOR ALL USING (user_id = public.get_user_id());

-- Conversation Sessions
CREATE POLICY "Users can manage own conversations" ON conversation_sessions FOR ALL USING (user_id = public.get_user_id());

-- Conversation History
CREATE POLICY "Users can manage own conversation history" ON conversation_history FOR ALL USING (user_id = public.get_user_id());

-- Error Logs (users can view own errors, admins can view all)
CREATE POLICY "Users can view own error logs" ON error_logs FOR SELECT USING (user_id = public.get_user_id() OR user_id IS NULL);
CREATE POLICY "Users can insert error logs" ON error_logs FOR INSERT WITH CHECK (true);

-- Performance Logs (similar to error logs)
CREATE POLICY "Users can view own performance logs" ON performance_logs FOR SELECT USING (user_id = public.get_user_id() OR user_id IS NULL);
CREATE POLICY "System can insert performance logs" ON performance_logs FOR INSERT WITH CHECK (true);


-- ============================================================================
-- Source: 00012_views.sql
-- ============================================================================

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


-- ============================================================================
-- Source: 00013_functions.sql
-- ============================================================================

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


-- ============================================================================
-- Source: 00014_triggers.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 14: Triggers
-- ============================================================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredient_purchases_updated_at BEFORE UPDATE ON ingredient_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON productions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_batches_updated_at BEFORE UPDATE ON production_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_schedules_updated_at BEFORE UPDATE ON production_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operational_costs_updated_at BEFORE UPDATE ON operational_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hpp_alerts_updated_at BEFORE UPDATE ON hpp_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_reservations_updated_at BEFORE UPDATE ON stock_reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_alerts_updated_at BEFORE UPDATE ON inventory_alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_reorder_rules_updated_at BEFORE UPDATE ON inventory_reorder_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_sales_summary_updated_at BEFORE UPDATE ON daily_sales_summary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_sessions_updated_at BEFORE UPDATE ON conversation_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Stock change logging trigger
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_stock != NEW.current_stock THEN
    INSERT INTO inventory_stock_logs (
      ingredient_id,
      change_type,
      quantity_before,
      quantity_changed,
      quantity_after,
      reason,
      triggered_by
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.current_stock > OLD.current_stock THEN 'INCREASE'
        ELSE 'DECREASE'
      END,
      OLD.current_stock,
      NEW.current_stock - OLD.current_stock,
      NEW.current_stock,
      'Stock updated',
      public.get_user_id()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_ingredient_stock_change AFTER UPDATE ON ingredients
  FOR EACH ROW EXECUTE FUNCTION log_stock_change();

-- Update ingredient WAC on purchase
CREATE OR REPLACE FUNCTION update_ingredient_wac_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  v_new_wac NUMERIC;
BEGIN
  v_new_wac := calculate_ingredient_wac(NEW.ingredient_id);
  
  UPDATE ingredients
  SET 
    weighted_average_cost = v_new_wac,
    current_stock = current_stock + NEW.quantity,
    available_stock = available_stock + NEW.quantity,
    last_purchase_date = NEW.purchase_date
  WHERE id = NEW.ingredient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wac_on_purchase AFTER INSERT ON ingredient_purchases
  FOR EACH ROW EXECUTE FUNCTION update_ingredient_wac_on_purchase();

-- Update customer stats on order
CREATE OR REPLACE FUNCTION update_customer_stats_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE customers
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      last_order_date = NEW.order_date
    WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_stats AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION update_customer_stats_on_order();

-- Update recipe stats on production
CREATE OR REPLACE FUNCTION update_recipe_stats_on_production()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'COMPLETED' AND (OLD.status IS NULL OR OLD.status != 'COMPLETED') THEN
    UPDATE recipes
    SET 
      times_made = times_made + 1,
      last_made_at = NEW.completed_at
    WHERE id = NEW.recipe_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recipe_stats AFTER INSERT OR UPDATE ON productions
  FOR EACH ROW EXECUTE FUNCTION update_recipe_stats_on_production();


-- ============================================================================
-- Source: 00015_initial_data.sql
-- ============================================================================

-- ============================================================================
-- HeyTrack Database Schema - Part 15: Initial Data & Setup
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create scheduled job to clean old logs (if pg_cron is available)
-- This is optional and requires pg_cron extension
-- SELECT cron.schedule('clean-old-logs', '0 2 * * *', 'SELECT clean_old_logs()');
-- SELECT cron.schedule('cleanup-expired-cache', '*/30 * * * *', 'SELECT cleanup_expired_context_cache()');

-- Insert default notification preferences for existing users (if any)
-- This will be handled by application logic when users first log in

-- Comments for documentation
COMMENT ON TABLE user_profiles IS 'User profile information linked to Stack Auth user_id';
COMMENT ON TABLE ingredients IS 'Inventory of raw materials and ingredients';
COMMENT ON TABLE recipes IS 'Product recipes with ingredient compositions';
COMMENT ON TABLE orders IS 'Customer orders and sales transactions';
COMMENT ON TABLE productions IS 'Production batches and manufacturing records';
COMMENT ON TABLE financial_records IS 'Financial transactions (income/expense)';
COMMENT ON TABLE hpp_calculations IS 'Cost of Goods Sold (HPP) calculations';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE chat_sessions IS 'AI chat conversation sessions';

COMMENT ON FUNCTION public.get_user_id() IS 'Extract user_id from Stack Auth JWT token';
COMMENT ON FUNCTION calculate_ingredient_wac(UUID) IS 'Calculate Weighted Average Cost for ingredient';
COMMENT ON FUNCTION calculate_recipe_hpp(UUID) IS 'Calculate HPP (Cost of Goods Sold) for recipe';
COMMENT ON FUNCTION get_dashboard_stats() IS 'Get aggregated dashboard statistics';

-- Create indexes for better performance on JSON columns
CREATE INDEX idx_app_settings_settings_data ON app_settings USING GIN (settings_data);
CREATE INDEX idx_notifications_metadata ON notifications USING GIN (metadata);
CREATE INDEX idx_chat_context_cache_data ON chat_context_cache USING GIN (data);
CREATE INDEX idx_customers_favorite_items ON customers USING GIN (favorite_items);

-- Analyze tables for query optimization
ANALYZE user_profiles;
ANALYZE ingredients;
ANALYZE recipes;
ANALYZE orders;
ANALYZE customers;
ANALYZE productions;
ANALYZE financial_records;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✓ HeyTrack database schema created successfully!';
  RAISE NOTICE '✓ All tables, views, functions, and triggers are ready';
  RAISE NOTICE '✓ RLS policies configured for Stack Auth JWT';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure JWT secret in Supabase dashboard';
  RAISE NOTICE '2. Test authentication with Stack Auth';
  RAISE NOTICE '3. Generate TypeScript types: pnpm supabase:types';
  RAISE NOTICE '4. Verify RLS policies are working correctly';
END $$;


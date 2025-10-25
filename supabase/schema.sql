-- UMKM Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit VARCHAR(50) NOT NULL, -- kg, gram, liter, ml, pcs, etc
  price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  category VARCHAR(100), -- dairy, flour, sugar, etc
  storage_requirements TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- roti, kue, pastry, etc
  servings INTEGER NOT NULL DEFAULT 1,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  difficulty VARCHAR(20) DEFAULT 'Medium', -- Easy, Medium, Hard
  instructions TEXT,
  notes TEXT,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  selling_price DECIMAL(10,2) DEFAULT 0,
  margin_percentage DECIMAL(5,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  times_made INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Ingredients Junction Table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity DECIMAL(10,3) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  address TEXT,
  customer_type VARCHAR(20) DEFAULT 'retail', -- retail, wholesale
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  loyalty_points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  last_order_date DATE,
  registration_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255), -- for walk-in customers
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, IN_PROGRESS, READY, DELIVERED, CANCELLED
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  delivery_time TIME,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID
  payment_method VARCHAR(50), -- CASH, BANK_TRANSFER, CREDIT_CARD, etc
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  notes TEXT,
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Productions Table (Batch Production)
CREATE TABLE IF NOT EXISTS productions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_no VARCHAR(50) UNIQUE NOT NULL,
  recipe_id UUID REFERENCES recipes(id),
  recipe_name VARCHAR(255) NOT NULL,
  planned_quantity INTEGER NOT NULL,
  actual_quantity INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'PLANNED', -- PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
  priority VARCHAR(20) DEFAULT 'normal',
  planned_start_time TIMESTAMP WITH TIME ZONE,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  planned_end_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  assigned_staff TEXT[], -- array of staff names
  material_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  overhead_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  quality_rating DECIMAL(3,2),
  efficiency_percentage DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Transactions Table
CREATE TABLE IF NOT EXISTS stock_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL, -- PURCHASE, USAGE, ADJUSTMENT, WASTE
  quantity DECIMAL(10,3) NOT NULL, -- positive for IN, negative for OUT
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(10,2),
  total_value DECIMAL(10,2),
  reference VARCHAR(100), -- PO number, production batch, etc
  supplier VARCHAR(255),
  reason VARCHAR(100),
  notes TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Records Table
CREATE TABLE IF NOT EXISTS financial_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- INCOME, EXPENSE
  category VARCHAR(100) NOT NULL, -- Penjualan, Bahan Baku, Gaji, etc
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  reference VARCHAR(100),
  payment_method VARCHAR(50),
  date DATE DEFAULT CURRENT_DATE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ingredients_name ON ingredients(name);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);
CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes(name);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
CREATE INDEX IF NOT EXISTS idx_recipes_is_active ON recipes(is_active);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_productions_batch_no ON productions(batch_no);
CREATE INDEX IF NOT EXISTS idx_productions_status ON productions(status);
CREATE INDEX IF NOT EXISTS idx_stock_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON financial_records(date);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON productions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security policies (basic setup)
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations (you can restrict this later with auth)
CREATE POLICY "Allow all operations" ON ingredients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON recipes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON recipe_ingredients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON productions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON stock_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON financial_records FOR ALL USING (true);
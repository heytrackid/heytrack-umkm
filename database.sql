-- Bakery Management System Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for enums
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE production_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE');
CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER');
CREATE TYPE record_type AS ENUM ('INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL');

-- Ingredients/Raw Materials Table
CREATE TABLE ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- kg, gram, liter, ml, pcs, etc
    price_per_unit DECIMAL(12,2) NOT NULL,
    stock DECIMAL(10,3) DEFAULT 0,
    min_stock DECIMAL(10,3) DEFAULT 0, -- For low stock alerts
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipes Table
CREATE TABLE recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    servings INTEGER DEFAULT 1,
    prep_time INTEGER, -- minutes
    cook_time INTEGER, -- minutes
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe Ingredients (Many-to-Many)
CREATE TABLE recipe_ingredients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    UNIQUE(recipe_id, ingredient_id)
);

-- Customers Table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255), -- For walk-in customers
    status order_status DEFAULT 'PENDING',
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    delivery_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL
);

-- Production/Manufacturing
CREATE TABLE productions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    quantity INTEGER NOT NULL,
    cost_per_unit DECIMAL(12,2) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    status production_status DEFAULT 'PLANNED',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Transactions
CREATE TABLE stock_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    type transaction_type NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    reference VARCHAR(255), -- Order ID, Production ID, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    method payment_method NOT NULL,
    reference VARCHAR(255), -- Transaction reference
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Records
CREATE TABLE financial_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type record_type NOT NULL,
    category VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(255), -- Order ID, etc.
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_ingredient_id ON recipe_ingredients(ingredient_id);
CREATE INDEX idx_orders_order_no ON orders(order_no);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_productions_recipe_id ON productions(recipe_id);
CREATE INDEX idx_productions_status ON productions(status);
CREATE INDEX idx_stock_transactions_ingredient_id ON stock_transactions(ingredient_id);
CREATE INDEX idx_stock_transactions_type ON stock_transactions(type);
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_financial_records_type ON financial_records(type);
CREATE INDEX idx_financial_records_date ON financial_records(date);

-- Create triggers for updated_at timestamps
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

-- Function to automatically update stock when transactions are added
CREATE OR REPLACE FUNCTION update_ingredient_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'PURCHASE' OR NEW.type = 'ADJUSTMENT' THEN
        UPDATE ingredients 
        SET stock = stock + NEW.quantity 
        WHERE id = NEW.ingredient_id;
    ELSIF NEW.type = 'USAGE' OR NEW.type = 'WASTE' THEN
        UPDATE ingredients 
        SET stock = stock - NEW.quantity 
        WHERE id = NEW.ingredient_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stock_on_transaction 
    AFTER INSERT ON stock_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_ingredient_stock();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION generate_order_no()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_no IS NULL OR NEW.order_no = '' THEN
        NEW.order_no := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_sequence')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

CREATE TRIGGER generate_order_no_trigger 
    BEFORE INSERT ON orders 
    FOR EACH ROW EXECUTE FUNCTION generate_order_no();

-- Row Level Security (RLS) - Enable for all tables
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users - adjust as needed)
CREATE POLICY "Allow authenticated users" ON ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON recipes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON recipe_ingredients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON productions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON stock_transactions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON payments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users" ON financial_records FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO ingredients (name, description, unit, price_per_unit, stock, min_stock, supplier) VALUES
('Tepung Terigu', 'Tepung terigu protein sedang', 'kg', 12000, 50, 10, 'PT Bogasari'),
('Gula Pasir', 'Gula pasir putih', 'kg', 15000, 30, 5, 'PT Gula Putih'),
('Mentega', 'Mentega tawar', 'kg', 45000, 10, 2, 'PT Frisian Flag'),
('Telur Ayam', 'Telur ayam segar', 'kg', 28000, 5, 1, 'Peternakan Lokal'),
('Cokelat Bubuk', 'Cokelat bubuk untuk baking', 'kg', 35000, 8, 2, 'PT Van Houten'),
('Baking Powder', 'Pengembang kue', 'gram', 50, 500, 100, 'PT Koepoe-Koepoe');

INSERT INTO recipes (name, description, servings, prep_time, cook_time) VALUES
('Brownies Cokelat', 'Brownies cokelat lezat dan fudgy', 12, 30, 45),
('Kue Nastar', 'Kue kering nastar dengan selai nanas', 50, 60, 30),
('Roti Tawar', 'Roti tawar lembut untuk sarapan', 1, 20, 25);

-- Insert recipe ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES
-- Brownies Cokelat
((SELECT id FROM recipes WHERE name = 'Brownies Cokelat'), (SELECT id FROM ingredients WHERE name = 'Tepung Terigu'), 0.2, 'kg'),
((SELECT id FROM recipes WHERE name = 'Brownies Cokelat'), (SELECT id FROM ingredients WHERE name = 'Gula Pasir'), 0.3, 'kg'),
((SELECT id FROM recipes WHERE name = 'Brownies Cokelat'), (SELECT id FROM ingredients WHERE name = 'Mentega'), 0.15, 'kg'),
((SELECT id FROM recipes WHERE name = 'Brownies Cokelat'), (SELECT id FROM ingredients WHERE name = 'Telur Ayam'), 0.2, 'kg'),
((SELECT id FROM recipes WHERE name = 'Brownies Cokelat'), (SELECT id FROM ingredients WHERE name = 'Cokelat Bubuk'), 0.1, 'kg'),
-- Kue Nastar
((SELECT id FROM recipes WHERE name = 'Kue Nastar'), (SELECT id FROM ingredients WHERE name = 'Tepung Terigu'), 0.5, 'kg'),
((SELECT id FROM recipes WHERE name = 'Kue Nastar'), (SELECT id FROM ingredients WHERE name = 'Mentega'), 0.3, 'kg'),
((SELECT id FROM recipes WHERE name = 'Kue Nastar'), (SELECT id FROM ingredients WHERE name = 'Telur Ayam'), 0.1, 'kg'),
-- Roti Tawar
((SELECT id FROM recipes WHERE name = 'Roti Tawar'), (SELECT id FROM ingredients WHERE name = 'Tepung Terigu'), 0.5, 'kg'),
((SELECT id FROM recipes WHERE name = 'Roti Tawar'), (SELECT id FROM ingredients WHERE name = 'Gula Pasir'), 0.05, 'kg'),
((SELECT id FROM recipes WHERE name = 'Roti Tawar'), (SELECT id FROM ingredients WHERE name = 'Baking Powder'), 10, 'gram');
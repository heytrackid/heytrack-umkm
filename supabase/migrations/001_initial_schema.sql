-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER');
CREATE TYPE production_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE record_type AS ENUM ('INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL');
CREATE TYPE transaction_type AS ENUM ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE');

-- Create tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock DECIMAL(10,3) DEFAULT 0,
    min_stock DECIMAL(10,3) DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(15,2) DEFAULT 0,
    supplier VARCHAR(255),
    description TEXT,
    storage_requirements TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    servings INTEGER DEFAULT 1,
    prep_time INTEGER, -- in minutes
    cook_time INTEGER, -- in minutes
    difficulty VARCHAR(50),
    instructions TEXT,
    notes TEXT,
    cost_per_unit DECIMAL(15,2),
    selling_price DECIMAL(15,2),
    margin_percentage DECIMAL(5,2),
    rating DECIMAL(3,2),
    times_made INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost DECIMAL(15,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(recipe_id, ingredient_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(100) UNIQUE NOT NULL DEFAULT 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 6, '0'),
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255),
    status order_status DEFAULT 'PENDING',
    total_amount DECIMAL(15,2) DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    discount DECIMAL(15,2) DEFAULT 0,
    delivery_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    method payment_method NOT NULL,
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE productions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipes(id),
    quantity INTEGER NOT NULL,
    cost_per_unit DECIMAL(15,2) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL,
    status production_status DEFAULT 'PLANNED',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE stock_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id),
    type transaction_type NOT NULL,
    quantity DECIMAL(10,3) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(15,2),
    total_cost DECIMAL(15,2),
    reference VARCHAR(255), -- order_id, production_id, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE financial_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type record_type NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(255), -- order_id, production_id, etc.
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_customers_active ON customers(is_active);
CREATE INDEX idx_ingredients_active ON ingredients(is_active);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_recipes_active ON recipes(is_active);
CREATE INDEX idx_recipes_category ON recipes(category);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_delivery_date ON orders(delivery_date);
CREATE INDEX idx_productions_status ON productions(status);
CREATE INDEX idx_productions_created_at ON productions(created_at);
CREATE INDEX idx_stock_transactions_ingredient ON stock_transactions(ingredient_id);
CREATE INDEX idx_stock_transactions_created_at ON stock_transactions(created_at);
CREATE INDEX idx_financial_records_type ON financial_records(type);
CREATE INDEX idx_financial_records_date ON financial_records(date);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ingredients_updated_at BEFORE UPDATE ON ingredients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productions_updated_at BEFORE UPDATE ON productions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - will be refined later)
CREATE POLICY "Allow all operations" ON customers FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON ingredients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON recipes FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON recipe_ingredients FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON productions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON stock_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON financial_records FOR ALL USING (true);

-- Insert sample data
INSERT INTO customers (name, email, phone, address) VALUES
('Toko Roti Mawar', 'mawar@tokoritsi.com', '081234567890', 'Jl. Mawar No. 123, Jakarta'),
('Cafe Melati', 'owner@cafemelati.com', '081234567891', 'Jl. Melati No. 456, Bandung'),
('Warung Pak Budi', 'pakbudi@gmail.com', '081234567892', 'Jl. Kenanga No. 789, Surabaya');

INSERT INTO ingredients (name, category, current_stock, min_stock, unit, price_per_unit) VALUES
('Tepung Terigu', 'flour', 50.0, 10.0, 'kg', 12000),
('Mentega', 'dairy', 20.0, 5.0, 'kg', 35000),
('Telur Ayam', 'protein', 15.0, 12.0, 'kg', 28000),
('Gula Pasir', 'sweetener', 30.0, 8.0, 'kg', 15000),
('Ragi Instant', 'leavening', 2.0, 1.0, 'kg', 45000),
('Susu UHT', 'dairy', 10.0, 5.0, 'liter', 18000);

INSERT INTO recipes (name, description, category, servings, prep_time, cook_time, difficulty, cost_per_unit, selling_price, margin_percentage) VALUES
('Roti Tawar Premium', 'Roti tawar premium dengan tekstur lembut', 'bread', 1, 30, 45, 'medium', 5000, 15000, 200),
('Croissant Butter', 'Croissant mentega dengan teknik laminating', 'pastry', 1, 180, 25, 'hard', 8000, 25000, 212.5),
('Donat Glaze', 'Donat dengan glaze manis', 'pastry', 1, 60, 15, 'easy', 3000, 8000, 166.7);

-- Link recipes to ingredients
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Roti Tawar Premium'), (SELECT id FROM ingredients WHERE name = 'Tepung Terigu'), 0.5, 'kg'),
((SELECT id FROM recipes WHERE name = 'Roti Tawar Premium'), (SELECT id FROM ingredients WHERE name = 'Mentega'), 0.05, 'kg'),
((SELECT id FROM recipes WHERE name = 'Roti Tawar Premium'), (SELECT id FROM ingredients WHERE name = 'Ragi Instant'), 0.01, 'kg'),
((SELECT id FROM recipes WHERE name = 'Croissant Butter'), (SELECT id FROM ingredients WHERE name = 'Tepung Terigu'), 0.4, 'kg'),
((SELECT id FROM recipes WHERE name = 'Croissant Butter'), (SELECT id FROM ingredients WHERE name = 'Mentega'), 0.2, 'kg'),
((SELECT id FROM recipes WHERE name = 'Donat Glaze'), (SELECT id FROM ingredients WHERE name = 'Tepung Terigu'), 0.3, 'kg'),
((SELECT id FROM recipes WHERE name = 'Donat Glaze'), (SELECT id FROM ingredients WHERE name = 'Gula Pasir'), 0.1, 'kg'),
((SELECT id FROM recipes WHERE name = 'Donat Glaze'), (SELECT id FROM ingredients WHERE name = 'Telur Ayam'), 0.05, 'kg');

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE recipe_ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
ALTER PUBLICATION supabase_realtime ADD TABLE productions;
ALTER PUBLICATION supabase_realtime ADD TABLE stock_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_records;
-- ============================================================================
-- HEYTRACK COMPREHENSIVE SCHEMA MIGRATION
-- ============================================================================
-- This migration creates all the core HeyTrack business management tables
-- Includes: ingredients, recipes, orders, customers, financial records, etc.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- Ingredients table (with spoilage_rate field)
CREATE TABLE IF NOT EXISTS public.ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    price_per_unit DECIMAL(12,2) NOT NULL CHECK (price_per_unit >= 0),
    cost_per_unit DECIMAL(12,2) CHECK (cost_per_unit >= 0),
    current_stock DECIMAL(10,3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock DECIMAL(10,3) DEFAULT 0 CHECK (min_stock >= 0),
    max_stock DECIMAL(10,3) CHECK (max_stock >= 0),
    reorder_point DECIMAL(10,3),
    reorder_lead_time INTEGER,
    supplier VARCHAR(255),
    category VARCHAR(100),
    storage_requirements TEXT,
    expiry_date TIMESTAMPTZ,
    usage_rate_daily DECIMAL(10,3),
    last_purchase_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    weighted_average_cost DECIMAL(12,2) DEFAULT 0,
    waste_factor DECIMAL(5,3) DEFAULT 1.000 CHECK (waste_factor >= 1.000 AND waste_factor <= 2.000),
    spoilage_rate DECIMAL(5,4) DEFAULT 0.0500 NOT NULL CHECK (spoilage_rate >= 0 AND spoilage_rate <= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Recipes table (with packaging_cost_per_unit field)
CREATE TABLE IF NOT EXISTS public.recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'other',
    servings INTEGER NOT NULL DEFAULT 1 CHECK (servings > 0),
    prep_time_minutes INTEGER DEFAULT 0 CHECK (prep_time_minutes >= 0),
    cook_time_minutes INTEGER DEFAULT 0 CHECK (cook_time_minutes >= 0),
    instructions TEXT,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
    cost_per_unit DECIMAL(12,2) DEFAULT 0,
    selling_price DECIMAL(12,2),
    margin_percentage DECIMAL(5,2),
    total_cost DECIMAL(12,2) DEFAULT 0,
    packaging_cost_per_unit DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (packaging_cost_per_unit >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Recipe ingredients junction table
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ORDER MANAGEMENT TABLES
-- ============================================================================

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp_number VARCHAR(20),
    address TEXT,
    notes TEXT,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    last_order_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'READY', 'DELIVERED', 'CANCELLED')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    delivery_address TEXT,
    delivery_notes TEXT,
    payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER')),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'CANCELLED')),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- PRODUCTION MANAGEMENT TABLES
-- ============================================================================

-- Productions table
CREATE TABLE IF NOT EXISTS public.productions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    batch_size DECIMAL(10,3) NOT NULL CHECK (batch_size > 0),
    planned_start_time TIMESTAMPTZ,
    actual_start_time TIMESTAMPTZ,
    planned_end_time TIMESTAMPTZ,
    actual_end_time TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    quality_check_passed BOOLEAN,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Production batches table
CREATE TABLE IF NOT EXISTS public.production_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    production_id UUID NOT NULL REFERENCES public.productions(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    quantity_produced DECIMAL(10,3) NOT NULL CHECK (quantity_produced >= 0),
    quantity_wasted DECIMAL(10,3) DEFAULT 0 CHECK (quantity_wasted >= 0),
    actual_quantity DECIMAL(10,3),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    expiry_date DATE,
    storage_location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- FINANCIAL TABLES
-- ============================================================================

-- Financial records table
CREATE TABLE IF NOT EXISTS public.financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('INCOME', 'EXPENSE', 'INVESTMENT', 'WITHDRAWAL')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(20) CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER')),
    reference_number VARCHAR(100),
    related_order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    related_production_id UUID REFERENCES public.productions(id) ON DELETE SET NULL,
    is_reconciled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Operational costs table
CREATE TABLE IF NOT EXISTS public.operational_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY' CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME')),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET', 'OTHER')),
    payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- HPP (COST CALCULATION) TABLES
-- ============================================================================

-- HPP calculations table (with packaging_cost field)
CREATE TABLE IF NOT EXISTS public.hpp_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    material_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    overhead_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    packaging_cost DECIMAL(12,2) DEFAULT 0.00 NOT NULL CHECK (packaging_cost >= 0),
    total_hpp DECIMAL(12,2) NOT NULL DEFAULT 0,
    cost_per_unit DECIMAL(12,2) NOT NULL DEFAULT 0,
    wac_adjustment DECIMAL(12,2) DEFAULT 0,
    production_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SUPPLIER TABLES
-- ============================================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    supplier_type VARCHAR(20) DEFAULT 'standard' CHECK (supplier_type IN ('preferred', 'standard', 'trial', 'blacklisted')),
    payment_terms VARCHAR(100),
    lead_time_days INTEGER,
    minimum_order_value DECIMAL(12,2),
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INVENTORY MANAGEMENT TABLES
-- ============================================================================

-- Ingredient purchases table
CREATE TABLE IF NOT EXISTS public.ingredient_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    total_cost DECIMAL(12,2) NOT NULL CHECK (total_cost >= 0),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    batch_number VARCHAR(100),
    invoice_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Stock transactions table
CREATE TABLE IF NOT EXISTS public.stock_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('PURCHASE', 'USAGE', 'ADJUSTMENT', 'WASTE')),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2),
    total_price DECIMAL(12,2),
    reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Inventory alerts table
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRING_SOON', 'OVERSTOCK')),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- WhatsApp templates table
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    template_content TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    business_name VARCHAR(255),
    business_type VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    tax_id VARCHAR(50),
    currency VARCHAR(3) DEFAULT 'IDR',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    is_onboarded BOOLEAN NOT NULL DEFAULT false,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Ingredients indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_user_id ON public.ingredients(user_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_category ON public.ingredients(user_id, category);
CREATE INDEX IF NOT EXISTS idx_ingredients_active ON public.ingredients(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ingredients_spoilage_rate ON public.ingredients(spoilage_rate) WHERE spoilage_rate > 0.01;

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_user_id ON public.recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_recipes_category ON public.recipes(user_id, category);
CREATE INDEX IF NOT EXISTS idx_recipes_active ON public.recipes(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_recipes_packaging_cost ON public.recipes(packaging_cost_per_unit) WHERE packaging_cost_per_unit > 0;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.orders(user_id, order_date);

-- Financial records indexes
CREATE INDEX IF NOT EXISTS idx_financial_records_user_id ON public.financial_records(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON public.financial_records(user_id, record_type);
CREATE INDEX IF NOT EXISTS idx_financial_records_date ON public.financial_records(user_id, transaction_date);

-- HPP calculations indexes
CREATE INDEX IF NOT EXISTS idx_hpp_calculations_user_id ON public.hpp_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_hpp_calculations_recipe_id ON public.hpp_calculations(recipe_id);
CREATE INDEX IF NOT EXISTS idx_hpp_calculations_date ON public.hpp_calculations(user_id, calculation_date);
CREATE INDEX IF NOT EXISTS idx_hpp_calculations_packaging_cost ON public.hpp_calculations(packaging_cost) WHERE packaging_cost > 0;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER ingredients_updated_at
    BEFORE UPDATE ON public.ingredients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER suppliers_updated_at
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hpp_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (Users can only access their own data)
-- ============================================================================

-- Ingredients policies
CREATE POLICY "Users can view their own ingredients" ON public.ingredients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ingredients" ON public.ingredients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ingredients" ON public.ingredients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ingredients" ON public.ingredients
    FOR DELETE USING (auth.uid() = user_id);

-- Recipes policies
CREATE POLICY "Users can view their own recipes" ON public.recipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes" ON public.recipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes" ON public.recipes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes" ON public.recipes
    FOR DELETE USING (auth.uid() = user_id);

-- Recipe ingredients policies (inherited from recipes)
CREATE POLICY "Users can view their own recipe ingredients" ON public.recipe_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own recipe ingredients" ON public.recipe_ingredients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own recipe ingredients" ON public.recipe_ingredients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own recipe ingredients" ON public.recipe_ingredients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.recipes
            WHERE recipes.id = recipe_ingredients.recipe_id
            AND recipes.user_id = auth.uid()
        )
    );

-- Customers policies
CREATE POLICY "Users can view their own customers" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
    FOR DELETE USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders" ON public.orders
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Insert default operational costs
INSERT INTO public.operational_costs (user_id, name, category, amount, frequency, description)
SELECT
    auth.uid(),
    'Biaya Listrik',
    'UTILITIES',
    500000,
    'MONTHLY',
    'Biaya listrik bulanan untuk operasional dapur'
WHERE NOT EXISTS (
    SELECT 1 FROM public.operational_costs
    WHERE user_id = auth.uid() AND name = 'Biaya Listrik'
);

INSERT INTO public.operational_costs (user_id, name, category, amount, frequency, description)
SELECT
    auth.uid(),
    'Biaya Air',
    'UTILITIES',
    200000,
    'MONTHLY',
    'Biaya air bulanan untuk operasional dapur'
WHERE NOT EXISTS (
    SELECT 1 FROM public.operational_costs
    WHERE user_id = auth.uid() AND name = 'Biaya Air'
);

INSERT INTO public.operational_costs (user_id, name, category, amount, frequency, description)
SELECT
    auth.uid(),
    'Biaya Sewa',
    'RENT',
    2000000,
    'MONTHLY',
    'Biaya sewa tempat usaha'
WHERE NOT EXISTS (
    SELECT 1 FROM public.operational_costs
    WHERE user_id = auth.uid() AND name = 'Biaya Sewa'
);

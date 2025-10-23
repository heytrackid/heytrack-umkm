-- Migration: Add user_id columns for Supabase Auth integration
-- This migration adds user_id columns to all user-specific tables to enable RLS policies based on auth.uid()

-- Add user_id columns to tables that don't have them yet
-- These will reference auth.users(id) for proper Supabase auth integration

-- 1. Orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Bahan Baku (Ingredients) table
ALTER TABLE bahan_baku ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Resep (Recipes) table
ALTER TABLE resep ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Resep Item (Recipe Ingredients) table
ALTER TABLE resep_item ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Order Items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 6. Customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Financial Transactions table
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 8. Stock Ledger table
ALTER TABLE stock_ledger ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 9. Bahan Baku Pembelian (Ingredient Purchases) table
ALTER TABLE bahan_baku_pembelian ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 10. Biaya Operasional (Operational Costs) table
ALTER TABLE biaya_operasional ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 11. Production Log table
ALTER TABLE production_log ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 12. Low Stock Alerts table
ALTER TABLE low_stock_alerts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Note: hpp_snapshots and hpp_alerts already have user_id columns

-- Create indexes for performance on user_id columns
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bahan_baku_user_id ON bahan_baku(user_id);
CREATE INDEX IF NOT EXISTS idx_resep_user_id ON resep(user_id);
CREATE INDEX IF NOT EXISTS idx_resep_item_user_id ON resep_item(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_user_id ON order_items(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_user_id ON stock_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_bahan_baku_pembelian_user_id ON bahan_baku_pembelian(user_id);
CREATE INDEX IF NOT EXISTS idx_biaya_operasional_user_id ON biaya_operasional(user_id);
CREATE INDEX IF NOT EXISTS idx_production_log_user_id ON production_log(user_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_user_id ON low_stock_alerts(user_id);

-- Ensure hpp_snapshots and hpp_alerts have indexes
CREATE INDEX IF NOT EXISTS idx_hpp_snapshots_user_id ON hpp_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_hpp_alerts_user_id ON hpp_alerts(user_id);

-- Enable Row Level Security on all user-specific tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bahan_baku ENABLE ROW LEVEL SECURITY;
ALTER TABLE resep ENABLE ROW LEVEL SECURITY;
ALTER TABLE resep_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE bahan_baku_pembelian ENABLE ROW LEVEL SECURITY;
ALTER TABLE biaya_operasional ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies to recreate them with user_id
-- Orders policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can delete own orders" ON orders;

-- Bahan Baku policies
DROP POLICY IF EXISTS "Users can view own ingredients" ON bahan_baku;
DROP POLICY IF EXISTS "Users can insert own ingredients" ON bahan_baku;
DROP POLICY IF EXISTS "Users can update own ingredients" ON bahan_baku;
DROP POLICY IF EXISTS "Users can delete own ingredients" ON bahan_baku;

-- Resep policies
DROP POLICY IF EXISTS "Users can view own recipes" ON resep;
DROP POLICY IF EXISTS "Users can insert own recipes" ON resep;
DROP POLICY IF EXISTS "Users can update own recipes" ON resep;
DROP POLICY IF EXISTS "Users can delete own recipes" ON resep;

-- Resep Item policies
DROP POLICY IF EXISTS "Users can view own recipe items" ON resep_item;
DROP POLICY IF EXISTS "Users can insert own recipe items" ON resep_item;
DROP POLICY IF EXISTS "Users can update own recipe items" ON resep_item;
DROP POLICY IF EXISTS "Users can delete own recipe items" ON resep_item;

-- Order Items policies
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
DROP POLICY IF EXISTS "Users can update own order items" ON order_items;
DROP POLICY IF EXISTS "Users can delete own order items" ON order_items;

-- Customers policies
DROP POLICY IF EXISTS "Users can view own customers" ON customers;
DROP POLICY IF EXISTS "Users can insert own customers" ON customers;
DROP POLICY IF EXISTS "Users can update own customers" ON customers;
DROP POLICY IF EXISTS "Users can delete own customers" ON customers;

-- Financial Transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON financial_transactions;

-- Stock Ledger policies
DROP POLICY IF EXISTS "Users can view own stock ledger" ON stock_ledger;
DROP POLICY IF EXISTS "Users can insert own stock ledger" ON stock_ledger;
DROP POLICY IF EXISTS "Users can update own stock ledger" ON stock_ledger;
DROP POLICY IF EXISTS "Users can delete own stock ledger" ON stock_ledger;

-- Bahan Baku Pembelian policies
DROP POLICY IF EXISTS "Users can view own purchases" ON bahan_baku_pembelian;
DROP POLICY IF EXISTS "Users can insert own purchases" ON bahan_baku_pembelian;
DROP POLICY IF EXISTS "Users can update own purchases" ON bahan_baku_pembelian;
DROP POLICY IF EXISTS "Users can delete own purchases" ON bahan_baku_pembelian;

-- Biaya Operasional policies
DROP POLICY IF EXISTS "Users can view own operational costs" ON biaya_operasional;
DROP POLICY IF EXISTS "Users can insert own operational costs" ON biaya_operasional;
DROP POLICY IF EXISTS "Users can update own operational costs" ON biaya_operasional;
DROP POLICY IF EXISTS "Users can delete own operational costs" ON biaya_operasional;

-- Production Log policies
DROP POLICY IF EXISTS "Users can view own production logs" ON production_log;
DROP POLICY IF EXISTS "Users can insert own production logs" ON production_log;
DROP POLICY IF EXISTS "Users can update own production logs" ON production_log;
DROP POLICY IF EXISTS "Users can delete own production logs" ON production_log;

-- Low Stock Alerts policies
DROP POLICY IF EXISTS "Users can view own alerts" ON low_stock_alerts;
DROP POLICY IF EXISTS "Users can insert own alerts" ON low_stock_alerts;
DROP POLICY IF EXISTS "Users can update own alerts" ON low_stock_alerts;
DROP POLICY IF EXISTS "Users can delete own alerts" ON low_stock_alerts;

-- HPP Snapshots policies
DROP POLICY IF EXISTS "Users can view own hpp snapshots" ON hpp_snapshots;
DROP POLICY IF EXISTS "Users can insert own hpp snapshots" ON hpp_snapshots;
DROP POLICY IF EXISTS "Users can update own hpp snapshots" ON hpp_snapshots;
DROP POLICY IF EXISTS "Users can delete own hpp snapshots" ON hpp_snapshots;

-- HPP Alerts policies
DROP POLICY IF EXISTS "Users can view own hpp alerts" ON hpp_alerts;
DROP POLICY IF EXISTS "Users can insert own hpp alerts" ON hpp_alerts;
DROP POLICY IF EXISTS "Users can update own hpp alerts" ON hpp_alerts;
DROP POLICY IF EXISTS "Users can delete own hpp alerts" ON hpp_alerts;

-- Create new RLS policies based on auth.uid() = user_id

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- Bahan Baku (Ingredients) policies
CREATE POLICY "Users can view own ingredients" ON bahan_baku
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredients" ON bahan_baku
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ingredients" ON bahan_baku
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ingredients" ON bahan_baku
  FOR DELETE USING (auth.uid() = user_id);

-- Resep (Recipes) policies
CREATE POLICY "Users can view own recipes" ON resep
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON resep
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipes" ON resep
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON resep
  FOR DELETE USING (auth.uid() = user_id);

-- Resep Item (Recipe Ingredients) policies
CREATE POLICY "Users can view own recipe items" ON resep_item
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe items" ON resep_item
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recipe items" ON resep_item
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipe items" ON resep_item
  FOR DELETE USING (auth.uid() = user_id);

-- Order Items policies
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own order items" ON order_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own order items" ON order_items
  FOR DELETE USING (auth.uid() = user_id);

-- Customers policies
CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- Financial Transactions policies
CREATE POLICY "Users can view own transactions" ON financial_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON financial_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON financial_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON financial_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Stock Ledger policies
CREATE POLICY "Users can view own stock ledger" ON stock_ledger
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stock ledger" ON stock_ledger
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stock ledger" ON stock_ledger
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own stock ledger" ON stock_ledger
  FOR DELETE USING (auth.uid() = user_id);

-- Bahan Baku Pembelian (Ingredient Purchases) policies
CREATE POLICY "Users can view own purchases" ON bahan_baku_pembelian
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON bahan_baku_pembelian
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases" ON bahan_baku_pembelian
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchases" ON bahan_baku_pembelian
  FOR DELETE USING (auth.uid() = user_id);

-- Biaya Operasional (Operational Costs) policies
CREATE POLICY "Users can view own operational costs" ON biaya_operasional
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own operational costs" ON biaya_operasional
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own operational costs" ON biaya_operasional
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own operational costs" ON biaya_operasional
  FOR DELETE USING (auth.uid() = user_id);

-- Production Log policies
CREATE POLICY "Users can view own production logs" ON production_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own production logs" ON production_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own production logs" ON production_log
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own production logs" ON production_log
  FOR DELETE USING (auth.uid() = user_id);

-- Low Stock Alerts policies
CREATE POLICY "Users can view own alerts" ON low_stock_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON low_stock_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON low_stock_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON low_stock_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- HPP Snapshots policies
CREATE POLICY "Users can view own hpp snapshots" ON hpp_snapshots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hpp snapshots" ON hpp_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hpp snapshots" ON hpp_snapshots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hpp snapshots" ON hpp_snapshots
  FOR DELETE USING (auth.uid() = user_id);

-- HPP Alerts policies
CREATE POLICY "Users can view own hpp alerts" ON hpp_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hpp alerts" ON hpp_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hpp alerts" ON hpp_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hpp alerts" ON hpp_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN bahan_baku.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN resep.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN resep_item.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN order_items.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN customers.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN financial_transactions.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN stock_ledger.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN bahan_baku_pembelian.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN biaya_operasional.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN production_log.user_id IS 'References auth.users(id) for RLS policies';
COMMENT ON COLUMN low_stock_alerts.user_id IS 'References auth.users(id) for RLS policies';

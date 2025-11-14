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

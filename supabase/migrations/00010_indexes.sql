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

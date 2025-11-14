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

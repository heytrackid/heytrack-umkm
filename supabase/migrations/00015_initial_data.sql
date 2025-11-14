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

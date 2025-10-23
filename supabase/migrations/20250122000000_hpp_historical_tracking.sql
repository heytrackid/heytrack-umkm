-- Migration: HPP Historical Tracking & Trends
-- Description: Create tables for tracking HPP snapshots, alerts, and historical data
-- Date: 2025-01-22

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: hpp_snapshots
-- Purpose: Store historical HPP data snapshots for trend analysis
-- ============================================================================
CREATE TABLE hpp_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES resep(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  hpp_value DECIMAL(12, 2) NOT NULL,
  
  -- Cost breakdown
  material_cost DECIMAL(12, 2) NOT NULL,
  operational_cost DECIMAL(12, 2) NOT NULL,
  
  -- Detailed breakdown (JSONB for flexibility)
  cost_breakdown JSONB NOT NULL,
  -- Example structure:
  -- {
  --   "ingredients": [
  --     {"id": "uuid", "name": "Tepung", "cost": 5000, "percentage": 25},
  --     {"id": "uuid", "name": "Gula", "cost": 3000, "percentage": 15}
  --   ],
  --   "operational": [
  --     {"category": "utilities", "cost": 2000, "percentage": 10}
  --   ]
  -- }
  
  -- Metadata
  selling_price DECIMAL(12, 2),
  margin_percentage DECIMAL(5, 2),
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes for performance optimization
CREATE INDEX idx_hpp_snapshots_recipe_date ON hpp_snapshots(recipe_id, snapshot_date DESC);
CREATE INDEX idx_hpp_snapshots_date ON hpp_snapshots(snapshot_date DESC);
CREATE INDEX idx_hpp_snapshots_user ON hpp_snapshots(user_id);
CREATE INDEX idx_hpp_snapshots_recipe_user ON hpp_snapshots(recipe_id, user_id);

-- ============================================================================
-- Table: hpp_alerts
-- Purpose: Store alerts for significant HPP changes and margin issues
-- ============================================================================
CREATE TABLE hpp_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES resep(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'hpp_increase', 'hpp_decrease', 'margin_low', 'cost_spike'
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Alert details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Change metrics
  old_value DECIMAL(12, 2) NOT NULL,
  new_value DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(5, 2) NOT NULL,
  
  -- Affected components (JSONB)
  affected_components JSONB,
  -- Example structure:
  -- {
  --   "ingredients": [{"name": "Tepung", "old": 5000, "new": 6000, "change": 20}],
  --   "operational": [{"category": "utilities", "old": 2000, "new": 2500, "change": 25}]
  -- }
  
  -- Status tracking
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Indexes for performance optimization
CREATE INDEX idx_hpp_alerts_recipe ON hpp_alerts(recipe_id);
CREATE INDEX idx_hpp_alerts_user_unread ON hpp_alerts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_hpp_alerts_created ON hpp_alerts(created_at DESC);
CREATE INDEX idx_hpp_alerts_severity ON hpp_alerts(severity);
CREATE INDEX idx_hpp_alerts_type ON hpp_alerts(alert_type);
CREATE INDEX idx_hpp_alerts_recipe_user ON hpp_alerts(recipe_id, user_id);

-- ============================================================================
-- Table: hpp_snapshots_archive
-- Purpose: Archive snapshots older than 1 year for better performance
-- ============================================================================
CREATE TABLE hpp_snapshots_archive (
  id UUID PRIMARY KEY,
  recipe_id UUID NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
  hpp_value DECIMAL(12, 2) NOT NULL,
  material_cost DECIMAL(12, 2) NOT NULL,
  operational_cost DECIMAL(12, 2) NOT NULL,
  cost_breakdown JSONB NOT NULL,
  selling_price DECIMAL(12, 2),
  margin_percentage DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for archive table
CREATE INDEX idx_hpp_archive_recipe_date ON hpp_snapshots_archive(recipe_id, snapshot_date DESC);
CREATE INDEX idx_hpp_archive_date ON hpp_snapshots_archive(snapshot_date DESC);
CREATE INDEX idx_hpp_archive_user ON hpp_snapshots_archive(user_id);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hpp_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on hpp_alerts
CREATE TRIGGER update_hpp_alerts_updated_at 
BEFORE UPDATE ON hpp_alerts
FOR EACH ROW 
EXECUTE FUNCTION update_hpp_alerts_updated_at();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE hpp_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hpp_snapshots_archive ENABLE ROW LEVEL SECURITY;

-- Policies for hpp_snapshots
-- Users can view their own snapshots
CREATE POLICY "Users can view own hpp_snapshots"
  ON hpp_snapshots
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own snapshots
CREATE POLICY "Users can insert own hpp_snapshots"
  ON hpp_snapshots
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own snapshots
CREATE POLICY "Users can update own hpp_snapshots"
  ON hpp_snapshots
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own snapshots
CREATE POLICY "Users can delete own hpp_snapshots"
  ON hpp_snapshots
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for hpp_alerts
-- Users can view their own alerts
CREATE POLICY "Users can view own hpp_alerts"
  ON hpp_alerts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own alerts
CREATE POLICY "Users can insert own hpp_alerts"
  ON hpp_alerts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own alerts (for marking as read/dismissed)
CREATE POLICY "Users can update own hpp_alerts"
  ON hpp_alerts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own alerts
CREATE POLICY "Users can delete own hpp_alerts"
  ON hpp_alerts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for hpp_snapshots_archive
-- Users can view their own archived snapshots
CREATE POLICY "Users can view own hpp_snapshots_archive"
  ON hpp_snapshots_archive
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only system can insert into archive (no user insert policy)
-- Users cannot update or delete archived data

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to archive old snapshots (older than 1 year)
CREATE OR REPLACE FUNCTION archive_old_hpp_snapshots()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Move snapshots older than 1 year to archive
  WITH moved_snapshots AS (
    INSERT INTO hpp_snapshots_archive (
      id, recipe_id, snapshot_date, hpp_value, 
      material_cost, operational_cost, cost_breakdown,
      selling_price, margin_percentage, created_at, user_id
    )
    SELECT 
      id, recipe_id, snapshot_date, hpp_value,
      material_cost, operational_cost, cost_breakdown,
      selling_price, margin_percentage, created_at, user_id
    FROM hpp_snapshots
    WHERE snapshot_date < NOW() - INTERVAL '1 year'
    RETURNING id
  )
  SELECT COUNT(*) INTO archived_count FROM moved_snapshots;
  
  -- Delete archived snapshots from main table
  DELETE FROM hpp_snapshots
  WHERE snapshot_date < NOW() - INTERVAL '1 year';
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get HPP trend data for a recipe
CREATE OR REPLACE FUNCTION get_hpp_trend(
  p_recipe_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  snapshot_date TIMESTAMP WITH TIME ZONE,
  hpp_value DECIMAL(12, 2),
  material_cost DECIMAL(12, 2),
  operational_cost DECIMAL(12, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.snapshot_date,
    s.hpp_value,
    s.material_cost,
    s.operational_cost
  FROM hpp_snapshots s
  WHERE s.recipe_id = p_recipe_id
    AND s.snapshot_date >= NOW() - (p_days || ' days')::INTERVAL
  ORDER BY s.snapshot_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread alert count for a user
CREATE OR REPLACE FUNCTION get_unread_alert_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unread_count
  FROM hpp_alerts
  WHERE user_id = p_user_id
    AND is_read = FALSE
    AND is_dismissed = FALSE;
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Enable Realtime (optional - for real-time alert notifications)
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE hpp_snapshots;
ALTER PUBLICATION supabase_realtime ADD TABLE hpp_alerts;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE hpp_snapshots IS 'Historical HPP data snapshots for trend analysis and comparison';
COMMENT ON TABLE hpp_alerts IS 'Alerts for significant HPP changes, margin issues, and cost spikes';
COMMENT ON TABLE hpp_snapshots_archive IS 'Archive for HPP snapshots older than 1 year';

COMMENT ON COLUMN hpp_snapshots.cost_breakdown IS 'JSONB containing detailed breakdown of ingredients and operational costs';
COMMENT ON COLUMN hpp_alerts.affected_components IS 'JSONB containing details of ingredients or operational costs that changed significantly';
COMMENT ON COLUMN hpp_alerts.alert_type IS 'Type of alert: hpp_increase, hpp_decrease, margin_low, cost_spike';
COMMENT ON COLUMN hpp_alerts.severity IS 'Alert severity: low, medium, high, critical';

-- ============================================================================
-- Migration Complete
-- ============================================================================

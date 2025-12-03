-- Create system_broadcasts table for admin notifications
CREATE TABLE IF NOT EXISTS public.system_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  query_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.system_broadcasts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can read broadcasts
CREATE POLICY "Anyone can read broadcasts"
  ON public.system_broadcasts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can insert broadcasts (you'll need to add admin role check)
CREATE POLICY "Admins can insert broadcasts"
  ON public.system_broadcasts
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- TODO: Add admin role check

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_broadcasts_created_at 
  ON public.system_broadcasts(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_broadcasts;

-- Add comment
COMMENT ON TABLE public.system_broadcasts IS 'System-wide broadcast messages from admin to all users';

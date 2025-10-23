-- Enable RLS on performance_metrics table
-- This is a critical security fix to prevent data leakage between accounts

ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own performance metrics
CREATE POLICY "Users can view own performance metrics"
ON public.performance_metrics
FOR SELECT
USING (
  account_id = (SELECT account_id FROM public.accounts WHERE id = auth.uid())
);

-- Policy for users to insert their own performance metrics
CREATE POLICY "Users can insert own performance metrics"
ON public.performance_metrics
FOR INSERT
WITH CHECK (
  account_id = (SELECT account_id FROM public.accounts WHERE id = auth.uid())
);

-- Policy for service role to manage all performance metrics (for system operations)
CREATE POLICY "Service role can manage all performance metrics"
ON public.performance_metrics
FOR ALL
USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE public.performance_metrics IS 'Performance metrics with RLS enabled for multi-tenant security';

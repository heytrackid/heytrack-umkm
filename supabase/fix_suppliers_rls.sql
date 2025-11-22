-- Fix RLS policies for suppliers table
-- This script adds the missing INSERT policy for the suppliers table

-- Check existing policies on suppliers table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'suppliers';

-- Enable RLS on suppliers table if not already enabled
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Drop any existing INSERT policies that might be incorrect
DROP POLICY IF EXISTS "Users can insert their own suppliers" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert_policy" ON suppliers;
DROP POLICY IF EXISTS "suppliers_insert" ON suppliers;

-- Create the correct INSERT policy - allow inserts for authenticated users
-- The user_id will be set by the application or API
CREATE POLICY "Users can insert suppliers" ON suppliers
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Also ensure SELECT, UPDATE, DELETE policies exist
DROP POLICY IF EXISTS "Users can view their own suppliers" ON suppliers;
CREATE POLICY "Users can view their own suppliers" ON suppliers
FOR SELECT
USING (auth.user_id() = user_id);

DROP POLICY IF EXISTS "Users can update their own suppliers" ON suppliers;
CREATE POLICY "Users can update their own suppliers" ON suppliers
FOR UPDATE
USING (auth.user_id() = user_id)
WITH CHECK (auth.user_id() = user_id);

DROP POLICY IF EXISTS "Users can delete their own suppliers" ON suppliers;
CREATE POLICY "Users can delete their own suppliers" ON suppliers
FOR DELETE
USING (auth.user_id() = user_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'suppliers'
ORDER BY policyname;
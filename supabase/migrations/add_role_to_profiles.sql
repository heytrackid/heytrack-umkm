-- Add role column to profiles table for role-based access control
-- Migration: add_role_to_profiles
-- Created: 2025-10-30

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));
    
    -- Add comment
    COMMENT ON COLUMN public.profiles.role IS 'User role for access control: user, admin, or moderator';
  END IF;
END $$;

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update RLS policies to allow users to read their own role
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile (but not role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Only admins can update roles (via service role)
-- This is enforced at application level, not RLS

-- Grant necessary permissions
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url, updated_at) ON public.profiles TO authenticated;

-- Add helpful comment
COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: add_role_to_profiles';
  RAISE NOTICE 'Default role: user';
  RAISE NOTICE 'Available roles: user, admin, moderator';
  RAISE NOTICE 'To set a user as admin, run: UPDATE profiles SET role = ''admin'' WHERE id = ''user-id'';';
END $$;

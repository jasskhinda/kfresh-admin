-- Database triggers and functions for automatic auth user management
-- Run this in Supabase SQL Editor

-- Function to handle auth user profile creation
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile record for new auth users
  INSERT INTO public.user_profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_created();

-- Function to handle profile updates (sync with auth metadata)
CREATE OR REPLACE FUNCTION public.handle_profile_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth user metadata when profile is updated
  IF OLD.first_name IS DISTINCT FROM NEW.first_name OR
     OLD.last_name IS DISTINCT FROM NEW.last_name OR
     OLD.role IS DISTINCT FROM NEW.role THEN

    -- Update the auth user's metadata
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_build_object(
      'first_name', NEW.first_name,
      'last_name', NEW.last_name,
      'role', NEW.role
    )
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user_profiles table
DROP TRIGGER IF EXISTS on_profile_updated ON public.user_profiles;
CREATE TRIGGER on_profile_updated
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_profile_updated();

-- Function to handle auth user deletion (cleanup profiles)
CREATE OR REPLACE FUNCTION public.handle_auth_user_deleted()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the corresponding profile when auth user is deleted
  DELETE FROM public.user_profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_deleted();

-- RLS Policies for proper security
-- Update RLS policies for user_profiles

-- Drop existing policies
DROP POLICY IF EXISTS "Service role can do everything on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Create comprehensive policies
CREATE POLICY "Service role full access"
ON user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can update their own profile (but not role)
CREATE POLICY "Users can update own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  role = (SELECT role FROM user_profiles WHERE id = auth.uid())
);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Admins can create new profiles
CREATE POLICY "Admins can create profiles"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Admins can update profiles
CREATE POLICY "Admins can update profiles"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Only super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
ON user_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
  AND id != auth.uid() -- Can't delete own profile
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Function to safely create admin users (for use in Edge Functions)
CREATE OR REPLACE FUNCTION public.create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_first_name TEXT DEFAULT '',
  user_last_name TEXT DEFAULT '',
  user_role TEXT DEFAULT 'admin'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Validate role
  IF user_role NOT IN ('admin', 'super_admin') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid role specified');
  END IF;

  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE email = user_email) THEN
    RETURN json_build_object('success', false, 'error', 'User already exists');
  END IF;

  -- This would need to be called from an Edge Function with admin privileges
  -- as we can't directly create auth users from SQL

  RETURN json_build_object(
    'success', true,
    'message', 'Use Edge Function or service client to create auth user',
    'data', json_build_object(
      'email', user_email,
      'first_name', user_first_name,
      'last_name', user_last_name,
      'role', user_role
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_created() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_profile_updated() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_deleted() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Insert default admin if it doesn't exist (optional)
-- This will only work if there's already an auth user
-- INSERT INTO user_profiles (
--   id,
--   email,
--   first_name,
--   last_name,
--   role
-- )
-- SELECT
--   '16b1a7ba-19b3-4688-8816-06ee4f5efc89'::uuid,
--   'kfreshsupermarket@gmail.com',
--   'KFresh',
--   'Admin',
--   'super_admin'
-- WHERE NOT EXISTS (
--   SELECT 1 FROM user_profiles WHERE email = 'kfreshsupermarket@gmail.com'
-- );

-- Show current setup
SELECT
  'Triggers' as type,
  schemaname,
  tablename,
  actiontiming,
  triggername
FROM pg_triggers
WHERE schemaname IN ('public', 'auth')
AND tablename IN ('user_profiles', 'users')
ORDER BY tablename, triggername;

-- Show current users
SELECT
  'Current Profiles' as type,
  email,
  role,
  created_at
FROM user_profiles
ORDER BY created_at DESC;
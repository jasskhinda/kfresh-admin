-- Fix RLS policies to allow admin users to manage user profiles properly

-- First, temporarily disable RLS to fix the policies
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Create more permissive policies that check if user exists in auth.users
-- Allow authenticated users to view all profiles (needed for admin functionality)
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Allow users to update their own profile OR if they are admin/super_admin
CREATE POLICY "Users can update profiles" ON user_profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- Allow users to insert their own profile OR if they are admin/super_admin
CREATE POLICY "Users can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to delete profiles (except their own)
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
      AND up.id != user_profiles.id  -- Can't delete own profile
    )
  );

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions for the admin app to function
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
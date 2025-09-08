-- Quick fix for admin creation RLS policy issue
-- Run this in your Supabase SQL editor

-- Add policy to allow admins to create profiles for new admin users
CREATE POLICY "Admins can create profiles for others" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Also add policy to allow admins to update any profile  
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

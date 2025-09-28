-- Fix authentication and user creation policies
-- Run this in Supabase SQL Editor

-- First, check if RLS is blocking auth operations
-- Temporarily disable RLS on user_profiles for admin operations
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to do everything
CREATE POLICY "Service role can do everything on user_profiles"
ON user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Allow admins to read all profiles
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

-- Allow admins to insert new profiles
CREATE POLICY "Admins can insert profiles"
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

-- Allow admins to update profiles
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
);

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Check auth settings
SELECT * FROM auth.users WHERE email = 'kfreshsupermarket@gmail.com';

-- If user exists, show their details
-- If not, we'll need to create manually

-- Create the admin user manually if needed
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   created_at,
--   updated_at,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'kfreshsupermarket@gmail.com',
--   crypt('KFresh2024!', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider":"email","providers":["email"]}',
--   '{"first_name":"KFresh","last_name":"Admin","role":"super_admin"}',
--   NOW(),
--   NOW(),
--   '',
--   '',
--   '',
--   ''
-- );

-- Check if there are any triggers that might be interfering
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_profiles';

-- Show current user_profiles
SELECT id, email, role, created_at FROM user_profiles ORDER BY created_at;
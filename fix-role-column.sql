-- Add role column to user_profiles table
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='role') THEN
    ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'customer';
    RAISE NOTICE 'Role column added to user_profiles table';
  ELSE
    RAISE NOTICE 'Role column already exists in user_profiles table';
  END IF;
END $$;

-- Update the admin user with correct role
UPDATE user_profiles 
SET role = 'admin', 
    updated_at = NOW()
WHERE email = 'info@jasskhinda.com';

-- Verify the update
SELECT id, email, first_name, last_name, role, created_at, updated_at 
FROM user_profiles 
WHERE email = 'info@jasskhinda.com';

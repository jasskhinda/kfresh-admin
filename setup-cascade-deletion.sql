-- Set up cascade deletion so when a user_profile is deleted, the auth user is also deleted
-- This is a workaround for client-side deletion limitations

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

-- Add the foreign key constraint with CASCADE DELETE
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Now when you delete from user_profiles, it will automatically delete from auth.users too

-- Create a function to delete users properly
CREATE OR REPLACE FUNCTION delete_user_completely(user_id UUID)
RETURNS TEXT AS $$
DECLARE
  deleted_email TEXT;
BEGIN
  -- Get the email before deletion
  SELECT email INTO deleted_email
  FROM auth.users
  WHERE id = user_id;

  -- Delete from auth.users (this will cascade to user_profiles)
  DELETE FROM auth.users WHERE id = user_id;

  IF FOUND THEN
    RETURN 'User ' || deleted_email || ' deleted successfully';
  ELSE
    -- If auth deletion didn't work, try deleting just the profile
    DELETE FROM user_profiles WHERE id = user_id;
    IF FOUND THEN
      RETURN 'Profile deleted, but auth user may still exist';
    ELSE
      RETURN 'User not found';
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_completely TO authenticated;
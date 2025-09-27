-- Add password_last_changed column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS password_last_changed TIMESTAMP WITH TIME ZONE;

-- Update existing records to have a default value (created_at)
UPDATE user_profiles
SET password_last_changed = created_at
WHERE password_last_changed IS NULL;
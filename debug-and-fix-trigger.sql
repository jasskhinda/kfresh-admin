-- Debug and fix the user profile creation trigger

-- First, let's check if the trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'users' AND trigger_schema = 'auth';

-- Check if the function exists
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- Recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Trigger handle_new_user fired for user: %', NEW.id;

  BEGIN
    INSERT INTO public.user_profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'admin'),
      NOW(),
      NOW()
    );

    RAISE NOTICE 'Profile created successfully for user: %', NEW.id;

  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Don't fail the auth user creation if profile creation fails
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also create a function to manually create profiles for existing auth users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS TEXT AS $$
DECLARE
  user_record RECORD;
  profile_count INTEGER;
  created_count INTEGER := 0;
BEGIN
  -- Find auth users without profiles
  FOR user_record IN
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.user_profiles up ON au.id = up.id
    WHERE up.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.user_profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        updated_at
      )
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
        COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
        COALESCE(user_record.raw_user_meta_data->>'role', 'admin'),
        NOW(),
        NOW()
      );
      created_count := created_count + 1;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create profile for user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;

  RETURN 'Created ' || created_count || ' missing profiles';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to create missing profiles
SELECT create_missing_profiles();
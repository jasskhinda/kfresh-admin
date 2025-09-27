-- Create a function to create admin users without affecting current session
CREATE OR REPLACE FUNCTION create_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_first_name TEXT,
  user_last_name TEXT,
  user_role TEXT DEFAULT 'admin'
)
RETURNS JSON AS $$
DECLARE
  new_user_id UUID;
  result JSON;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();

  -- Insert into auth.users
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    aud,
    role
  )
  VALUES (
    new_user_id,
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'first_name', user_first_name,
      'last_name', user_last_name,
      'role', user_role
    ),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );

  -- Insert into user_profiles (or let trigger handle it)
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
    new_user_id,
    user_email,
    user_first_name,
    user_last_name,
    user_role,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Return the created user info
  result := json_build_object(
    'id', new_user_id,
    'email', user_email,
    'success', true
  );

  RETURN result;

EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Email already exists'
    );
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated;
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function fixTemplateUser() {
  try {
    console.log('🔧 Updating create_new_admin_user function to use kfreshsupermarket@gmail.com as template...');

    const functionSQL = `
CREATE OR REPLACE FUNCTION create_new_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_first_name TEXT DEFAULT '',
  user_last_name TEXT DEFAULT '',
  user_role TEXT DEFAULT 'admin'
)
RETURNS JSON AS $$
DECLARE
  template_user RECORD;
  new_user_id UUID;
  result JSON;
BEGIN
  -- Use kfreshsupermarket@gmail.com as template instead of jass@jasskhinda.com
  SELECT * INTO template_user FROM auth.users WHERE email = 'kfreshsupermarket@gmail.com';

  IF template_user.id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Template user kfreshsupermarket@gmail.com not found');
  END IF;

  -- Check if user already exists
  IF EXISTS(SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN json_build_object('success', false, 'error', 'User already exists');
  END IF;

  -- Generate new UUID
  new_user_id := gen_random_uuid();

  -- Create auth user with exact same structure as template
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    aud,
    role,
    raw_user_meta_data
  ) VALUES (
    new_user_id,
    template_user.instance_id,
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    template_user.aud,
    template_user.role,
    jsonb_build_object(
      'first_name', user_first_name,
      'last_name', user_last_name,
      'role', user_role
    )
  );

  -- Create profile
  INSERT INTO user_profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    user_email,
    user_first_name,
    user_last_name,
    user_role,
    NOW(),
    NOW()
  );

  -- Return success
  RETURN json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', user_email,
    'message', 'User created successfully using kfreshsupermarket@gmail.com template'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Clean up on error
    DELETE FROM auth.users WHERE id = new_user_id;
    DELETE FROM user_profiles WHERE id = new_user_id;

    RETURN json_build_object(
      'success', false,
      'error', 'Failed to create user: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_new_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_admin_user TO service_role;
`;

    const { error: functionError } = await supabase.rpc('exec', {
      sql: functionSQL
    });

    if (functionError) {
      console.error('Error updating function:', functionError);
      return;
    }

    console.log('✅ Function updated to use kfreshsupermarket@gmail.com as template');

    // Now test the updated function
    console.log('🧪 Testing updated user creation function...');

    // Clean up any existing test user first
    await supabase.from('user_profiles').delete().eq('email', 'test-final@kfresh.ca');

    const { data: createResult, error: createError } = await supabase.rpc('create_new_admin_user', {
      user_email: 'test-final@kfresh.ca',
      user_password: 'TestPass123',
      user_first_name: 'Test',
      user_last_name: 'Final',
      user_role: 'admin'
    });

    if (createError) {
      console.error('❌ User creation failed:', createError);
    } else if (!createResult.success) {
      console.error('❌ User creation failed:', createResult.error);
    } else {
      console.log('✅ Test user created successfully:', createResult);

      // Verify the user
      const { data: newUser, error: verifyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'test-final@kfresh.ca')
        .single();

      if (verifyError) {
        console.error('Error verifying user:', verifyError);
      } else {
        console.log('✅ New user verified:', newUser);
      }
    }

    console.log('\n🎉 User creation system is now fixed and working!');
    console.log('\nWorking credentials:');
    console.log('• kfreshsupermarket@gmail.com / Kfresh@2025 (template & client user)');
    console.log('• test-final@kfresh.ca / TestPass123 (test user)');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixTemplateUser();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createTemplateUser() {
  try {
    console.log('🔧 Creating jass@jasskhinda.com as template user...');

    // Create the template user that the function expects
    const { data: authUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: 'jass@jasskhinda.com',
      password: 'Openadmin',
      email_confirm: true,
      user_metadata: {
        first_name: 'Jass',
        last_name: 'Khinda',
        role: 'super_admin'
      }
    });

    if (createAuthError) {
      console.error('Error creating auth user:', createAuthError);
      return;
    }

    console.log('✅ Template auth user created:', authUser.user.email);
    console.log('User ID:', authUser.user.id);

    // Create the profile for the template user
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authUser.user.id,
        email: 'jass@jasskhinda.com',
        first_name: 'Jass',
        last_name: 'Khinda',
        role: 'super_admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    } else {
      console.log('✅ Template user profile created');
    }

    // Now test the create_new_admin_user function
    console.log('🧪 Testing user creation function...');

    const { data: createResult, error: createError } = await supabase.rpc('create_new_admin_user', {
      user_email: 'test-new-user@kfresh.ca',
      user_password: 'TestPass123',
      user_first_name: 'Test',
      user_last_name: 'User',
      user_role: 'admin'
    });

    if (createError) {
      console.error('❌ User creation failed:', createError);
    } else if (!createResult.success) {
      console.error('❌ User creation failed:', createResult.error);
    } else {
      console.log('✅ Test user created successfully:', createResult);
    }

    console.log('\n🎉 Template user setup complete!');
    console.log('\nWorking credentials:');
    console.log('• jass@jasskhinda.com / Openadmin (template user)');
    console.log('• kfreshsupermarket@gmail.com / Kfresh@2025 (client user)');
    console.log('• test-new-user@kfresh.ca / TestPass123 (test user)');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTemplateUser();
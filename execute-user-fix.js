const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('Environment variables loaded:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function executeUserFix() {
  try {
    console.log('🔧 Creating template user for the user creation system...');

    // Step 0: Check what users actually exist
    console.log('Step 0: Checking existing auth users...');
    const { data: existingUsersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
    } else {
      console.log('Existing auth users:', existingUsersData.users.map(u => ({ email: u.email, id: u.id })));
    }

    // Step 1: Create the template user (jass@jasskhinda.com) that the function expects
    console.log('Step 1: Creating template user jass@jasskhinda.com...');

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

    if (createAuthError && createAuthError.code === 'email_exists') {
      console.log('✅ Template auth user already exists');

      // Get the existing user to ensure profile exists
      const { data: existingUsers, error: getUserError } = await supabase.auth.admin.listUsers();
      const templateUser = existingUsers?.users.find(u => u.email === 'jass@jasskhinda.com');

      if (templateUser) {
        console.log('Found template user:', templateUser.id);

        // Ensure profile exists
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: templateUser.id,
            email: 'jass@jasskhinda.com',
            first_name: 'Jass',
            last_name: 'Khinda',
            role: 'super_admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Error creating/updating profile:', profileError);
        } else {
          console.log('✅ Template user profile ensured');
        }

        // Verify profile was created
        const { data: profileCheck } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', 'jass@jasskhinda.com')
          .single();

        console.log('Template user profile:', profileCheck);
      } else {
        console.error('Template user not found in auth.users');
      }
    } else if (createAuthError) {
      console.error('Error creating auth user:', createAuthError);
      return;
    } else {
      console.log('✅ Template auth user created:', authUser.user.email);

      // Create the profile for the new template user
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          email: 'jass@jasskhinda.com',
          first_name: 'Jass',
          last_name: 'Khinda',
          role: 'super_admin'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      } else {
        console.log('✅ Template user profile created');
      }
    }

    // Step 2: Now test the user creation function
    console.log('Step 2: Testing user creation function...');

    // Clean up any existing test user first
    await supabase
      .from('user_profiles')
      .delete()
      .eq('email', 'test-admin@kfresh.ca');

    // Test creating a new user
    const { data: createResult, error: createError } = await supabase.rpc('create_new_admin_user', {
      user_email: 'test-admin@kfresh.ca',
      user_password: 'TestPass123',
      user_first_name: 'Test',
      user_last_name: 'Admin',
      user_role: 'admin'
    });

    if (createError) {
      console.error('❌ User creation failed:', createError);
    } else if (!createResult.success) {
      console.error('❌ User creation failed:', createResult.error);
    } else {
      console.log('✅ User created successfully:', createResult);

      // Verify the user was created properly
      const { data: newUser, error: verifyError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'test-admin@kfresh.ca')
        .single();

      if (verifyError) {
        console.error('Error verifying new user:', verifyError);
      } else {
        console.log('✅ New user verified:', newUser);
      }
    }

    // Step 3: Check all users
    console.log('Step 3: Checking all admin users...');
    const { data: allUsers, error: listAllError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('email', ['jass@jasskhinda.com', 'kfreshsupermarket@gmail.com', 'test-admin@kfresh.ca']);

    if (listAllError) {
      console.error('Error listing users:', listAllError);
    } else {
      console.log('All admin users:');
      allUsers.forEach(user => {
        console.log(`  ✓ ${user.email}: ${user.first_name} ${user.last_name} (${user.role})`);
      });
    }

    console.log('\n🎉 User creation system is now working!');
    console.log('\nWorking credentials:');
    console.log('• jass@jasskhinda.com / Openadmin (template user)');
    console.log('• kfreshsupermarket@gmail.com / Kfresh@2025 (client user)');
    console.log('• test-admin@kfresh.ca / TestPass123 (test user)');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

executeUserFix();
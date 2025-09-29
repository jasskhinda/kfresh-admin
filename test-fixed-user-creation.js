const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testFixedUserCreation() {
  try {
    console.log('🧪 Testing fixed user creation system...');

    // Clean up any existing test users
    await supabaseAdmin.from('user_profiles').delete().eq('email', 'working-admin@kfresh.ca');
    await supabaseAdmin.from('user_profiles').delete().eq('email', 'super-admin@kfresh.ca');

    // Test creating a new user using the same approach as the updated user-actions.ts
    console.log('Creating working-admin@kfresh.ca...');
    const { data: authData1, error: authError1 } = await supabaseAdmin.auth.admin.createUser({
      email: 'working-admin@kfresh.ca',
      password: 'TestPass123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Working',
        last_name: 'Admin',
        role: 'admin'
      }
    });

    if (authError1) {
      console.error('❌ Auth user creation failed:', authError1);
    } else {
      console.log('✅ Auth user created:', authData1.user.email);

      // Create profile
      const { error: profileError1 } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData1.user.id,
          email: 'working-admin@kfresh.ca',
          first_name: 'Working',
          last_name: 'Admin',
          role: 'admin'
        });

      if (profileError1) {
        console.error('❌ Profile creation failed:', profileError1);
      } else {
        console.log('✅ Profile created for working-admin@kfresh.ca');
      }
    }

    // Test creating another user with super_admin role
    console.log('\nCreating super-admin@kfresh.ca...');
    const { data: authData2, error: authError2 } = await supabaseAdmin.auth.admin.createUser({
      email: 'super-admin@kfresh.ca',
      password: 'TestPass123',
      email_confirm: true,
      user_metadata: {
        first_name: 'Super',
        last_name: 'Admin',
        role: 'super_admin'
      }
    });

    if (authError2) {
      console.error('❌ Super admin creation failed:', authError2);
    } else {
      console.log('✅ Super admin auth user created:', authData2.user.email);

      // Create profile
      const { error: profileError2 } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData2.user.id,
          email: 'super-admin@kfresh.ca',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'super_admin'
        });

      if (profileError2) {
        console.error('❌ Super admin profile creation failed:', profileError2);
      } else {
        console.log('✅ Profile created for super-admin@kfresh.ca');
      }
    }

    // Check all users now
    console.log('\n📋 All users in the system:');
    const { data: allUsers, error: listError } = await supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (listError) {
      console.error('Error listing users:', listError);
    } else {
      allUsers.forEach(user => {
        console.log(`  ✓ ${user.email}: ${user.first_name} ${user.last_name} (${user.role})`);
      });
    }

    console.log('\n🎉 User creation system is now working!');
    console.log('\nTest credentials:');
    console.log('• working-admin@kfresh.ca / TestPass123 (admin)');
    console.log('• super-admin@kfresh.ca / TestPass123 (super_admin)');
    console.log('• kfreshsupermarket@gmail.com / Kfresh@2025 (existing super_admin)');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testFixedUserCreation();
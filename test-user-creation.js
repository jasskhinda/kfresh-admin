const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function testUserCreation() {
  try {
    console.log('🧪 Testing current user creation system...');

    // Clean up any existing test user first
    await supabase.from('user_profiles').delete().eq('email', 'working-test@kfresh.ca');

    // Test creating a user with the existing function
    const { data: createResult, error: createError } = await supabase.rpc('create_new_admin_user', {
      user_email: 'working-test@kfresh.ca',
      user_password: 'TestPass123',
      user_first_name: 'Working',
      user_last_name: 'Test',
      user_role: 'admin'
    });

    if (createError) {
      console.error('❌ RPC call failed:', createError);

      // Let's try creating a user using the admin API directly
      console.log('🔄 Trying direct user creation via admin API...');

      const { data: directUser, error: directError } = await supabase.auth.admin.createUser({
        email: 'direct-test@kfresh.ca',
        password: 'TestPass123',
        email_confirm: true,
        user_metadata: {
          first_name: 'Direct',
          last_name: 'Test',
          role: 'admin'
        }
      });

      if (directError) {
        console.error('❌ Direct creation failed:', directError);
      } else {
        console.log('✅ Direct user creation successful:', directUser.user.email);

        // Create profile manually
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: directUser.user.id,
            email: directUser.user.email,
            first_name: 'Direct',
            last_name: 'Test',
            role: 'admin'
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        } else {
          console.log('✅ Profile created for direct user');
        }
      }

    } else if (!createResult.success) {
      console.error('❌ User creation failed via function:', createResult.error);
      console.log('Result:', createResult);
    } else {
      console.log('✅ User created successfully via function:', createResult);
    }

    // Check all users now
    console.log('\n📋 Current users in the system:');
    const { data: allUsers, error: listError } = await supabase
      .from('user_profiles')
      .select('*');

    if (listError) {
      console.error('Error listing users:', listError);
    } else {
      allUsers.forEach(user => {
        console.log(`  ✓ ${user.email}: ${user.first_name} ${user.last_name} (${user.role})`);
      });
    }

    console.log('\n🎯 Next step: Update the function to use kfreshsupermarket@gmail.com as template');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testUserCreation();
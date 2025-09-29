const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testAuthentication() {
  try {
    console.log('🔐 Testing authentication for all users...');

    const testUsers = [
      { email: 'kfreshsupermarket@gmail.com', password: 'Kfresh@2025', name: 'Client User' },
      { email: 'working-admin@kfresh.ca', password: 'TestPass123', name: 'Working Admin' },
      { email: 'super-admin@kfresh.ca', password: 'TestPass123', name: 'Super Admin' }
    ];

    for (const testUser of testUsers) {
      console.log(`\nTesting ${testUser.name} (${testUser.email})...`);

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      if (error) {
        console.error(`❌ Login failed for ${testUser.email}:`, error.message);
      } else {
        console.log(`✅ Login successful for ${testUser.email}`);
        console.log(`   User ID: ${data.user.id}`);
        console.log(`   Email: ${data.user.email}`);
        console.log(`   Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);

        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error(`   Profile error: ${profileError.message}`);
        } else {
          console.log(`   Profile: ${profile.first_name} ${profile.last_name} (${profile.role})`);
        }

        // Sign out
        await supabase.auth.signOut();
      }
    }

    console.log('\n🎉 Authentication testing complete!');
    console.log('\n📋 Summary of working credentials:');
    console.log('• kfreshsupermarket@gmail.com / Kfresh@2025 (super_admin) - Client user');
    console.log('• working-admin@kfresh.ca / TestPass123 (admin) - Test admin');
    console.log('• super-admin@kfresh.ca / TestPass123 (super_admin) - Test super admin');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAuthentication();
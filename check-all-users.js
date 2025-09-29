const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users in the system...');

    // List all users (including deleted ones)
    const { data: allUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    console.log('All auth users:', allUsers.users.map(u => ({
      email: u.email,
      id: u.id,
      deleted_at: u.deleted_at
    })));

    // Check user profiles table
    console.log('\n🔍 Checking user profiles table...');
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*');

    if (profileError) {
      console.error('Error getting profiles:', profileError);
    } else {
      console.log('All user profiles:', profiles.map(p => ({
        email: p.email,
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        role: p.role
      })));
    }

    // Try to get specific user by email
    console.log('\n🔍 Trying to get jass@jasskhinda.com specifically...');
    const { data: specificUser, error: specificError } = await supabase.auth.admin.getUserById('jass@jasskhinda.com');

    if (specificError) {
      console.log('Cannot get user by email as ID:', specificError.message);
    } else {
      console.log('Found user:', specificUser);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAllUsers();
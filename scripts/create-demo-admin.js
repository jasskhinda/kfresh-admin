#!/usr/bin/env node

/**
 * Script to create demo admin user for production
 * Run with: node scripts/create-demo-admin.js
 */

// Import modules
const { createClient } = require('@supabase/supabase-js')
const { config } = require('dotenv')

// Load environment variables
config({ path: '.env.local' })

const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@kfresh.ca',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin'
}

async function createDemoAdmin() {
  console.log('🚀 Creating demo admin user account...')
  
  // Create Supabase admin client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  try {
    // Check if user already exists
    console.log('📧 Checking if demo admin user already exists...')
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }

    const existingUser = existingUsers.users.find(user => user.email === DEMO_ADMIN_CREDENTIALS.email)

    if (existingUser) {
      console.log('✅ Demo admin user already exists:', existingUser.email)
      
      // Update user profile to ensure admin role
      console.log('🔧 Ensuring admin role in user_profiles...')
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .upsert({
          id: existingUser.id,
          email: DEMO_ADMIN_CREDENTIALS.email,
          first_name: DEMO_ADMIN_CREDENTIALS.firstName,
          last_name: DEMO_ADMIN_CREDENTIALS.lastName,
          role: DEMO_ADMIN_CREDENTIALS.role,
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('❌ Error updating profile:', profileError.message)
      } else {
        console.log('✅ Admin profile updated successfully')
      }
      return
    }

    // Create new admin user
    console.log('👤 Creating new demo admin user...')
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_ADMIN_CREDENTIALS.email,
      password: DEMO_ADMIN_CREDENTIALS.password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name: DEMO_ADMIN_CREDENTIALS.firstName,
        last_name: DEMO_ADMIN_CREDENTIALS.lastName,
        role: DEMO_ADMIN_CREDENTIALS.role
      }
    })

    if (createError) {
      console.error('❌ Error creating user:', createError.message)
      return
    }

    console.log('✅ Demo admin user created successfully:', newUser.user.email)

    // Create user profile
    console.log('📝 Creating user profile...')
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: newUser.user.id,
        email: DEMO_ADMIN_CREDENTIALS.email,
        first_name: DEMO_ADMIN_CREDENTIALS.firstName,
        last_name: DEMO_ADMIN_CREDENTIALS.lastName,
        role: DEMO_ADMIN_CREDENTIALS.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message)
      return
    }

    console.log('✅ User profile created successfully')
    console.log('')
    console.log('🎉 Demo admin setup complete!')
    console.log('📧 Email:', DEMO_ADMIN_CREDENTIALS.email)
    console.log('🔑 Password:', DEMO_ADMIN_CREDENTIALS.password)
    console.log('👤 Role: admin')
    console.log('')
    console.log('You can now login at: https://kfresh-admin.vercel.app/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
createDemoAdmin().catch(console.error)

#!/usr/bin/env node

/**
 * Script to create admin user account
 * Run with: node scripts/create-admin-user.js
 */

// Import modules
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

const ADMIN_CREDENTIALS = {
  email: 'info@jasskhinda.com',
  password: 'Openmyadmin5!',
  firstName: 'Jass',
  lastName: 'Khinda',
  role: 'admin'
}

async function createAdminUser() {
  console.log('🚀 Creating admin user account...')
  
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
    console.log('📧 Checking if admin user already exists...')
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })

    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }

    const existingUser = existingUsers.users.find(user => user.email === ADMIN_CREDENTIALS.email)
    
    if (existingUser) {
      console.log('✅ Admin user already exists:', existingUser.id)
      console.log('📧 Email:', existingUser.email)
      console.log('📅 Created:', existingUser.created_at)
      
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', existingUser.id)
        .single()

      if (profileError || !profile) {
        console.log('📝 Creating user profile...')
        const { error: insertError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            id: existingUser.id,
            email: ADMIN_CREDENTIALS.email,
            first_name: ADMIN_CREDENTIALS.firstName,
            last_name: ADMIN_CREDENTIALS.lastName,
            role: ADMIN_CREDENTIALS.role
          })

        if (insertError) {
          console.error('❌ Error creating profile:', insertError.message)
        } else {
          console.log('✅ Admin profile created successfully')
        }
      } else {
        console.log('✅ Admin profile already exists')
        console.log('👤 Name:', profile.first_name, profile.last_name)
        console.log('🔑 Role:', profile.role)
      }
      
      return
    }

    // Create new admin user
    console.log('👤 Creating new admin user...')
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      email_confirm: true, // Skip email confirmation
      user_metadata: {
        first_name: ADMIN_CREDENTIALS.firstName,
        last_name: ADMIN_CREDENTIALS.lastName,
        role: ADMIN_CREDENTIALS.role
      }
    })

    if (createError) {
      console.error('❌ Error creating admin user:', createError.message)
      return
    }

    console.log('✅ Admin user created successfully!')
    console.log('👤 User ID:', newUser.user.id)
    console.log('📧 Email:', newUser.user.email)

    // Create user profile
    console.log('📝 Creating admin profile...')
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: newUser.user.id,
        email: ADMIN_CREDENTIALS.email,
        first_name: ADMIN_CREDENTIALS.firstName,
        last_name: ADMIN_CREDENTIALS.lastName,
        role: ADMIN_CREDENTIALS.role
      })

    if (profileError) {
      console.error('❌ Error creating admin profile:', profileError.message)
      return
    }

    console.log('✅ Admin profile created successfully!')
    
    console.log('\n🎉 Admin account setup complete!')
    console.log('📧 Email:', ADMIN_CREDENTIALS.email)
    console.log('🔑 Password:', ADMIN_CREDENTIALS.password)
    console.log('👤 Name:', ADMIN_CREDENTIALS.firstName, ADMIN_CREDENTIALS.lastName)
    console.log('🛡️ Role:', ADMIN_CREDENTIALS.role)
    console.log('\n🚀 You can now log in to the admin panel!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Check if environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Please ensure .env.local contains:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Run the script
createAdminUser().catch(console.error)

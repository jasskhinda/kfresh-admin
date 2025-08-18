#!/usr/bin/env node

/**
 * Simple script to create admin user account using Supabase REST API
 * Run with: node scripts/create-admin-simple.js
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!')
    process.exit(1)
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  const lines = envContent.split('\n')
  const env = {}
  
  lines.forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=')
      }
    }
  })
  
  return env
}

const env = loadEnvFile()

const ADMIN_CREDENTIALS = {
  email: 'info@jasskhinda.com',
  password: 'Openmyadmin5!',
  firstName: 'Jass',
  lastName: 'Khinda',
  role: 'admin'
}

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = ''
      res.on('data', (chunk) => {
        body += chunk
      })
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body)
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ data: parsed, statusCode: res.statusCode })
          } else {
            reject({ error: parsed, statusCode: res.statusCode })
          }
        } catch (e) {
          resolve({ data: body, statusCode: res.statusCode })
        }
      })
    })
    
    req.on('error', reject)
    
    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function createAdminUser() {
  console.log('🚀 Creating admin user account...')
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables!')
    console.error('Ensure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  
  try {
    // Check if user already exists
    console.log('📧 Checking if admin user already exists...')
    
    const listUsersOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/auth/v1/admin/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const { data: usersResponse } = await makeRequest(listUsersOptions)
    const existingUser = usersResponse.users?.find(user => user.email === ADMIN_CREDENTIALS.email)
    
    if (existingUser) {
      console.log('✅ Admin user already exists:', existingUser.id)
      console.log('📧 Email:', existingUser.email)
      console.log('📅 Created:', existingUser.created_at)
      
      // Check/create user profile
      const profileOptions = {
        hostname: supabaseUrl.replace('https://', ''),
        path: `/rest/v1/user_profiles?id=eq.${existingUser.id}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json'
        }
      }

      try {
        const { data: profiles } = await makeRequest(profileOptions)
        if (!profiles || profiles.length === 0) {
          console.log('📝 Creating user profile...')
          
          const createProfileOptions = {
            hostname: supabaseUrl.replace('https://', ''),
            path: '/rest/v1/user_profiles',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'apikey': serviceRoleKey,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            }
          }

          const profileData = {
            id: existingUser.id,
            email: ADMIN_CREDENTIALS.email,
            first_name: ADMIN_CREDENTIALS.firstName,
            last_name: ADMIN_CREDENTIALS.lastName,
            role: ADMIN_CREDENTIALS.role
          }

          await makeRequest(createProfileOptions, profileData)
          console.log('✅ Admin profile created successfully')
        } else {
          console.log('✅ Admin profile already exists')
          const profile = profiles[0]
          console.log('👤 Name:', profile.first_name, profile.last_name)
          console.log('🔑 Role:', profile.role)
        }
      } catch (profileError) {
        console.log('📝 Profile check failed, attempting to create...')
        // Try to create profile anyway
        const createProfileOptions = {
          hostname: supabaseUrl.replace('https://', ''),
          path: '/rest/v1/user_profiles',
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }

        const profileData = {
          id: existingUser.id,
          email: ADMIN_CREDENTIALS.email,
          first_name: ADMIN_CREDENTIALS.firstName,
          last_name: ADMIN_CREDENTIALS.lastName,
          role: ADMIN_CREDENTIALS.role
        }

        try {
          await makeRequest(createProfileOptions, profileData)
          console.log('✅ Admin profile created successfully')
        } catch (e) {
          console.log('⚠️ Profile creation failed, but user exists')
        }
      }
      
      return
    }

    // Create new admin user
    console.log('👤 Creating new admin user...')
    
    const createUserOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/auth/v1/admin/users',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const userData = {
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      email_confirm: true,
      user_metadata: {
        first_name: ADMIN_CREDENTIALS.firstName,
        last_name: ADMIN_CREDENTIALS.lastName,
        role: ADMIN_CREDENTIALS.role
      }
    }

    const { data: newUser } = await makeRequest(createUserOptions, userData)
    
    console.log('✅ Admin user created successfully!')
    console.log('👤 User ID:', newUser.id)
    console.log('📧 Email:', newUser.email)

    // Create user profile
    console.log('📝 Creating admin profile...')
    
    const createProfileOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/user_profiles',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }

    const profileData = {
      id: newUser.id,
      email: ADMIN_CREDENTIALS.email,
      first_name: ADMIN_CREDENTIALS.firstName,
      last_name: ADMIN_CREDENTIALS.lastName,
      role: ADMIN_CREDENTIALS.role
    }

    await makeRequest(createProfileOptions, profileData)
    console.log('✅ Admin profile created successfully!')
    
    console.log('\n🎉 Admin account setup complete!')
    console.log('📧 Email:', ADMIN_CREDENTIALS.email)
    console.log('🔑 Password:', ADMIN_CREDENTIALS.password)
    console.log('👤 Name:', ADMIN_CREDENTIALS.firstName, ADMIN_CREDENTIALS.lastName)
    console.log('🛡️ Role:', ADMIN_CREDENTIALS.role)
    console.log('\n🚀 You can now log in to the admin panel!')

  } catch (error) {
    console.error('❌ Error:', error.error || error.message || error)
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode)
    }
  }
}

// Run the script
createAdminUser().catch(console.error)

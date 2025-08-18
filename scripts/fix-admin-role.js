#!/usr/bin/env node

/**
 * Script to fix admin user role
 * Run with: node scripts/fix-admin-role.js
 */

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found')
  }

  const envFileContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}

  envFileContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return envVars
}

const env = loadEnvFile()

const ADMIN_CREDENTIALS = {
  email: 'info@jasskhinda.com',
  firstName: 'Jass',
  lastName: 'Khinda',
  role: 'admin'
}

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData)
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function fixAdminRole() {
  console.log('🔧 Fixing admin user role...')
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables!')
    console.error('Ensure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  
  try {
    // Get the admin user ID first
    console.log('📧 Finding admin user...')
    
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
    const adminUser = usersResponse.users?.find(user => user.email === ADMIN_CREDENTIALS.email)
    
    if (!adminUser) {
      console.error('❌ Admin user not found!')
      return
    }

    console.log('✅ Admin user found:', adminUser.id)

    // Update the admin profile with correct role
    console.log('🔄 Updating admin profile role...')
    
    const updateProfileOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: `/rest/v1/user_profiles?id=eq.${adminUser.id}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    }

    const profileUpdates = {
      role: ADMIN_CREDENTIALS.role,
      first_name: ADMIN_CREDENTIALS.firstName,
      last_name: ADMIN_CREDENTIALS.lastName,
      updated_at: new Date().toISOString()
    }

    await makeRequest(updateProfileOptions, profileUpdates)
    console.log('✅ Admin profile role updated successfully!')
    
    // Verify the update
    console.log('🔍 Verifying the update...')
    
    const verifyOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: `/rest/v1/user_profiles?id=eq.${adminUser.id}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const { data: profiles } = await makeRequest(verifyOptions)
    
    if (profiles && profiles.length > 0) {
      const profile = profiles[0]
      console.log('✅ Profile verified!')
      console.log('👤 Name:', profile.first_name, profile.last_name)
      console.log('📧 Email:', profile.email)
      console.log('🔑 Role:', profile.role)
    }
    
    console.log('\n🎉 Admin role fix complete!')
    console.log('🚀 You can now test the admin login!')

  } catch (error) {
    console.error('❌ Error:', error.error || error.message || error)
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode)
    }
  }
}

// Run the script
fixAdminRole().catch(console.error)

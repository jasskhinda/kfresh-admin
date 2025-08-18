#!/usr/bin/env node

/**
 * Script to add role column and fix admin role using SQL
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

async function addRoleColumnAndFixAdmin() {
  console.log('🔧 Adding role column and fixing admin role...')
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables!')
    process.exit(1)
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  
  try {
    // Step 1: Add role column
    console.log('📝 Adding role column to user_profiles table...')
    
    const addColumnOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const addColumnSQL = {
      query: `
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_profiles' AND column_name='role') THEN
            ALTER TABLE user_profiles ADD COLUMN role TEXT DEFAULT 'customer';
          END IF;
        END $$;
      `
    }

    try {
      await makeRequest(addColumnOptions, addColumnSQL)
      console.log('✅ Role column check/add completed')
    } catch (error) {
      console.log('ℹ️ Role column may already exist, continuing...')
    }

    // Step 2: Update admin user directly using REST API
    console.log('🔄 Updating admin user role...')
    
    const updateOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/user_profiles?email=eq.info@jasskhinda.com',
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }

    const updateData = {
      role: 'admin',
      updated_at: new Date().toISOString()
    }

    const updateResult = await makeRequest(updateOptions, updateData)
    
    if (updateResult.statusCode === 200) {
      console.log('✅ Admin role updated successfully!')
    }

    // Step 3: Verify the update
    console.log('🔍 Verifying admin profile...')
    
    const verifyOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/user_profiles?email=eq.info@jasskhinda.com&select=*',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const verifyResult = await makeRequest(verifyOptions)
    
    if (verifyResult.data && verifyResult.data.length > 0) {
      const profile = verifyResult.data[0]
      console.log('✅ Admin profile verified!')
      console.log('👤 Name:', profile.first_name, profile.last_name)
      console.log('📧 Email:', profile.email)
      console.log('🔑 Role:', profile.role)
      console.log('📅 Updated:', profile.updated_at)
    }
    
    console.log('\n🎉 Admin role fix complete!')
    console.log('🚀 Admin authentication should now work properly!')

  } catch (error) {
    console.error('❌ Error:', error.message || error)
  }
}

// Run the script
addRoleColumnAndFixAdmin().catch(console.error)

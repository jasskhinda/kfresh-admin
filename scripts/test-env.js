#!/usr/bin/env node

console.log('🚀 Script starting...')

// Test the env loading
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  console.log('Looking for env file at:', envPath)
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found at:', envPath)
    process.exit(1)
  }

  console.log('✅ Found .env.local file')
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

try {
  console.log('Loading environment...')
  const env = loadEnvFile()
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  console.log('Supabase URL found:', !!supabaseUrl)
  console.log('Service Role Key found:', !!serviceRoleKey)

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables!')
    process.exit(1)
  }

  console.log('✅ Environment loaded successfully')
  console.log('🎉 Script test completed')

} catch (error) {
  console.error('💥 Error:', error.message)
  console.error(error.stack)
}

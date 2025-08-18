// Check what files exist in the storage bucket
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkStorageBucket() {
  try {
    console.log('🔍 Checking storage bucket contents...')
    
    // List files in the products folder
    const { data: productFiles, error: productError } = await supabase.storage
      .from('product-images')
      .list('products', { limit: 20 })

    if (productError) {
      console.error('❌ Error listing product files:', productError)
    } else {
      console.log(`\n📁 Products folder contains ${productFiles.length} files:`)
      productFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name}`)
      })
    }

    // List files in the food folder  
    const { data: foodFiles, error: foodError } = await supabase.storage
      .from('product-images')
      .list('food', { limit: 10 })

    if (foodError) {
      console.error('❌ Error listing food files:', foodError)
    } else {
      console.log(`\n🍽️ Food folder contains ${foodFiles.length} files:`)
      foodFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name}`)
      })
    }

    // Test a specific known file
    const testUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/f6c0ac6a-61ca-4329-bf25-1a5a13a711a7_1755542098808_ex9jvyhim7c.jpeg'
    console.log(`\n🧪 Testing known working URL:`)
    console.log(`   ${testUrl}`)
    
    try {
      const response = await fetch(testUrl, { method: 'HEAD' })
      console.log(`   Result: ${response.ok ? '✅ Accessible' : '❌ Not accessible'} (${response.status})`)
    } catch (error) {
      console.log(`   Result: ❌ Fetch failed - ${error.message}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkStorageBucket()

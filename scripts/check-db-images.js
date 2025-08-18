// Quick check of actual database image URLs
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseImages() {
  try {
    console.log('🔍 Checking actual database image URLs...')
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null)
      .limit(10)

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log(`\n📦 Sample of ${products.length} products:`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, imgIndex) => {
          console.log(`   Image ${imgIndex + 1}: ${img}`)
        })
      }
      console.log('') // blank line
    })

    // Test one of the converted URLs
    const firstImage = products[0]?.images?.[0]
    if (firstImage) {
      console.log(`🧪 Testing first image URL: ${firstImage}`)
      try {
        const response = await fetch(firstImage, { method: 'HEAD' })
        console.log(`   Result: ${response.ok ? '✅ Accessible' : '❌ Not accessible'} (${response.status})`)
      } catch (error) {
        console.log(`   Result: ❌ Fetch failed - ${error.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkDatabaseImages()

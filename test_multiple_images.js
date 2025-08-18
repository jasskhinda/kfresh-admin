// Quick test to add multiple images to a product for gallery testing
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestImages() {
  try {
    // First, let's find a product to add multiple images to
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .limit(1)

    if (error) throw error

    if (products && products.length > 0) {
      const product = products[0]
      console.log('Found product:', product.name)

      // Add multiple test images to this product
      const testImages = [
        '/products/test-featured-image.jpg',
        '/products/test-gallery-1.jpg', 
        '/products/test-gallery-2.jpg',
        '/products/test-gallery-3.jpg',
        '/products/test-gallery-4.jpg'
      ]

      const { error: updateError } = await supabase
        .from('products')
        .update({ images: testImages })
        .eq('id', product.id)

      if (updateError) throw updateError

      console.log('✅ Successfully added multiple images to product:', product.name)
      console.log('📷 Images:', testImages)
      console.log('🎯 Product ID:', product.id)
      
      return product.id
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addTestImages()

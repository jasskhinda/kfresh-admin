// Convert relative image paths to full Supabase storage URLs
console.log('Starting script...')

try {
  require('dotenv').config({ path: '.env.local' })
  console.log('Loaded environment variables')
} catch (error) {
  console.error('Error loading dotenv:', error)
}

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Missing')
console.log('Supabase Key:', supabaseKey ? 'Found' : 'Missing')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
console.log('Created Supabase client')

// The correct storage URL base from the working admin upload
const STORAGE_BASE_URL = 'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images'

async function convertRelativeToFullUrls() {
  try {
    console.log('🔍 Finding products with relative image paths...')
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null)

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError)
      return
    }

    console.log(`📦 Found ${products.length} products total`)
    
    let updateCount = 0
    let relativePathCount = 0
    
    for (const product of products) {
      if (!product.images || product.images.length === 0) continue
      
      let hasRelativePaths = false
      let updatedImages = []
      
      for (const imageUrl of product.images) {
        // Check if it's a relative path
        if (imageUrl.startsWith('/products/') || imageUrl.startsWith('/food/')) {
          hasRelativePaths = true
          relativePathCount++
          // Convert to full URL
          const fullUrl = `${STORAGE_BASE_URL}${imageUrl}`
          updatedImages.push(fullUrl)
          console.log(`🔄 Converting: ${imageUrl} -> ${fullUrl}`)
        } else {
          // Keep existing full URLs as is
          updatedImages.push(imageUrl)
        }
      }
      
      // Update product if it had relative paths
      if (hasRelativePaths) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: updatedImages })
          .eq('id', product.id)
        
        if (updateError) {
          console.error(`❌ Failed to update ${product.name}:`, updateError)
        } else {
          console.log(`✅ Updated ${product.name} with ${updatedImages.length} full URLs`)
          updateCount++
        }
      }
    }
    
    console.log(`\n📊 Summary:`)
    console.log(`   - Products processed: ${products.length}`)
    console.log(`   - Products updated: ${updateCount}`)
    console.log(`   - Relative paths converted: ${relativePathCount}`)
    
    // Test a few converted URLs
    console.log('\n🧪 Testing converted URLs...')
    const testUrls = [
      `${STORAGE_BASE_URL}/products/palm-oil-regular-1l.jpg`,
      `${STORAGE_BASE_URL}/products/fresh-ginger-root.jpg`,
      `${STORAGE_BASE_URL}/food/jollof-rice.jpg`
    ]
    
    for (const url of testUrls) {
      try {
        const response = await fetch(url, { method: 'HEAD' })
        console.log(`${response.ok ? '✅' : '❌'} ${url} (${response.status})`)
      } catch (error) {
        console.log(`❌ ${url} - fetch failed: ${error.message}`)
      }
    }
    
    // Verify some products have full URLs now
    console.log('\n🔍 Verifying updates...')
    const { data: verifyProducts, error: verifyError } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null)
      .limit(5)
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError)
    } else {
      console.log('✅ Sample updated products:')
      verifyProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`)
        if (product.images && product.images.length > 0) {
          console.log(`      Image: ${product.images[0]}`)
        }
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the conversion
async function main() {
  console.log('🚀 Starting relative to full URL conversion...\n')
  await convertRelativeToFullUrls()
  console.log('\n✨ Conversion complete!')
}

main()

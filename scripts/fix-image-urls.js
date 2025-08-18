// Fix image URLs for products to use proper Supabase storage URLs
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Sample real product images from Supabase storage bucket
const realImageUrls = [
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/palm-oil-1l.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/plantain-chips.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/jollof-rice-mix.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/cassava-flour.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/palm-kernel-oil.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/scotch-bonnet-peppers.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/ginger-root.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/yam-fresh.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/plantain-fresh.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/goat-meat.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/maggi-cubes.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/gari-cassava.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/dried-fish.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/shea-butter.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/tiger-nuts.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/coconut-oil.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/fufu-flour.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/african-black-soap.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/egusi-soup-mix.jpg',
  'https://gvgltfxnoghfibwdaabr.supabase.co/storage/v1/object/public/product-images/products/peanut-butter.jpg'
]

async function fixImageUrls() {
  try {
    console.log('🔍 Checking current products with images...')
    
    // Get all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, images')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError)
      return
    }

    console.log(`📦 Found ${products.length} products total`)
    
    // Count products with and without images
    const withImages = products.filter(p => p.images && p.images.length > 0)
    const withoutImages = products.filter(p => !p.images || p.images.length === 0)
    
    console.log(`✅ Products with images: ${withImages.length}`)
    console.log(`❌ Products without images: ${withoutImages.length}`)
    
    if (withImages.length > 0) {
      console.log('\n📸 Products with images:')
      withImages.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.images.length} image(s)`)
        product.images.forEach((url, imgIndex) => {
          console.log(`      ${imgIndex + 1}: ${url}`)
        })
      })
    }
    
    console.log('\n🔧 Fixing products without images...')
    
    let updateCount = 0
    
    // Add images to products that don't have them
    for (let i = 0; i < Math.min(withoutImages.length, realImageUrls.length); i++) {
      const product = withoutImages[i]
      const imageUrl = realImageUrls[i]
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          images: [imageUrl]
        })
        .eq('id', product.id)
      
      if (updateError) {
        console.error(`❌ Failed to update ${product.name}:`, updateError)
      } else {
        console.log(`✅ Added image to: ${product.name}`)
        updateCount++
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} products with images`)
    
    // Verify the changes
    console.log('\n🔍 Verifying changes...')
    const { data: updatedProducts, error: verifyError } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null)
      .limit(10)
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError)
    } else {
      console.log(`✅ Verification: Found ${updatedProducts.length} products with images`)
      updatedProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.images[0]}`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Also create a function to test image URLs
async function testImageUrls() {
  console.log('\n🧪 Testing image URL accessibility...')
  
  const testUrls = realImageUrls.slice(0, 3) // Test first 3 URLs
  
  for (const url of testUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        console.log(`✅ ${url} - accessible (${response.status})`)
      } else {
        console.log(`❌ ${url} - not accessible (${response.status})`)
      }
    } catch (error) {
      console.log(`❌ ${url} - fetch failed: ${error.message}`)
    }
  }
}

// Run both functions
async function main() {
  console.log('🚀 Starting image URL fix process...\n')
  await fixImageUrls()
  await testImageUrls()
  console.log('\n✨ Process complete!')
}

main()

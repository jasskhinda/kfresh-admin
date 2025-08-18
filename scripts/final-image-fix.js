// Final solution: Add reliable working images to products
console.log('🚀 Starting final image fix...')

try {
  require('dotenv').config({ path: '.env.local' })
  console.log('✅ Environment loaded')
} catch (error) {
  console.error('❌ Environment error:', error)
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
console.log('✅ Supabase client created')

// Reliable food and product images from Unsplash
const reliableImages = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1582508090499-e2b24318d180?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1599735894046-a50c98c8ceeb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1505253213348-cd54c92b37ef?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1516595080664-ed2fc6a32937?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558345558-dc045a3b0e66?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop'
]

async function fixImagesNow() {
  try {
    console.log('🔍 Fetching products...')
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .limit(20)

    if (error) {
      console.error('❌ Database error:', error)
      return
    }

    console.log(`📦 Found ${products.length} products`)
    
    let successCount = 0
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const imageUrl = reliableImages[i % reliableImages.length]
      
      console.log(`🔄 Updating ${product.name}...`)
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: [imageUrl] })
        .eq('id', product.id)
      
      if (updateError) {
        console.error(`❌ Failed: ${updateError.message}`)
      } else {
        console.log(`✅ Success: ${product.name}`)
        successCount++
      }
    }
    
    console.log(`\n🎉 Updated ${successCount}/${products.length} products`)
    
    // Verify one image works
    console.log('\n🧪 Testing first image...')
    const testUrl = reliableImages[0]
    
    const response = await fetch(testUrl, { method: 'HEAD' })
    console.log(`${response.ok ? '✅' : '❌'} Test image: ${testUrl} (${response.status})`)
    
    console.log('\n✨ Image fix complete! Check the store now.')

  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run immediately
fixImagesNow()
  .then(() => {
    console.log('🏁 Script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })

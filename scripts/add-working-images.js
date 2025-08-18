// Use actual working Supabase URLs from uploaded images
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// These are actual working URLs from the uploaded images we saw in the database
const workingImageUrls = [
  'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/f6c0ac6a-61ca-4329-bf25-1a5a13a711a7_1755542098808_ex9jvyhim7c.jpeg',
  'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/f6c0ac6a-61ca-4329-bf25-1a5a13a711a7_1755542115995_345d1nk3zk7.jpeg',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1582508090499-e2b24318d180?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1599735894046-a50c98c8ceeb?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1505253213348-cd54c92b37ef?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1516595080664-ed2fc6a32937?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1558345558-dc045a3b0e66?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop&crop=center'
]

async function addWorkingImages() {
  try {
    console.log('🔧 Adding working image URLs to products...')
    
    // Get products that need images (first 20)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('❌ Error fetching products:', error)
      return
    }

    console.log(`📦 Found ${products.length} products`)
    
    let updateCount = 0
    
    for (let i = 0; i < products.length && i < workingImageUrls.length; i++) {
      const product = products[i]
      const imageUrl = workingImageUrls[i]
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          images: [imageUrl]
        })
        .eq('id', product.id)
      
      if (updateError) {
        console.error(`❌ Failed to update ${product.name}:`, updateError)
      } else {
        console.log(`✅ Updated ${product.name} with working image`)
        updateCount++
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updateCount} products with working images`)
    
    // Test a few of the URLs
    console.log('\n🧪 Testing a few URLs...')
    for (let i = 0; i < Math.min(3, workingImageUrls.length); i++) {
      const url = workingImageUrls[i]
      try {
        const response = await fetch(url, { method: 'HEAD' })
        console.log(`${response.ok ? '✅' : '❌'} ${url} (${response.status})`)
      } catch (error) {
        console.log(`❌ ${url} - ${error.message}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addWorkingImages()

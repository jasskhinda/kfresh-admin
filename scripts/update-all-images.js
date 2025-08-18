#!/usr/bin/env node

// Complete image fix for all products
console.log('🚀 Starting complete image fix for ALL products...')

const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTg3ODUsImV4cCI6MjA3MDE3NDc4NX0.RJ_j7zhHBSd8IErQckTARA9fOmMmb2xelQ_2HQRjUgM'

// Expanded set of working Unsplash food and product images
const workingImages = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center', // tomatoes
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center', // rice
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&crop=center', // chicken
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop&crop=center', // vegetables
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center', // spices
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center', // oil
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center', // beans
  'https://images.unsplash.com/photo-1582508090499-e2b24318d180?w=400&h=400&fit=crop&crop=center', // leafy greens
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=400&fit=crop&crop=center', // ginger
  'https://images.unsplash.com/photo-1599735894046-a50c98c8ceeb?w=400&h=400&fit=crop&crop=center', // plantain
  'https://images.unsplash.com/photo-1505253213348-cd54c92b37ef?w=400&h=400&fit=crop&crop=center', // meat
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center', // fish
  'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&h=400&fit=crop&crop=center', // peppers
  'https://images.unsplash.com/photo-1516595080664-ed2fc6a32937?w=400&h=400&fit=crop&crop=center', // yam
  'https://images.unsplash.com/photo-1558345558-dc045a3b0e66?w=400&h=400&fit=crop&crop=center', // cassava
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=400&fit=crop&crop=center', // coconut
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop&crop=center', // palm oil
  'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop&crop=center', // flour
  'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=400&fit=crop&crop=center', // curry
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop&crop=center', // jollof rice
  'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop&crop=center', // spice bottles
  'https://images.unsplash.com/photo-1596395608242-e1c7b1c9a0a2?w=400&h=400&fit=crop&crop=center', // tea bags
  'https://images.unsplash.com/photo-1563822249548-7a72b2ff6908?w=400&h=400&fit=crop&crop=center', // sauce bottles
  'https://images.unsplash.com/photo-1577003833619-76bbd1788912?w=400&h=400&fit=crop&crop=center', // canned goods
  'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&h=400&fit=crop&crop=center', // rice grains
  'https://images.unsplash.com/photo-1580655653885-65763b2597d0?w=400&h=400&fit=crop&crop=center', // cooking ingredients
  'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&h=400&fit=crop&crop=center', // dry spices
  'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400&h=400&fit=crop&crop=center', // honey
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center', // ginger tea
  'https://images.unsplash.com/photo-1597318985131-842f24432fc6?w=400&h=400&fit=crop&crop=center', // fresh fish
  'https://images.unsplash.com/photo-1583352014036-7c6b6e1bd789?w=400&h=400&fit=crop&crop=center', // seasoning mix
  'https://images.unsplash.com/photo-1597772516264-63f2c9ce7d7a?w=400&h=400&fit=crop&crop=center', // cooking oil
  'https://images.unsplash.com/photo-1566207274740-52b3a61b3e15?w=400&h=400&fit=crop&crop=center', // soy sauce
  'https://images.unsplash.com/photo-1582569704574-33aff6a60b3e?w=400&h=400&fit=crop&crop=center', // barbecue sauce
  'https://images.unsplash.com/photo-1594992244741-4c45cd10e4d0?w=400&h=400&fit=crop&crop=center', // coconut milk
  'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=400&h=400&fit=crop&crop=center', // kidney beans
  'https://images.unsplash.com/photo-1586185777020-5a5b09c05b83?w=400&h=400&fit=crop&crop=center', // green peas
  'https://images.unsplash.com/photo-1598662906851-85b659e8b22c?w=400&h=400&fit=crop&crop=center', // vanilla extract
  'https://images.unsplash.com/photo-1567093322506-331ba65d8a66?w=400&h=400&fit=crop&crop=center', // hot sauce
  'https://images.unsplash.com/photo-1506076077620-b4d05b8b6c52?w=400&h=400&fit=crop&crop=center'  // thyme herbs
]

async function getAllProducts() {
  let allProducts = []
  let offset = 0
  const limit = 50
  
  while (true) {
    console.log(`📡 Fetching products (offset: ${offset})...`)
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/products?select=id,name,images&limit=${limit}&offset=${offset}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const products = await response.json()
    
    if (products.length === 0) {
      break // No more products
    }
    
    allProducts = allProducts.concat(products)
    offset += limit
    
    console.log(`📦 Found ${products.length} products in this batch (total: ${allProducts.length})`)
  }
  
  return allProducts
}

async function updateProductImages() {
  try {
    console.log('📊 Getting all products...')
    const allProducts = await getAllProducts()
    
    console.log(`\n📦 Total products found: ${allProducts.length}`)
    
    // Filter products that need image updates (have relative paths)
    const productsNeedingUpdate = allProducts.filter(product => {
      return product.images && 
             product.images.length > 0 && 
             product.images[0].startsWith('/')
    })
    
    console.log(`🔧 Products needing image updates: ${productsNeedingUpdate.length}`)
    
    let successCount = 0
    let errorCount = 0

    // Update each product with a working image
    for (let i = 0; i < productsNeedingUpdate.length; i++) {
      const product = productsNeedingUpdate[i]
      const imageUrl = workingImages[i % workingImages.length]
      
      console.log(`🔄 [${i + 1}/${productsNeedingUpdate.length}] Updating "${product.name}"...`)
      
      try {
        const updateResponse = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            images: [imageUrl]
          })
        })

        if (updateResponse.ok) {
          console.log(`✅ Updated "${product.name}"`)
          successCount++
        } else {
          console.log(`❌ Failed to update "${product.name}": ${updateResponse.status}`)
          errorCount++
        }
      } catch (error) {
        console.log(`❌ Error updating "${product.name}": ${error.message}`)
        errorCount++
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`\n🎉 Image update complete!`)
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📊 Total processed: ${successCount + errorCount}`)
    console.log('\n✨ All product images should now be visible on the store!')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the update
updateProductImages()
  .then(() => {
    console.log('🏁 Script completed')
  })
  .catch((error) => {
    console.error('💥 Script failed:', error)
  })

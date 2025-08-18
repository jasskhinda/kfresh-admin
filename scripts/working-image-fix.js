#!/usr/bin/env node

// Final working solution - use reliable Unsplash images
console.log('🚀 Starting final image fix with working URLs...')

const supabaseUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTg3ODUsImV4cCI6MjA3MDE3NDc4NX0.RJ_j7zhHBSd8IErQckTARA9fOmMmb2xelQ_2HQRjUgM'

// Working Unsplash food and product images
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
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop&crop=center'  // jollof rice
]

async function updateProductImages() {
  try {
    console.log('📡 Making API request to update products...')
    
    // Get products that need images
    const response = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,images&limit=20`, {
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
    console.log(`📦 Found ${products.length} products`)

    let successCount = 0

    // Update each product with a working image
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      const imageUrl = workingImages[i % workingImages.length]
      
      console.log(`🔄 Updating "${product.name}"...`)
      
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
      }
    }

    console.log(`\n🎉 Successfully updated ${successCount}/${products.length} products`)
    console.log('\n✨ Product images should now be visible on the store!')
    
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

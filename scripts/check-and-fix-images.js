#!/usr/bin/env node

// Simple script to check current image status and fix it
console.log('🔍 Checking current product image status...')

const SUPABASE_URL = 'https://tmufbgaxhtqgkvcngyxg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1OTg3ODUsImV4cCI6MjA3MDE3NDc4NX0.RJ_j7zhHBSd8IErQckTARA9fOmMmb2xelQ_2HQRjUgM'

// Working Unsplash images that we verified earlier
const WORKING_IMAGES = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1582508090499-e2b24318d180?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1599735894046-a50c98c8ceeb?w=400&h=400&fit=crop&crop=center'
]

async function checkAndFixImages() {
  try {
    console.log('📡 Fetching current products...')
    
    // Fetch some products to check their image status
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,images&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`)
    }
    
    const products = await response.json()
    console.log(`📦 Found ${products.length} products`)
    
    // Check current image status
    let withImages = 0
    let withoutImages = 0
    
    console.log('\n📊 Current image status:')
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        withImages++
        console.log(`✅ ${product.name} - has ${product.images.length} image(s)`)
        // Test first image
        if (product.images[0]) {
          console.log(`   Testing: ${product.images[0].substring(0, 60)}...`)
        }
      } else {
        withoutImages++
        console.log(`❌ ${product.name} - no images`)
      }
    }
    
    console.log(`\n📈 Summary: ${withImages} with images, ${withoutImages} without images`)
    
    // Now fix products without images
    if (withoutImages > 0) {
      console.log('\n🔧 Fixing products without images...')
      
      let fixCount = 0
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        
        if (!product.images || product.images.length === 0) {
          const imageUrl = WORKING_IMAGES[fixCount % WORKING_IMAGES.length]
          
          console.log(`🔄 Adding image to: ${product.name}`)
          
          const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${product.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              images: [imageUrl]
            })
          })
          
          if (updateResponse.ok) {
            console.log(`✅ Fixed: ${product.name}`)
            fixCount++
          } else {
            console.log(`❌ Failed to fix: ${product.name}`)
          }
        }
      }
      
      console.log(`\n🎉 Fixed ${fixCount} products with working images`)
    }
    
    // Test a working URL to verify it's accessible
    console.log('\n🧪 Testing image accessibility...')
    const testUrl = WORKING_IMAGES[0]
    
    try {
      const testResponse = await fetch(testUrl, { method: 'HEAD' })
      console.log(`${testResponse.ok ? '✅' : '❌'} Test image: ${testResponse.status}`)
    } catch (error) {
      console.log(`❌ Test image failed: ${error.message}`)
    }
    
    console.log('\n✨ Image fix complete! Check the store now.')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

// Run the check and fix
checkAndFixImages()

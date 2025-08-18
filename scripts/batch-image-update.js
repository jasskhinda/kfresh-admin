#!/usr/bin/env node

console.log('🚀 Starting batch image update...')

const { execSync } = require('child_process')

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWZiZ2F4aHRxZ2t2Y25neXhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU5ODc4NSwiZXhwIjoyMDcwMTc0Nzg1fQ.85Mj1j1tPayE8L-ChJ0qXBjI64e5UTsPSMB17AniNq4'
const SUPABASE_URL = 'https://tmufbgaxhtqgkvcngyxg.supabase.co'

// Working Unsplash images for products
const images = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=center', // orange/mango juice
  'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=400&h=400&fit=crop&crop=center', // ginger/pineapple
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center', // tropical fruits
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=400&fit=crop&crop=center', // fruit juice
  'https://images.unsplash.com/photo-1582508090499-e2b24318d180?w=400&h=400&fit=crop&crop=center', // peach/fruit
  'https://images.unsplash.com/photo-1599735894046-a50c98c8ceeb?w=400&h=400&fit=crop&crop=center', // guava/tropical
  'https://images.unsplash.com/photo-1598662906851-85b659e8b22c?w=400&h=400&fit=crop&crop=center', // vanilla extract
  'https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=400&h=400&fit=crop&crop=center', // mixed essence/spices
  'https://images.unsplash.com/photo-1598662906851-85b659e8b22c?w=400&h=400&fit=crop&crop=center', // vanilla extract
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center'  // adobo seasoning
]

function updateProduct(productId, imageUrl, productName) {
  try {
    const command = `curl -X PATCH -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" -H "apikey: ${SERVICE_ROLE_KEY}" -H "Content-Type: application/json" -H "Prefer: return=minimal" -d '{"images":["${imageUrl}"]}' "${SUPABASE_URL}/rest/v1/products?id=eq.${productId}"`
    
    execSync(command, { stdio: 'pipe' })
    console.log(`✅ Updated "${productName}"`)
    return true
  } catch (error) {
    console.log(`❌ Failed to update "${productName}": ${error.message}`)
    return false
  }
}

// Get all products with relative image paths
function getAllProducts() {
  try {
    const command = `curl -s -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" -H "apikey: ${SERVICE_ROLE_KEY}" "${SUPABASE_URL}/rest/v1/products?select=id,name,images&limit=100"`
    
    const result = execSync(command, { encoding: 'utf8' })
    const products = JSON.parse(result)
    
    // Filter products that need updates (have relative paths)
    return products.filter(product => {
      return product.images && 
             product.images.length > 0 && 
             product.images[0].startsWith('/')
    })
  } catch (error) {
    console.error('❌ Error fetching products:', error.message)
    return []
  }
}

async function main() {
  console.log('📡 Getting products that need image updates...')
  
  const productsToUpdate = getAllProducts()
  console.log(`🔧 Found ${productsToUpdate.length} products needing updates`)
  
  if (productsToUpdate.length === 0) {
    console.log('✅ No products need image updates!')
    return
  }

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < productsToUpdate.length; i++) {
    const product = productsToUpdate[i]
    const imageUrl = images[i % images.length]
    
    console.log(`🔄 [${i + 1}/${productsToUpdate.length}] Updating "${product.name}"...`)
    
    const success = updateProduct(product.id, imageUrl, product.name)
    
    if (success) {
      successCount++
    } else {
      errorCount++
    }
    
    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log(`\n🎉 Batch update complete!`)
  console.log(`✅ Successfully updated: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📊 Total processed: ${successCount + errorCount}`)
  console.log('\n✨ All product images should now be visible on the store!')
}

main().catch(console.error)

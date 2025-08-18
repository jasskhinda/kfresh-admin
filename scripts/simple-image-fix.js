#!/usr/bin/env node

console.log('🚀 Starting simplified image fix...')

const https = require('https')
const fs = require('fs')
const path = require('path')

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found')
  }

  const envFileContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}

  envFileContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    }
  })

  return envVars
}

const env = loadEnvFile()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

console.log('Environment loaded successfully')

// Working Unsplash food images
const workingImages = [
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400&h=400&fit=crop&crop=center'
]

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    console.log(`Making ${options.method} request to ${options.hostname}${options.path}`)
    
    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
        console.log(`Response status: ${res.statusCode}`)
        try {
          const parsedData = JSON.parse(responseData)
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          })
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          })
        }
      })
    })

    req.on('error', (error) => {
      console.error('Request error:', error.message)
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function updateProductImages() {
  try {
    console.log('📡 Getting products that need image updates...')
    
    // Get products with relative image paths
    const getProductsOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/products?select=id,name,images&limit=20',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const { data: products, statusCode } = await makeRequest(getProductsOptions)
    
    if (statusCode !== 200) {
      console.error(`Failed to fetch products: HTTP ${statusCode}`)
      console.error('Response:', products)
      return
    }
    
    console.log(`📦 Found ${products.length} products`)
    
    // Filter products that need image updates (have relative paths starting with '/')
    const productsNeedingUpdate = products.filter(product => {
      return product.images && 
             product.images.length > 0 && 
             product.images[0].startsWith('/')
    })
    
    console.log(`🔧 Products needing image updates: ${productsNeedingUpdate.length}`)
    
    if (productsNeedingUpdate.length === 0) {
      console.log('✅ No products need image updates!')
      return
    }

    let successCount = 0
    let errorCount = 0

    // Update first 5 products for testing
    const testProducts = productsNeedingUpdate.slice(0, 5)
    
    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i]
      const imageUrl = workingImages[i % workingImages.length]
      
      console.log(`🔄 [${i + 1}/${testProducts.length}] Updating "${product.name}"...`)
      console.log(`   Old image: ${product.images[0]}`)
      console.log(`   New image: ${imageUrl}`)
      
      try {
        const updateOptions = {
          hostname: supabaseUrl.replace('https://', ''),
          path: `/rest/v1/products?id=eq.${product.id}`,
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        }

        const updateData = {
          images: [imageUrl]
        }

        const { statusCode: updateStatus } = await makeRequest(updateOptions, updateData)

        if (updateStatus === 204 || updateStatus === 200) {
          console.log(`✅ Successfully updated "${product.name}"`)
          successCount++
        } else {
          console.log(`❌ Failed to update "${product.name}": HTTP ${updateStatus}`)
          errorCount++
        }
      } catch (error) {
        console.log(`❌ Error updating "${product.name}": ${error.message}`)
        errorCount++
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log(`\n🎉 Update complete!`)
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`❌ Failed: ${errorCount}`)
    console.log(`📊 Total processed: ${successCount + errorCount}`)
    
  } catch (error) {
    console.error('❌ Error in updateProductImages:', error.message)
    console.error(error.stack)
  }
}

// Run the update
console.log('Starting image update process...')
updateProductImages()
  .then(() => {
    console.log('🏁 Script completed')
  })
  .catch((error) => {
    console.error('💥 Script failed:', error.message)
    console.error(error.stack)
  })

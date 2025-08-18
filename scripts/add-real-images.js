#!/usr/bin/env node

/**
 * Script to add real product images from storage bucket to products
 * Run with: node scripts/add-real-images.js
 */

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

// Helper function to make HTTPS requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = ''
      
      res.on('data', (chunk) => {
        responseData += chunk
      })
      
      res.on('end', () => {
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
      reject(error)
    })

    if (data) {
      req.write(JSON.stringify(data))
    }
    
    req.end()
  })
}

async function addRealImagesToProducts() {
  console.log('🖼️ Adding real product images from storage...')
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing environment variables!')
    console.error('Ensure .env.local contains NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY
  
  try {
    // First, get the list of files in the storage bucket
    console.log('📋 Getting files from product-images bucket...')
    
    const listFilesOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/storage/v1/object/list/product-images/products',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const { data: files } = await makeRequest(listFilesOptions, {})
    
    if (!files || files.length === 0) {
      console.log('📁 No files found in storage bucket')
      return
    }

    console.log(`📷 Found ${files.length} files in storage:`)
    files.forEach(file => {
      console.log(`   - ${file.name}`)
    })

    // Get products from database
    console.log('📦 Getting products from database...')
    
    const getProductsOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/products?select=id,name,slug,images&limit=10',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const { data: products } = await makeRequest(getProductsOptions)
    
    if (!products || products.length === 0) {
      console.log('❌ No products found in database')
      return
    }

    console.log(`📦 Found ${products.length} products`)

    // Create real image URLs from storage
    const realImageUrls = files.map(file => 
      `${supabaseUrl}/storage/v1/object/public/product-images/products/${file.name}`
    )

    // Update first few products with real images
    for (let i = 0; i < Math.min(products.length, files.length); i++) {
      const product = products[i]
      const imageUrl = realImageUrls[i]
      
      console.log(`🔄 Updating ${product.name} with image: ${imageUrl}`)
      
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

      // Create image array with the real image
      const imageArray = [imageUrl]
      
      await makeRequest(updateOptions, { images: imageArray })
      console.log(`✅ Updated ${product.name}`)
    }

    // Also update the earthern-ware-apotowewa product specifically if it exists
    console.log('🔍 Looking for earthern-ware-apotowewa product...')
    
    const specificProductOptions = {
      hostname: supabaseUrl.replace('https://', ''),
      path: '/rest/v1/products?slug=eq.earthern-ware-apotowewa&select=id,name,slug',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      }
    }

    const { data: specificProducts } = await makeRequest(specificProductOptions)
    
    if (specificProducts && specificProducts.length > 0) {
      const specificProduct = specificProducts[0]
      console.log(`✅ Found ${specificProduct.name}`)
      
      // Use first image for this product
      const updateSpecificOptions = {
        hostname: supabaseUrl.replace('https://', ''),
        path: `/rest/v1/products?id=eq.${specificProduct.id}`,
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }

      await makeRequest(updateSpecificOptions, { 
        images: [realImageUrls[0], realImageUrls[1] || realImageUrls[0]] 
      })
      console.log(`✅ Updated ${specificProduct.name} with real images`)
    }
    
    console.log('\n🎉 Real image update complete!')
    console.log('🔗 Test URLs:')
    console.log('   Store: https://kfresh-store.vercel.app/products')
    console.log('   Admin: http://localhost:3010/debug-images')

  } catch (error) {
    console.error('❌ Error:', error.error || error.message || error)
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode)
    }
  }
}

// Run the script
addRealImagesToProducts().catch(console.error)

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  slug: string
  images: any[]
  price: number
  stock_quantity: number
  is_available: boolean
}

export default function DebugImageDisplayPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [dbResults, setDbResults] = useState<string[]>([])

  useEffect(() => {
    debugDatabase()
  }, [])

  const addLog = (message: string) => {
    setDbResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const debugDatabase = async () => {
    addLog('🔍 Starting database investigation...')
    
    try {
      const supabase = createClient()

      // Test 1: Check if we can connect to products table
      addLog('📊 Testing database connection...')
      const { data: countData, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact' })

      if (countError) {
        addLog(`❌ Database connection failed: ${countError.message}`)
        return
      } else {
        addLog(`✅ Database connected. Found ${countData?.length || 0} products total`)
      }

      // Test 2: Get products with images
      addLog('🖼️ Fetching products with images...')
      const { data: productsWithImages, error: imagesError } = await supabase
        .from('products')
        .select('id, name, slug, images, price, stock_quantity, is_available')
        .not('images', 'is', null)

      if (imagesError) {
        addLog(`❌ Failed to fetch products with images: ${imagesError.message}`)
      } else {
        addLog(`📦 Found ${productsWithImages?.length || 0} products with images field not null`)
        
        // Check which ones actually have image arrays
        const validImageProducts = productsWithImages?.filter(p => 
          p.images && Array.isArray(p.images) && p.images.length > 0
        ) || []
        
        addLog(`✅ Found ${validImageProducts.length} products with actual image arrays`)
        setProducts(validImageProducts as Product[])

        // Log first few products
        validImageProducts.slice(0, 3).forEach((product, index) => {
          addLog(`   ${index + 1}. ${product.name}: ${product.images?.length || 0} images`)
          if (product.images && product.images.length > 0) {
            addLog(`      Featured: ${product.images[0]}`)
          }
        })
      }

      // Test 3: Get all available products (what store sees)
      addLog('🛒 Testing what store app would see...')
      const { data: storeProducts, error: storeError } = await supabase
        .from('products')
        .select('id, name, slug, description, price, compare_price, images, stock_quantity, is_featured, unit, brand, sku, category_id, is_cooked, is_available')
        .eq('is_available', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (storeError) {
        addLog(`❌ Store query failed: ${storeError.message}`)
      } else {
        addLog(`🛍️ Store would see ${storeProducts?.length || 0} available products`)
        
        const storeProductsWithImages = storeProducts?.filter(p => 
          p.images && Array.isArray(p.images) && p.images.length > 0
        ) || []
        
        addLog(`📷 Of those, ${storeProductsWithImages.length} have images`)
      }

      // Test 4: Try specific product (earthern-ware-apotowewa)
      addLog('🔍 Looking for specific product: earthern-ware-apotowewa...')
      const { data: specificProduct, error: specificError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', 'earthern-ware-apotowewa')
        .single()

      if (specificError) {
        addLog(`❌ Specific product not found: ${specificError.message}`)
      } else {
        addLog(`✅ Found earthern-ware-apotowewa product`)
        addLog(`   ID: ${specificProduct.id}`)
        addLog(`   Available: ${specificProduct.is_available}`)
        addLog(`   Images: ${JSON.stringify(specificProduct.images)}`)
        addLog(`   Stock: ${specificProduct.stock_quantity}`)
      }

    } catch (error) {
      addLog(`💥 Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testImageUrl = async (imageUrl: string) => {
    addLog(`🧪 Testing image URL: ${imageUrl}`)
    
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (response.ok) {
        addLog(`   ✅ Image accessible (${response.status})`)
      } else {
        addLog(`   ❌ Image not accessible (${response.status})`)
      }
    } catch (error) {
      addLog(`   💥 Image test failed: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🔍 Database Image Investigation</h1>
        <p className="text-gray-600">
          Debugging why product images are not appearing on the store site.
        </p>
      </div>

      {/* Database Debug Console */}
      <div className="bg-black text-green-400 p-6 rounded-lg mb-8">
        <h2 className="text-white text-xl mb-4">Database Debug Console</h2>
        <div className="font-mono text-sm max-h-64 overflow-y-auto">
          {dbResults.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))}
          {loading && <div className="animate-pulse">🔄 Investigating...</div>}
        </div>
        <button
          onClick={() => {
            setDbResults([])
            debugDatabase()
          }}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          🔄 Re-run Investigation
        </button>
      </div>

      {/* Products Found */}
      {products.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Products with Images Found</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 bg-white shadow">
                <h3 className="font-semibold mb-2 text-lg">{product.name}</h3>
                <div className="text-sm text-gray-600 mb-4 space-y-1">
                  <p>Slug: {product.slug}</p>
                  <p>Price: ${product.price}</p>
                  <p>Stock: {product.stock_quantity}</p>
                  <p>Available: {product.is_available ? 'Yes' : 'No'}</p>
                  <p>Images: {product.images?.length || 0}</p>
                </div>

                {product.images && product.images.length > 0 && (
                  <div className="space-y-4">
                    {/* Featured Image */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Featured Image:</p>
                      <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          onError={() => addLog(`❌ Failed to load image: ${product.images[0]}`)}
                          onLoad={() => addLog(`✅ Successfully loaded: ${product.name} featured image`)}
                        />
                      </div>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                        <p className="text-gray-600 break-all mb-2">{product.images[0]}</p>
                        <div className="space-x-2">
                          <button
                            onClick={() => testImageUrl(product.images[0])}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                          >
                            Test URL
                          </button>
                          <a
                            href={product.images[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs inline-block"
                          >
                            Open Direct
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Additional Images */}
                    {product.images.length > 1 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Gallery ({product.images.length - 1} more):</p>
                        <div className="grid grid-cols-3 gap-2">
                          {product.images.slice(1).map((imageUrl, index) => (
                            <div key={index} className="relative w-full h-20 bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={imageUrl}
                                alt={`${product.name} ${index + 2}`}
                                fill
                                className="object-cover"
                                onError={() => addLog(`❌ Gallery image failed: ${imageUrl}`)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="https://kfresh-store.vercel.app/products"
          target="_blank"
          className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
        >
          🛒 View Store
        </a>
        <a
          href="https://kfresh-store.vercel.app/products/earthern-ware-apotowewa"
          target="_blank"
          className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
        >
          🔍 Specific Product
        </a>
        <a
          href="/products"
          className="bg-orange-600 text-white px-4 py-2 rounded text-center hover:bg-orange-700"
        >
          ⚙️ Admin Products
        </a>
        <a
          href="https://supabase.com/dashboard/project/tmufbgaxhtqgkvcngyxg/editor"
          target="_blank"
          className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
        >
          🗄️ Database
        </a>
      </div>
    </div>
  )
}

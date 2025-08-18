'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  images: string[]
  price: number
}

export default function TestAuthAndImagesPage() {
  const { user, profile, isAdmin } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    testAll()
  }, [])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result])
  }

  const testAll = async () => {
    addResult('🧪 Starting comprehensive test...')
    
    // Test 1: Authentication
    addResult('📋 Test 1: Authentication Status')
    addResult(`   User: ${user ? '✅ Logged in' : '❌ Not logged in'}`)
    addResult(`   Profile: ${profile ? '✅ Profile loaded' : '❌ No profile'}`)
    addResult(`   Admin: ${isAdmin ? '✅ Is admin' : '❌ Not admin'}`)
    if (profile) {
      addResult(`   Name: ${profile.first_name} ${profile.last_name}`)
      addResult(`   Email: ${profile.email}`)
      addResult(`   Role: ${profile.role}`)
    }

    // Test 2: Database connection
    addResult('📋 Test 2: Database Connection')
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images, price')
        .not('images', 'is', null)
        .limit(5)

      if (error) {
        addResult(`   ❌ Database error: ${error.message}`)
      } else {
        addResult(`   ✅ Database connected, found ${data?.length || 0} products with images`)
        setProducts(data || [])
      }
    } catch (error) {
      addResult(`   ❌ Database connection failed: ${error}`)
    }

    // Test 3: Storage bucket access
    addResult('📋 Test 3: Storage Bucket Access')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('products', { limit: 5 })

      if (error) {
        addResult(`   ❌ Storage error: ${error.message}`)
      } else {
        addResult(`   ✅ Storage accessible, found ${data?.length || 0} files`)
      }
    } catch (error) {
      addResult(`   ❌ Storage access failed: ${error}`)
    }

    setLoading(false)
  }

  const testImageUrl = (imageUrl: string) => {
    addResult(`🖼️ Testing image: ${imageUrl}`)
    
    // Test if URL is accessible
    fetch(imageUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          addResult(`   ✅ Image accessible (${response.status})`)
        } else {
          addResult(`   ❌ Image not accessible (${response.status})`)
        }
      })
      .catch(error => {
        addResult(`   ❌ Image fetch failed: ${error}`)
      })
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🧪 Authentication & Images Test</h1>
        <p className="text-gray-600">
          Testing all authentication and image functionality after database fixes.
        </p>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-64 overflow-y-auto">
          {testResults.map((result, index) => (
            <div key={index}>{result}</div>
          ))}
          {loading && <div className="animate-pulse">Running tests...</div>}
        </div>
        <button
          onClick={() => {
            setTestResults([])
            testAll()
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🔄 Re-run Tests
        </button>
      </div>

      {/* Products with Images */}
      {products.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Products with Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 bg-white">
                <h3 className="font-semibold mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Price: ${product.price} | Images: {product.images?.length || 0}
                </p>

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
                          onError={() => addResult(`❌ Failed to load: ${product.images[0]}`)}
                          onLoad={() => addResult(`✅ Loaded: ${product.name} image`)}
                        />
                      </div>
                      <div className="mt-2 p-2 bg-gray-100 rounded">
                        <p className="text-xs text-gray-600 break-all">{product.images[0]}</p>
                        <button
                          onClick={() => testImageUrl(product.images[0])}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded mt-1"
                        >
                          Test URL
                        </button>
                        <a
                          href={product.images[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded mt-1 ml-2 inline-block"
                        >
                          Open Direct
                        </a>
                      </div>
                    </div>

                    {/* Gallery Images */}
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
                                onError={() => addResult(`❌ Gallery failed: ${imageUrl}`)}
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

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="/"
          className="bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700"
        >
          🏠 Dashboard
        </a>
        <a
          href="https://kfresh-store.vercel.app"
          target="_blank"
          className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
        >
          🛒 Store App
        </a>
        <a
          href="https://kfresh-store.vercel.app/products"
          target="_blank"
          className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
        >
          📦 Store Products
        </a>
        <a
          href="/products"
          className="bg-orange-600 text-white px-4 py-2 rounded text-center hover:bg-orange-700"
        >
          ⚙️ Admin Products
        </a>
      </div>
    </div>
  )
}

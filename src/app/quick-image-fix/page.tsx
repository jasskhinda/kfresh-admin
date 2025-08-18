'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function QuickImageFixPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const addImageToEarthenware = async () => {
    setLoading(true)
    setResult('')

    try {
      const supabase = createClient()

      // Create the real image URL from your storage bucket
      const realImageUrl = 'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/0c0a5100-012a-49a6-861f-4cffabd702b0_1737142527142_wl9a3y.webp'

      // First, check if the earthern-ware-apotowewa product exists
      const { data: product, error: findError } = await supabase
        .from('products')
        .select('*')
        .eq('slug', 'earthern-ware-apotowewa')
        .single()

      if (findError) {
        setResult(`❌ Product not found: ${findError.message}`)
        return
      }

      setResult(`✅ Found product: ${product.name}`)

      // Update it with the real image
      const { data, error } = await supabase
        .from('products')
        .update({ 
          images: [realImageUrl],
          is_available: true,
          stock_quantity: 10
        })
        .eq('id', product.id)
        .select()

      if (error) {
        setResult(prev => prev + `\n❌ Update failed: ${error.message}`)
      } else {
        setResult(prev => prev + `\n✅ Updated product with image: ${realImageUrl}`)
        setResult(prev => prev + `\n📦 Updated product data: ${JSON.stringify(data[0], null, 2)}`)
      }

    } catch (error) {
      setResult(`💥 Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const addImagesToMultipleProducts = async () => {
    setLoading(true)
    setResult('')

    try {
      const supabase = createClient()

      // Real image URLs from your storage bucket
      const realImageUrls = [
        'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/0c0a5100-012a-49a6-861f-4cffabd702b0_1737142527142_wl9a3y.webp',
        'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/f6c0ac6a-61ca-4329-bf25-f6ad2d8ad066_1737142527142_wl9a3y.webp',
      ]

      setResult('📦 Getting first 5 products...')

      // Get first 5 products
      const { data: products, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .limit(5)

      if (fetchError) {
        setResult(`❌ Failed to fetch products: ${fetchError.message}`)
        return
      }

      setResult(prev => prev + `\n✅ Found ${products.length} products`)

      // Update each product with images
      for (let i = 0; i < products.length; i++) {
        const product = products[i]
        const imageUrl = realImageUrls[i % realImageUrls.length] // Cycle through images

        setResult(prev => prev + `\n🔄 Updating ${product.name}...`)

        const { data, error } = await supabase
          .from('products')
          .update({ 
            images: [imageUrl],
            is_available: true,
            stock_quantity: product.stock_quantity || 10
          })
          .eq('id', product.id)
          .select()

        if (error) {
          setResult(prev => prev + `\n  ❌ Failed: ${error.message}`)
        } else {
          setResult(prev => prev + `\n  ✅ Updated: ${product.name}`)
        }
      }

      setResult(prev => prev + `\n\n🎉 All products updated!`)
      setResult(prev => prev + `\n🔗 Test at: https://kfresh-store.vercel.app/products`)

    } catch (error) {
      setResult(`💥 Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testImageAccess = async () => {
    setLoading(true)
    setResult('')

    const testUrls = [
      'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/0c0a5100-012a-49a6-861f-4cffabd702b0_1737142527142_wl9a3y.webp',
      'https://tmufbgaxhtqgkvcngyxg.supabase.co/storage/v1/object/public/product-images/products/f6c0ac6a-61ca-4329-bf25-f6ad2d8ad066_1737142527142_wl9a3y.webp'
    ]

    for (const url of testUrls) {
      setResult(prev => prev + `\n🧪 Testing: ${url}`)
      
      try {
        const response = await fetch(url, { method: 'HEAD' })
        if (response.ok) {
          setResult(prev => prev + `\n  ✅ Accessible (${response.status})`)
        } else {
          setResult(prev => prev + `\n  ❌ Not accessible (${response.status})`)
        }
      } catch (error) {
        setResult(prev => prev + `\n  💥 Test failed: ${error}`)
      }
    }

    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🚀 Quick Image Fix</h1>
        <p className="text-gray-600">
          Let's add real images to products so they show up on the store site.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={addImageToEarthenware}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          🎯 Fix Earthenware Product
        </button>
        
        <button
          onClick={addImagesToMultipleProducts}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          📦 Fix Multiple Products
        </button>

        <button
          onClick={testImageAccess}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          🧪 Test Image URLs
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-black text-green-400 p-6 rounded-lg">
          <h2 className="text-white text-lg mb-4">Results:</h2>
          <pre className="font-mono text-sm whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="https://kfresh-store.vercel.app/products"
          target="_blank"
          className="bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700"
        >
          🛒 Store Products
        </a>
        <a
          href="https://kfresh-store.vercel.app/products/earthern-ware-apotowewa"
          target="_blank"
          className="bg-purple-600 text-white px-4 py-2 rounded text-center hover:bg-purple-700"
        >
          🔍 Earthenware Page
        </a>
        <a
          href="/products"
          className="bg-orange-600 text-white px-4 py-2 rounded text-center hover:bg-orange-700"
        >
          ⚙️ Admin Products
        </a>
        <a
          href="/debug-images"
          className="bg-gray-600 text-white px-4 py-2 rounded text-center hover:bg-gray-700"
        >
          🔍 Debug Page
        </a>
      </div>
    </div>
  )
}

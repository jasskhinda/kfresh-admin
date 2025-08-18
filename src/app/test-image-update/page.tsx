'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestImageUpdatePage() {
  const [productId, setProductId] = useState('0c0a5100-012a-49a6-861f-4cffabd702b0')
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const updateProductImage = async () => {
    if (!productId || !imageUrl) return

    setLoading(true)
    setResult('')

    try {
      const supabase = createClient()
      
      // First get current product data
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .single()

      if (fetchError) {
        setResult(`Error fetching product: ${fetchError.message}`)
        return
      }

      // Add new image to existing images array
      const currentImages = currentProduct?.images || []
      const newImages = [...currentImages, imageUrl]

      // Update the product
      const { data, error } = await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', productId)
        .select()

      if (error) {
        setResult(`Error updating product: ${error.message}`)
      } else {
        setResult(`Success! Updated product with ${newImages.length} images`)
        console.log('Updated product:', data)
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const clearImages = async () => {
    if (!productId) return

    setLoading(true)
    setResult('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .update({ images: [] })
        .eq('id', productId)
        .select()

      if (error) {
        setResult(`Error clearing images: ${error.message}`)
      } else {
        setResult('Success! Cleared all images')
      }
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Image Update</h1>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium mb-1">Product ID:</label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image URL:</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={updateProductImage}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Add Image'}
          </button>
          
          <button
            onClick={clearImages}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
          >
            Clear Images
          </button>
        </div>

        {result && (
          <div className={`p-3 rounded ${
            result.includes('Success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {result}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Test Links:</h2>
        <div className="space-y-2">
          <div>
            <a 
              href={`/debug-product`}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              → Debug Product Data
            </a>
          </div>
          <div>
            <a 
              href="https://kfresh-admin.vercel.app/products"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              → Admin Products List
            </a>
          </div>
          <div>
            <a 
              href="https://kfresh-store.vercel.app/products"
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              → Store Products List
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
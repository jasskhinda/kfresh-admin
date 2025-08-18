'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DebugProductPage() {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [productId, setProductId] = useState('0c0a5100-012a-49a6-861f-4cffabd702b0')

  const fetchProduct = async () => {
    if (!productId) return
    
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) {
        console.error('Error:', error)
        setProduct({ error: error.message })
      } else {
        console.log('Product data:', data)
        setProduct(data)
      }
    } catch (error) {
      console.error('Error:', error)
      setProduct({ error: 'Failed to fetch product' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Product Debug</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Product ID:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
            placeholder="Enter product ID"
          />
          <button
            onClick={fetchProduct}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Product'}
          </button>
        </div>
      </div>

      {product && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Product Data:</h2>
          <pre className="text-xs overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(product, null, 2)}
          </pre>
          
          {product.images && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Images ({product.images?.length || 0}):</h3>
              {product.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((url: string, index: number) => (
                    <div key={index} className="border rounded p-2">
                      <p className="text-xs text-gray-600 mb-1 truncate">{url}</p>
                      <img
                        src={url}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.border = '2px solid red'
                          target.alt = 'Failed to load'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No images found</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
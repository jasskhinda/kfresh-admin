'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  images: any[]
}

export default function TestImagesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images')
        .not('images', 'is', null)
        .limit(10)

      if (error) {
        console.error('Error:', error)
      } else {
        console.log('Products with images:', data)
        setProducts(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Image Test Page</h1>
      
      <div className="mb-6">
        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Products
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Images: {product.images?.length || 0}
            </p>
            
            {product.images && product.images.length > 0 ? (
              <div className="space-y-2">
                {product.images.map((imageUrl, index) => (
                  <div key={index} className="border rounded p-2">
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      {imageUrl}
                    </p>
                    <div className="w-full h-32 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/Kfreshplaceholder.webp'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No images</p>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products with images found</p>
        </div>
      )}
    </div>
  )
}
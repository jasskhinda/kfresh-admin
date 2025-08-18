'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

interface Product {
  id: string
  name: string
  images: any[]
  price: number
  stock_quantity: number
}

export default function TestImageDisplayPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, name, images, price, stock_quantity')
        .not('images', 'is', null)
        .limit(20)

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
    return (
      <div className="p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-center mt-4">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Image Display Test</h1>
        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Debug Info:</h3>
        <p className="text-sm text-blue-800">
          Products with images: {products.length}
        </p>
        <p className="text-sm text-blue-800">
          Total images: {products.reduce((acc, p) => acc + (p.images?.length || 0), 0)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedProduct(selectedProduct?.id === product.id ? null : product)}
          >
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              Price: ${product.price} | Stock: {product.stock_quantity}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Images: {product.images?.length || 0}
            </p>
            
            {/* Featured Image Preview */}
            {product.images && product.images.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1">Featured Image:</p>
                <div className="relative w-full h-32 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={product.images[0]}
                    alt={`${product.name} featured`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-red-500 text-xs">Failed to load</div>'
                      }
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                    ★ Featured
                  </div>
                  {product.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      +{product.images.length - 1}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Expanded Image Gallery */}
            {selectedProduct?.id === product.id && product.images && product.images.length > 1 && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">All Images:</p>
                <div className="grid grid-cols-2 gap-2">
                  {product.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <div className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-red-500 text-xs">Error</div>'
                            }
                          }}
                        />
                        <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white px-1 rounded text-xs">
                          {index === 0 ? 'Featured' : `#${index + 1}`}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate" title={imageUrl}>
                        {imageUrl}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No images state */}
            {(!product.images || product.images.length === 0) && (
              <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-500 text-sm">
                No images
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products with images found</p>
        </div>
      )}

      {/* Test Client App URL */}
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">Client App Test:</h3>
        <p className="text-sm text-green-800 mb-2">
          Test image display on the client store:
        </p>
        <div className="flex gap-2">
          <a
            href="http://localhost:3000/products"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          >
            View Store Products
          </a>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            View Store Homepage
          </a>
        </div>
      </div>
    </div>
  )
}

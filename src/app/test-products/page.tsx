'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    console.log('🔄 Testing products fetch...')
    try {
      const supabase = createClient()
      console.log('📡 Making direct Supabase query...')
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity')
        .limit(10)

      if (error) {
        console.error('❌ Supabase error:', error)
        setError(error.message)
      } else {
        console.log('✅ Success! Products:', data)
        setProducts(data || [])
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Products Page</h1>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading products...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Products Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <strong>Success!</strong> Found {products.length} products
      </div>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white border rounded p-4">
            <h3 className="font-bold">{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Stock: {product.stock_quantity}</p>
            <p className="text-gray-500 text-sm">ID: {product.id}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

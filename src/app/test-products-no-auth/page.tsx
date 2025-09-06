'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Filter,
  Download,
  Package 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  sku: string | null
  price: number
  compare_price: number | null
  stock_quantity: number
  is_available: boolean
  is_featured: boolean
  category_id: string | null
  images: any[]
  created_at: string
  updated_at: string
}

export default function TestProductsPageNoAuth() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    console.log('🔄 Starting fetchProducts...')
    try {
      const supabase = createClient()
      console.log('📡 Making Supabase query...')
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase error:', error)
        setError(error.message)
        setProducts(getMockProducts())
      } else {
        console.log('✅ Got products:', data?.length || 0)
        setProducts(data || [])
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setProducts(getMockProducts())
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products (No Auth Test)</h1>
              <p className="text-gray-600">Testing products page without authentication wrapper</p>
            </div>
            <Link
              href="/products/new"
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Active Products</p>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.is_available).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {products.filter(p => p.stock_quantity === 0).length}
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-900">Product</th>
                  <th className="text-left p-4 font-medium text-gray-900">SKU</th>
                  <th className="text-left p-4 font-medium text-gray-900">Price</th>
                  <th className="text-left p-4 font-medium text-gray-900">Stock</th>
                  <th className="text-left p-4 font-medium text-gray-900">Status</th>
                  <th className="text-left p-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity)
                  return (
                    <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name}</p>
                            {product.is_featured && (
                              <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{product.sku || '-'}</td>
                      <td className="p-4">
                        <div>
                          <span className="font-medium text-gray-900">{formatPrice(product.price)}</span>
                          {product.compare_price && product.compare_price > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.compare_price)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <span className={`font-medium ${stockStatus.color}`}>
                            {product.stock_quantity}
                          </span>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ml-2 ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.text}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          product.is_available ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_available ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-gray-600 hover:text-blue-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function getStockStatus(stock: number) {
  if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Out of stock' }
  if (stock <= 10) return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Low stock' }
  return { color: 'text-green-600', bg: 'bg-green-100', text: 'In stock' }
}

function getMockProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'Ghana Yam',
      slug: 'ghana-yam',
      sku: 'KF-GY-001',
      price: 5.99,
      compare_price: null,
      stock_quantity: 3,
      is_available: true,
      is_featured: true,
      category_id: '1',
      images: [],
      created_at: '2025-01-07T10:00:00Z',
      updated_at: '2025-01-07T10:00:00Z'
    },
    {
      id: '2',
      name: 'Jollof Rice (Ready to Eat)',
      slug: 'jollof-rice-ready',
      sku: 'KF-JR-001',
      price: 12.99,
      compare_price: 15.99,
      stock_quantity: 20,
      is_available: true,
      is_featured: true,
      category_id: '4',
      images: [],
      created_at: '2025-01-06T15:30:00Z',
      updated_at: '2025-01-07T09:15:00Z'
    },
    {
      id: '3',
      name: 'Fresh Ginger Root',
      slug: 'fresh-ginger-root',
      sku: 'KF-GR-001',
      price: 3.49,
      compare_price: null,
      stock_quantity: 8,
      is_available: true,
      is_featured: false,
      category_id: '1',
      images: [],
      created_at: '2025-01-05T12:20:00Z',
      updated_at: '2025-01-07T08:45:00Z'
    }
  ]
}

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
  Upload,
  Download,
  AlertTriangle,
  Package 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, downloadCSV } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

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

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
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
        setProducts([])
      } else {
        console.log('✅ Got products:', data?.length || 0)
        setProducts(data || [])
      }
    } catch (error) {
      console.error('❌ Fetch error:', error)
      setProducts([])
    } finally {
      console.log('✅ Setting loading to false')
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    console.log('🔄 Starting fetchCategories...')
    try {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)

      if (error) {
        console.error('❌ Categories error:', error)
        setCategories([])
      } else {
        console.log('✅ Got categories:', data?.length || 0)
        setCategories(data || [])
      }
    } catch (error) {
      console.error('❌ Categories fetch error:', error)
      setCategories([])
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product')
      } else {
        setProducts(products.filter(p => p.id !== productId))
        setSelectedProducts(selectedProducts.filter(id => id !== productId))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting product')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', selectedProducts)

      if (error) {
        console.error('Error bulk deleting products:', error)
        alert('Error deleting products')
      } else {
        setProducts(products.filter(p => !selectedProducts.includes(p.id)))
        setSelectedProducts([])
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting products')
    }
  }

  const handleExportProducts = () => {
    const exportData = products.map(product => ({
      Name: product.name,
      SKU: product.sku || '',
      Price: product.price,
      'Compare Price': product.compare_price || '',
      Stock: product.stock_quantity,
      Available: product.is_available ? 'Yes' : 'No',
      Featured: product.is_featured ? 'Yes' : 'No',
      'Created Date': new Date(product.created_at).toLocaleDateString()
    }))

    downloadCSV(exportData, `kfresh-products-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', text: 'Out of stock' }
    if (stock <= 10) return { color: 'text-orange-600', bg: 'bg-orange-100', text: 'Low stock' }
    return { color: 'text-green-600', bg: 'bg-green-100', text: 'In stock' }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
            <p className="mt-2 text-sm text-gray-500">
              If this takes too long, try refreshing the page or{' '}
              <a href="/test-products-no-auth" className="text-green-600 hover:underline">
                view without auth
              </a>
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your store&apos;s product catalog</p>
          </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportProducts}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <Link
            href="/products/new"
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Active Products</p>
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.is_available).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">
            {products.filter(p => p.stock_quantity <= 10 && p.stock_quantity > 0).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">
            {products.filter(p => p.stock_quantity === 0).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
        
        {selectedProducts.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg">
            <span className="text-blue-800 font-medium">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts(filteredProducts.map(p => p.id))
                      } else {
                        setSelectedProducts([])
                      }
                    }}
                    className="rounded"
                  />
                </th>
                <th className="text-left p-4 font-medium text-gray-900">Product</th>
                <th className="text-left p-4 font-medium text-gray-900">SKU</th>
                <th className="text-left p-4 font-medium text-gray-900">Price</th>
                <th className="text-left p-4 font-medium text-gray-900">Stock</th>
                <th className="text-left p-4 font-medium text-gray-900">Status</th>
                <th className="text-left p-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock_quantity)
                return (
                  <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProducts([...selectedProducts, product.id])
                          } else {
                            setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                          }
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                          {/* Featured Image Badge */}
                          {product.images && product.images.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-xs font-bold">★</span>
                            </div>
                          )}
                          {/* Image Count Badge */}
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-xs font-bold">{product.images.length}</span>
                            </div>
                          )}
                          {/* Featured Image Badge */}
                          {product.images && product.images.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-xs font-bold">★</span>
                            </div>
                          )}
                          {/* Image Count Badge */}
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -bottom-1 -left-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-xs font-bold">{product.images.length}</span>
                            </div>
                          )}
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
                        <Link
                          href={`/products/${product.id}`}
                          className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        >
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
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="h-12 w-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500">No products found</p>
            {searchTerm || selectedCategory ? (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('')
                }}
                className="text-green-600 hover:text-green-700 font-medium mt-2"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  )
}

// Mock data for development
function getEnhancedMockProducts(): Product[] {
  return [
    {
      id: 'f6c0ac6a-61ca-4329-bf25-1a5a13a711a7',
      name: 'Ghana Yam',
      slug: 'ghana-yam',
      sku: 'KF-GY-001',
      price: 5.99,
      compare_price: null,
      stock_quantity: 3,
      is_available: true,
      is_featured: true,
      category_id: '794d1714-5fee-4f59-80d0-914ef40673ba',
      images: ['https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=400'],
      created_at: '2025-01-07T10:00:00Z',
      updated_at: '2025-01-07T10:00:00Z'
    },
    {
      id: '00f8afc1-2c36-421f-a5b1-81902a2b8bba',
      name: 'Jollof Rice (Ready to Eat)',
      slug: 'jollof-rice-ready',
      sku: 'KF-JR-001',
      price: 12.99,
      compare_price: 15.99,
      stock_quantity: 20,
      is_available: true,
      is_featured: true,
      category_id: '281bb6ba-8417-418f-9482-03bba583bd0a',
      images: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=400'],
      created_at: '2025-01-06T15:30:00Z',
      updated_at: '2025-01-07T09:15:00Z'
    },
    {
      id: '794d1714-5fee-4f59-80d0-914ef40673ba',
      name: 'Fresh Ginger Root',
      slug: 'fresh-ginger-root',
      sku: 'KF-GR-001',
      price: 3.49,
      compare_price: null,
      stock_quantity: 8,
      is_available: true,
      is_featured: false,
      category_id: '794d1714-5fee-4f59-80d0-914ef40673ba',
      images: ['https://images.unsplash.com/photo-1577217770296-2f0c0a0ffa63?w=400&h=400'],
      created_at: '2025-01-05T12:00:00Z',
      updated_at: '2025-01-05T12:00:00Z'
    },
    {
      id: '281bb6ba-8417-418f-9482-03bba583bd0a',
      name: 'Palm Oil (Red)',
      slug: 'palm-oil-red',
      sku: 'KF-PO-001',
      price: 8.99,
      compare_price: null,
      stock_quantity: 0,
      is_available: false,
      is_featured: false,
      category_id: 'ebc89b62-4b01-4c8b-8f80-1f1b7b9d7b1f',
      images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400'],
      created_at: '2025-01-04T08:45:00Z',
      updated_at: '2025-01-07T11:20:00Z'
    }
  ]
}

function getEnhancedMockCategories(): Category[] {
  return [
    { id: '794d1714-5fee-4f59-80d0-914ef40673ba', name: 'Fresh Produce', slug: 'fresh-produce' },
    { id: 'c8f3e2a4-5b6d-4e7f-8c9a-1b2c3d4e5f6g', name: 'Meat & Poultry', slug: 'meat-poultry' },
    { id: 'a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p', name: 'International Foods', slug: 'international-foods' },
    { id: '281bb6ba-8417-418f-9482-03bba583bd0a', name: 'Cooked Meals', slug: 'cooked-meals' },
    { id: 'f7e6d5c4-b3a2-9182-7364-5546372819ab', name: 'Dairy & Eggs', slug: 'dairy-eggs' },
    { id: 'ebc89b62-4b01-4c8b-8f80-1f1b7b9d7b1f', name: 'Pantry Essentials', slug: 'pantry-essentials' }
  ]
}
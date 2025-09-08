'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Package, DollarSign, BarChart3, Eye, EyeOff, Loader2, Star, Truck, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  sku: string | null
  barcode: string | null
  category_id: string | null
  brand: string | null
  unit: string | null
  weight: number | null
  origin: string | null
  stock_quantity: number
  low_stock_threshold: number
  track_inventory: boolean
  is_available: boolean
  is_featured: boolean
  requires_shipping: boolean
  tax_exempt: boolean
  images: any[]
  is_cooked: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export default function ProductDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error) throw error
      setProduct(data)

      // Fetch category if product has one
      if (data.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id, name, slug')
          .eq('id', data.category_id)
          .single()
        
        setCategory(categoryData)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async () => {
    if (!product) return

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !product.is_available })
        .eq('id', product.id)

      if (error) throw error

      setProduct({ ...product, is_available: !product.is_available })
    } catch (error) {
      console.error('Error updating availability:', error)
    }
  }

  const getStockStatus = () => {
    if (!product) return { status: 'Unknown', color: 'text-gray-600' }
    if (!product.track_inventory) return { status: 'Not tracked', color: 'text-gray-600' }
    if (product.stock_quantity === 0) return { status: 'Out of stock', color: 'text-red-600' }
    if (product.stock_quantity <= product.low_stock_threshold) return { status: 'Low stock', color: 'text-yellow-600' }
    return { status: 'In stock', color: 'text-green-600' }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Product not found'}
          </h2>
          <Link
            href="/products"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            ← Back to Products
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const stockStatus = getStockStatus()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/products"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">
                Product Details • {category?.name || 'No Category'} • SKU: {product.sku || 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href={`/products/${product.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Images</h2>
              
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Featured Image */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Featured Image</p>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-64 h-40 object-cover rounded-lg border-2 border-green-500"
                    />
                  </div>
                  
                  {/* Gallery Images */}
                  {product.images.length > 1 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Gallery Images</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {product.images.slice(1).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images uploaded</p>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Product Information</h2>
              
              <div className="space-y-4">
                {product.short_description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <p className="text-gray-900">{product.short_description}</p>
                  </div>
                )}
                
                {product.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{product.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                  {product.weight && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Weight</label>
                      <p className="text-gray-900">{product.weight} {product.unit || 'unit'}</p>
                    </div>
                  )}
                  
                  {product.origin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Origin</label>
                      <p className="text-gray-900">{product.origin}</p>
                    </div>
                  )}
                  
                  {product.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <p className="text-gray-900">{product.brand}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Actions</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Availability</span>
                  <button
                    onClick={toggleAvailability}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      product.is_available 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    } transition-colors`}
                  >
                    {product.is_available ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Available
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Unavailable
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Featured</span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    product.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Star className="h-3 w-3" />
                    {product.is_featured ? 'Featured' : 'Not Featured'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    product.is_cooked ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {product.is_cooked ? (
                      <>
                        <MapPin className="h-3 w-3" />
                        Cooked Meal (Pickup Only)
                      </>
                    ) : (
                      <>
                        <Truck className="h-3 w-3" />
                        Regular Product
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${stockStatus.color}`}>
                    {stockStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</span>
                </div>
                
                {product.compare_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Compare Price</span>
                    <span className="text-sm text-gray-500 line-through">{formatPrice(product.compare_price)}</span>
                  </div>
                )}
                
                {product.cost_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cost Price</span>
                    <span className="text-sm text-gray-600">{formatPrice(product.cost_price)}</span>
                  </div>
                )}

                {product.compare_price && product.compare_price > product.price && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium text-gray-700">Discount</span>
                    <span className="text-sm font-semibold text-green-600">
                      {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory */}
            {product.track_inventory && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Stock Quantity</span>
                    <span className="text-lg font-semibold text-gray-900">{product.stock_quantity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Low Stock Alert</span>
                    <span className="text-sm text-gray-600">{product.low_stock_threshold}</span>
                  </div>
                  
                  {product.stock_quantity <= product.low_stock_threshold && product.stock_quantity > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 font-medium">⚠️ Low Stock Warning</p>
                      <p className="text-sm text-yellow-700">Stock is below the threshold of {product.low_stock_threshold}</p>
                    </div>
                  )}
                  
                  {product.stock_quantity === 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">🚫 Out of Stock</p>
                      <p className="text-sm text-red-700">This product is currently out of stock</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">{new Date(product.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated</span>
                  <span className="text-gray-900">{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID</span>
                  <span className="text-gray-900 font-mono text-xs">{product.id}</span>
                </div>

                {product.slug && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Slug</span>
                    <span className="text-gray-900 font-mono text-xs">{product.slug}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
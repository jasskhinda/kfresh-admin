'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { imageUploadService } from '@/lib/imageUpload'
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
  delivery_type?: string | null
  uber_eats_url?: string | null
  doordash_url?: string | null
}

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      fetchProduct(),
      fetchCategories()
    ]).finally(() => setLoading(false))
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
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('Failed to load product')
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!product) return

    setSaving(true)
    setError('')

    try {
      console.log('Saving product with images:', product.images)
      
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product')
      }

      console.log('Product saved successfully:', result)
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      setError(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const updateProduct = (field: keyof Product, value: any) => {
    if (!product) return
    setProduct({ ...product, [field]: value })
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !product) return

    setUploading(true)
    setUploadProgress([])
    
    try {
      const fileArray = Array.from(files)
      const uploadResults = await imageUploadService.uploadMultipleImages(fileArray, product.id)
      
      const successfulUploads = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!)

      const failedUploads = uploadResults
        .filter(result => !result.success)
        .map(result => result.error)

      if (successfulUploads.length > 0) {
        const newImages = [...(product.images || []), ...successfulUploads]
        updateProduct('images', newImages)
        setUploadProgress(prev => [...prev, `✅ Uploaded ${successfulUploads.length} image(s) successfully`])
      }

      if (failedUploads.length > 0) {
        setUploadProgress(prev => [...prev, `❌ ${failedUploads.length} upload(s) failed`])
        failedUploads.forEach(error => {
          setUploadProgress(prev => [...prev, `Error: ${error}`])
        })
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(['❌ Upload failed. Please try again.'])
    } finally {
      setUploading(false)
      // Clear progress after 5 seconds
      setTimeout(() => setUploadProgress([]), 5000)
    }
  }

  const handleImageDelete = async (imageUrl: string, index: number) => {
    if (!product) return

    try {
      // Remove from product images immediately for better UX
      const newImages = product.images.filter((_, i) => i !== index)
      updateProduct('images', newImages)

      // Try to delete from storage (don't block UI if this fails)
      const deleted = await imageUploadService.deleteImage(imageUrl)
      if (!deleted) {
        console.warn('Failed to delete image from storage:', imageUrl)
      }
    } catch (error) {
      console.error('Error deleting image:', error)
    }
  }

  const handleImageReorder = (fromIndex: number, toIndex: number) => {
    if (!product || !product.images) return

    const newImages = [...product.images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    updateProduct('images', newImages)
  }

  const handleSetFeatured = (index: number) => {
    if (!product || !product.images) return

    const newImages = [...product.images]
    const [featuredImage] = newImages.splice(index, 1)
    newImages.unshift(featuredImage) // Move to beginning (featured position)
    updateProduct('images', newImages)
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

  if (!product) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Images */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Product Images</h2>
          
          <div className="space-y-6">
            {/* Featured Image Section */}
            {product.images && product.images.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Featured Image
                  </label>
                  <span className="text-xs text-gray-500">
                    This image appears in product listings and cards
                  </span>
                </div>
                <div className="relative group inline-block">
                  <img
                    src={product.images[0]}
                    alt="Featured product image"
                    className="w-48 h-32 object-cover rounded-lg border-2 border-green-500 shadow-sm"
                  />
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </div>
                  <button
                    type="button"
                    onClick={() => handleImageDelete(product.images[0], 0)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="Delete featured image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Product Gallery Section */}
            {product.images && product.images.length > 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Product Gallery ({product.images.length - 1} additional images)
                  </label>
                  <span className="text-xs text-gray-500">
                    These images appear on the product detail page
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {product.images.slice(1).map((image, index) => (
                    <div key={index + 1} className="relative group">
                      <img
                        src={image}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        Gallery #{index + 1}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleImageDelete(image, index + 1)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Delete gallery image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      
                      {/* Reorder buttons */}
                      <div className="absolute bottom-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleImageReorder(index + 1, index)}
                            className="bg-gray-800 text-white rounded px-2 py-1 text-xs hover:bg-gray-700"
                            title="Move left"
                          >
                            ←
                          </button>
                        )}
                        {index < product.images.length - 2 && (
                          <button
                            type="button"
                            onClick={() => handleImageReorder(index + 1, index + 2)}
                            className="bg-gray-800 text-white rounded px-2 py-1 text-xs hover:bg-gray-700"
                            title="Move right"
                          >
                            →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleSetFeatured(index + 1)}
                          className="bg-yellow-500 text-white rounded px-2 py-1 text-xs hover:bg-yellow-600 font-bold"
                          title="Set as featured image"
                        >
                          ⭐ Featured
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Images State */}
            {(!product.images || product.images.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-gray-400 mb-2">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No images uploaded yet</p>
                <p className="text-gray-400 text-xs">Add images below to create a featured image and gallery</p>
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Images
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}>
                <Upload className={`h-12 w-12 mx-auto mb-4 ${
                  uploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'
                }`} />
                <p className="text-gray-600 mb-2">
                  {uploading ? 'Uploading images...' : 'Upload product images'}
                </p>
                <p className="text-sm text-gray-500 mb-4">PNG, JPG, WebP, GIF up to 10MB each</p>
                
                {/* Upload Progress */}
                {uploadProgress.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-left">
                    {uploadProgress.map((message, index) => (
                      <p key={index} className="text-sm text-gray-700">{message}</p>
                    ))}
                  </div>
                )}

                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                  id="image-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                    uploading 
                      ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading...' : 'Choose Images'}
                </label>
              </div>
            </div>

            {/* Manual Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Add Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const url = input.value.trim()
                      if (url) {
                        const newImages = [...(product.images || []), url]
                        updateProduct('images', newImages)
                        input.value = ''
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement
                    const url = input.value.trim()
                    if (url) {
                      const newImages = [...(product.images || []), url]
                      updateProduct('images', newImages)
                      input.value = ''
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={product.name}
                onChange={(e) => updateProduct('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Slug
              </label>
              <input
                type="text"
                value={product.slug || ''}
                onChange={(e) => updateProduct('slug', e.target.value || null)}
                placeholder="URL-friendly version of name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">Used in the product URL</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              {product.is_cooked && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Fresh Meals Description Guidelines</p>
                      <p className="text-xs text-amber-700 mt-1">
                        For optimal display on the Fresh Meals page, please limit descriptions to 152 characters. 
                        This ensures consistent card layouts and improved readability.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <textarea
                rows={4}
                value={product.description || ''}
                onChange={(e) => updateProduct('description', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder={product.is_cooked 
                  ? "Enter a concise description for this Fresh Meal item" 
                  : "Enter a detailed description of this product"
                }
              />
              {product.is_cooked && product.description && (
                <div className="mt-2 flex items-center justify-between">
                  <p className={`text-xs ${
                    product.description.length > 152 ? 'text-amber-600 font-medium' : 'text-gray-500'
                  }`}>
                    Character count: {product.description.length}/152
                  </p>
                  {product.description.length > 152 && (
                    <span className="text-xs text-amber-600">
                      Exceeds recommended length
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              {product.is_cooked && (
                <div className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-slate-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Field Not Applicable</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Short descriptions are not displayed for Fresh Meals items. 
                        Please use the main Description field above for all product details.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <textarea
                rows={2}
                value={product.short_description || ''}
                onChange={(e) => updateProduct('short_description', e.target.value || null)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  product.is_cooked ? 'bg-gray-50' : ''
                }`}
                placeholder={product.is_cooked 
                  ? "This field is disabled for Fresh Meals items" 
                  : "Enter a brief summary for product cards and search results"
                }
                disabled={product.is_cooked}
              />
              {!product.is_cooked && (
                <p className="text-xs text-gray-500 mt-1">
                  Appears in product cards and listings. Keep it concise and engaging.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={product.price}
                  onChange={(e) => updateProduct('price', parseFloat(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.compare_price || ''}
                  onChange={(e) => updateProduct('compare_price', parseFloat(e.target.value) || null)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.cost_price || ''}
                  onChange={(e) => updateProduct('cost_price', parseFloat(e.target.value) || null)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                value={product.stock_quantity}
                onChange={(e) => updateProduct('stock_quantity', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={product.low_stock_threshold}
                onChange={(e) => updateProduct('low_stock_threshold', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={product.unit || ''}
                onChange={(e) => updateProduct('unit', e.target.value || null)}
                placeholder="e.g., lb, kg, piece"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Product Specifications</h2>
          <p className="text-sm text-gray-600 mb-6">These specifications will be displayed on the product detail page</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={product.weight || ''}
                  onChange={(e) => updateProduct('weight', parseFloat(e.target.value) || null)}
                  placeholder="e.g., 2.5"
                  className="w-full pr-16 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {product.unit === 'lb' ? 'lbs' : product.unit === 'kg' ? 'kg' : 'unit'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Leave empty for "Varies per piece"</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Origin
              </label>
              <input
                type="text"
                value={product.origin || ''}
                onChange={(e) => updateProduct('origin', e.target.value || null)}
                placeholder="e.g., Ghana, Canada, Local"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <input
                type="text"
                value={product.brand || ''}
                onChange={(e) => updateProduct('brand', e.target.value || null)}
                placeholder="e.g., Canadian Food, KFresh"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Product Code)
              </label>
              <input
                type="text"
                value={product.sku || ''}
                onChange={(e) => updateProduct('sku', e.target.value || null)}
                placeholder="e.g., 7484784hd"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Type
              </label>
              <select
                value={product.unit || ''}
                onChange={(e) => updateProduct('unit', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select unit type</option>
                <option value="piece">piece</option>
                <option value="lb">pounds (lb)</option>
                <option value="kg">kilograms (kg)</option>
                <option value="g">grams (g)</option>
                <option value="oz">ounces (oz)</option>
                <option value="liter">liter</option>
                <option value="ml">milliliter (ml)</option>
                <option value="pack">pack</option>
                <option value="box">box</option>
                <option value="bottle">bottle</option>
                <option value="can">can</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability Status
              </label>
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-2 rounded-lg border ${
                  product.is_available && product.stock_quantity > 0 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {product.is_available && product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.stock_quantity} units)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Status is automatically determined by availability setting and stock quantity
              </p>
            </div>
          </div>

          {/* Specification Preview */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Preview: How this will appear on product page</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Weight:</span>
                <span className="ml-2 text-gray-600">
                  {product.weight ? `${product.weight} ${product.unit || 'unit'}` : 'Varies per piece'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Origin:</span>
                <span className="ml-2 text-gray-600">{product.origin || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Brand:</span>
                <span className="ml-2 text-gray-600">{product.brand || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">SKU:</span>
                <span className="ml-2 text-gray-600">{product.sku || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Unit:</span>
                <span className="ml-2 text-gray-600">{product.unit || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Availability:</span>
                <span className={`ml-2 font-medium ${
                  product.is_available && product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.is_available && product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Organization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={product.category_id || ''}
                onChange={(e) => updateProduct('category_id', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode
              </label>
              <input
                type="text"
                value={product.barcode || ''}
                onChange={(e) => updateProduct('barcode', e.target.value || null)}
                placeholder="Product barcode (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Purchase Options */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">🚚</span>
            </div>
            <h2 className="text-lg font-medium text-gray-900">Delivery & Purchase Options</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                value={product.delivery_type || 'partner_delivery'}
                onChange={(e) => updateProduct('delivery_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="partner_delivery">🛒 Groceries & Products (In-store + Online Partners)</option>
                <option value="fresh_meals">🍽️ Fresh Meals & Cooked Foods (Pickup Only)</option>
              </select>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  {product.delivery_type === 'fresh_meals' 
                    ? '🍽️ Fresh Meals: Customers can add to cart and select pickup time. Perfect for hot, ready-to-eat dishes.'
                    : '🛒 Groceries: Available for in-store shopping. Add partner URLs below to enable online ordering through delivery apps.'}
                </p>
              </div>
            </div>

            {/* Partner Purchase URLs - Only show for groceries */}
            {product.delivery_type !== 'fresh_meals' && (
              <div className="border-t pt-6">
                <h3 className="text-md font-semibold text-gray-900 mb-4">Online Partner Purchase Links</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-amber-800">
                    <strong>💡 Pro Tip:</strong> If you don't have your own partner URLs yet, you can use competitor URLs as placeholders. 
                    When customers click "Buy from Uber Eats" or "Buy from DoorDash", they'll be taken to the URL you enter below.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span className="w-6 h-6 bg-green-100 rounded flex items-center justify-center text-xs">🍃</span>
                      Uber Eats Buy URL
                    </label>
                    <input
                      type="url"
                      value={product.uber_eats_url || ''}
                      onChange={(e) => updateProduct('uber_eats_url', e.target.value || null)}
                      placeholder="e.g., https://www.ubereats.com/stores/metro-1234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {product.uber_eats_url 
                        ? '✅ "Buy from Uber Eats" button will appear for customers' 
                        : 'Leave empty to hide Uber Eats option'}
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <span className="w-6 h-6 bg-red-100 rounded flex items-center justify-center text-xs">🚗</span>
                      DoorDash Buy URL
                    </label>
                    <input
                      type="url"
                      value={product.doordash_url || ''}
                      onChange={(e) => updateProduct('doordash_url', e.target.value || null)}
                      placeholder="e.g., https://www.doordash.com/store/loblaws-5678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {product.doordash_url 
                        ? '✅ "Buy from DoorDash" button will appear for customers' 
                        : 'Leave empty to hide DoorDash option'}
                    </p>
                  </div>
                </div>

                {/* Example URLs */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs font-medium text-blue-900 mb-2">📋 Quick Example URLs (for testing):</p>
                  <div className="space-y-1 text-xs text-blue-800">
                    <div><strong>Metro Uber:</strong> https://www.ubereats.com/stores/metro</div>
                    <div><strong>Loblaws DoorDash:</strong> https://www.doordash.com/store/loblaws</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Settings</h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={product.is_available}
                onChange={(e) => updateProduct('is_available', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
              />
              <span className="ml-2 text-sm text-gray-700">Product is available for sale</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={product.is_featured}
                onChange={(e) => updateProduct('is_featured', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
              />
              <span className="ml-2 text-sm text-gray-700">Feature this product</span>
            </label>

            <label className="flex items-start">
              <input
                type="checkbox"
                checked={product.is_cooked}
                onChange={(e) => updateProduct('is_cooked', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 mt-1"
              />
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-700">Mark as Fresh Meal Item</span>
                <div className="mt-2 text-xs text-gray-600 space-y-1.5">
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span><strong className="font-semibold">Display Location:</strong> Exclusively on Fresh Meals page</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span><strong className="font-semibold">Product Catalog:</strong> Excluded from main products page</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span><strong className="font-semibold">Fulfillment:</strong> In-store pickup only</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-400 mr-2">•</span>
                    <span><strong className="font-semibold">Description Length:</strong> 152 characters recommended</span>
                  </div>
                </div>
              </div>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={product.track_inventory}
                onChange={(e) => updateProduct('track_inventory', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
              />
              <span className="ml-2 text-sm text-gray-700">Track inventory for this product</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={product.requires_shipping}
                onChange={(e) => updateProduct('requires_shipping', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
              />
              <span className="ml-2 text-sm text-gray-700">Requires shipping</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Link
            href="/products"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </DashboardLayout>
  )
}
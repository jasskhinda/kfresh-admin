'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { imageUploadService } from '@/lib/imageUpload'

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <Link
          href="/products"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
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

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Debug Info:</h3>
        <p className="text-sm text-blue-800">
          Current images in database: {product?.images?.length || 0}
        </p>
        {product?.images && product.images.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-blue-700">Image URLs:</p>
            <ul className="text-xs text-blue-600 ml-4">
              {product.images.map((url, index) => (
                <li key={index} className="truncate">{url}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

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
                SKU
              </label>
              <input
                type="text"
                value={product.sku || ''}
                onChange={(e) => updateProduct('sku', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={product.description || ''}
                onChange={(e) => updateProduct('description', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                rows={2}
                value={product.short_description || ''}
                onChange={(e) => updateProduct('short_description', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
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
                Brand
              </label>
              <input
                type="text"
                value={product.brand || ''}
                onChange={(e) => updateProduct('brand', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
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

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={product.is_cooked}
                onChange={(e) => updateProduct('is_cooked', e.target.checked)}
                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
              />
              <span className="ml-2 text-sm text-gray-700">This is a cooked meal (pickup only)</span>
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
  )
}
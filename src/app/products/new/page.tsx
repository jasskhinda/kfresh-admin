'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { imageUploadService } from '@/lib/imageUpload'
import { generateSlug } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_price: 0,
    cost_price: 0,
    sku: '',
    barcode: '',
    category_id: '',
    brand: '',
    unit: '',
    weight: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    track_inventory: true,
    is_available: true,
    is_featured: false,
    is_cooked: false,
    requires_shipping: true,
    tax_exempt: false,
    images: [] as string[],
    seo_title: '',
    seo_description: '',
    delivery_type: 'partner_delivery',
    uber_eats_url: '',
    doordash_url: ''
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name)
    setFormData({
      ...formData,
      name,
      slug,
      seo_title: name
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        short_description: formData.short_description || null,
        price: formData.price,
        compare_price: formData.compare_price || null,
        cost_price: formData.cost_price || null,
        sku: formData.sku || null,
        barcode: formData.barcode || null,
        category_id: formData.category_id || null,
        brand: formData.brand || null,
        unit: formData.unit || null,
        weight: formData.weight || null,
        stock_quantity: formData.stock_quantity,
        low_stock_threshold: formData.low_stock_threshold,
        track_inventory: formData.track_inventory,
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        is_cooked: formData.is_cooked,
        requires_shipping: formData.requires_shipping,
        tax_exempt: formData.tax_exempt,
        images: formData.images,
        metadata: {},
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        delivery_type: formData.delivery_type || 'partner_delivery',
        uber_eats_url: formData.uber_eats_url.trim() || null,
        doordash_url: formData.doordash_url.trim() || null
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) throw error

      router.push('/products')
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Error creating product. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress([])
    
    try {
      const fileArray = Array.from(files)
      // Generate a temporary ID for upload (since product doesn't exist yet)
      const tempId = `temp-${Date.now()}`
      const uploadResults = await imageUploadService.uploadMultipleImages(fileArray, tempId)
      
      const successfulUploads = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!)

      const failedUploads = uploadResults
        .filter(result => !result.success)
        .map(result => result.error)

      if (successfulUploads.length > 0) {
        const newImages = [...formData.images, ...successfulUploads]
        setFormData({ ...formData, images: newImages })
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

  const handleImageAdd = (url: string) => {
    setFormData({
      ...formData,
      images: [...formData.images, url]
    })
  }

  const handleImageDelete = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600">Create a new product for your store</p>
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
              {formData.images.length > 0 && (
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
                      src={formData.images[0]}
                      alt="Featured product image"
                      className="w-48 h-32 object-cover rounded-lg border-2 border-green-500 shadow-sm"
                    />
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                      Featured
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(0)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Product Gallery Section */}
              {formData.images.length > 1 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Product Gallery ({formData.images.length - 1} additional images)
                    </label>
                    <span className="text-xs text-gray-500">
                      These images appear on the product detail page
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.slice(1).map((image, index) => (
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
                          onClick={() => handleImageDelete(index + 1)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Images State */}
              {formData.images.length === 0 && (
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
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    uploading ? 'border-blue-400 bg-blue-50' : 
                    isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`h-12 w-12 mx-auto mb-4 ${
                    uploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'
                  }`} />
                  <p className="text-gray-600 mb-2">
                    {uploading ? 'Uploading images...' : 
                     isDragging ? 'Drop images here' : 'Drag & drop images here or click to upload'}
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
                          handleImageAdd(url)
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
                        handleImageAdd(url)
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
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="URL-friendly version of name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">Used in the product URL</p>
              </div>

              {/* Product Type Section */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Product Type
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="is-fresh-meal"
                      checked={formData.is_cooked}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        // If switching to Fresh Meal and description is too long, truncate it
                        const newDescription = isChecked && formData.description.length > 152 
                          ? formData.description.substring(0, 152)
                          : formData.description
                        
                        setFormData({ 
                          ...formData, 
                          is_cooked: isChecked,
                          description: newDescription
                        })
                      }}
                      className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 mt-1"
                    />
                    <div className="ml-3">
                      <label htmlFor="is-fresh-meal" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Mark as Fresh Meal Item
                      </label>
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
                          <span><strong className="font-semibold">Description Length:</strong> 152 characters maximum</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                {formData.is_cooked && (
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
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value
                    // For Fresh Meals (is_cooked), limit to 152 characters
                    if (formData.is_cooked && value.length > 152) {
                      return // Don't update if it exceeds limit for Fresh Meals
                    }
                    setFormData({ ...formData, description: value })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={formData.is_cooked 
                    ? "Enter a concise description for this Fresh Meal item" 
                    : "Enter a detailed description of this product"
                  }
                />
                {formData.is_cooked && formData.description && (
                  <div className="mt-2 flex items-center justify-between">
                    <p className={`text-xs ${
                      formData.description.length > 152 ? 'text-amber-600 font-medium' : 'text-gray-500'
                    }`}>
                      Character count: {formData.description.length}/152
                    </p>
                    {formData.description.length > 152 && (
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
                {formData.is_cooked && (
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
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    formData.is_cooked ? 'bg-gray-50' : ''
                  }`}
                  placeholder={formData.is_cooked 
                    ? "This field is disabled for Fresh Meals items" 
                    : "Enter a brief summary for product cards and search results"
                  }
                  disabled={formData.is_cooked}
                />
                {!formData.is_cooked && (
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
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: parseFloat(e.target.value) || 0 })}
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
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
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
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
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
                  value={formData.low_stock_threshold}
                  onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 2.5"
                    className="w-full pr-16 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {formData.unit === 'lb' ? 'lbs' : formData.unit === 'kg' ? 'kg' : 'unit'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Leave empty for "Varies per piece"</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
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
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g., 7484784hd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Type
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Status
                </label>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-2 rounded-lg border ${
                    formData.is_available && formData.stock_quantity > 0 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    {formData.is_available && formData.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({formData.stock_quantity} units)
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
                    {formData.weight ? `${formData.weight} ${formData.unit || 'unit'}` : 'Varies per piece'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Brand:</span>
                  <span className="ml-2 text-gray-600">{formData.brand || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">SKU:</span>
                  <span className="ml-2 text-gray-600">{formData.sku || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Unit:</span>
                  <span className="ml-2 text-gray-600">{formData.unit || 'Not specified'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Availability:</span>
                  <span className={`ml-2 font-medium ${
                    formData.is_available && formData.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formData.is_available && formData.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
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
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
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
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
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
                  value={formData.delivery_type || 'partner_delivery'}
                  onChange={(e) => setFormData({ ...formData, delivery_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="partner_delivery">🛒 Groceries & Products (In-store + Online Partners)</option>
                  <option value="fresh_meals">🍽️ Fresh Meals & Cooked Foods (Pickup Only)</option>
                </select>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    {formData.delivery_type === 'fresh_meals' 
                      ? '🍽️ Fresh Meals: Customers can add to cart and select pickup time. Perfect for hot, ready-to-eat dishes.'
                      : '🛒 Groceries: Available for in-store shopping. Add partner URLs below to enable online ordering through delivery apps.'}
                  </p>
                </div>
              </div>

              {/* Partner Purchase URLs - Only show for groceries */}
              {formData.delivery_type !== 'fresh_meals' && (
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
                        value={formData.uber_eats_url || ''}
                        onChange={(e) => setFormData({ ...formData, uber_eats_url: e.target.value })}
                        placeholder="e.g., https://www.ubereats.com/stores/metro-1234"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.uber_eats_url 
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
                        value={formData.doordash_url || ''}
                        onChange={(e) => setFormData({ ...formData, doordash_url: e.target.value })}
                        placeholder="e.g., https://www.doordash.com/store/loblaws-5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.doordash_url 
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
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                />
                <span className="ml-2 text-sm text-gray-700">Product is available for sale</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                />
                <span className="ml-2 text-sm text-gray-700">Feature this product</span>
              </label>


              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.track_inventory}
                  onChange={(e) => setFormData({ ...formData, track_inventory: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                />
                <span className="ml-2 text-sm text-gray-700">Track inventory for this product</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.requires_shipping}
                  onChange={(e) => setFormData({ ...formData, requires_shipping: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                />
                <span className="ml-2 text-sm text-gray-700">Requires shipping</span>
              </label>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  maxLength={60}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.seo_title.length}/60 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.seo_description.length}/160 characters</p>
              </div>
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
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
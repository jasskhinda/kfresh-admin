'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { imageUploadService } from '@/lib/imageUpload'
import { generateSlug } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductVariant {
  id?: string
  size_name: string
  size_value: number
  size_unit: string
  price: number
  compare_price: number
  stock_quantity: number
  sku: string
  is_default: boolean
}

type TabKey = 'basic' | 'content' | 'variants' | 'specifications' | 'partners'

const UNIT_TYPES = [
  { value: 'piece', label: 'piece', units: ['piece', 'item', 'unit'] },
  { value: 'g', label: 'grams (g)', units: ['g', 'kg'] },
  { value: 'lb', label: 'pounds (lb)', units: ['oz', 'lb'] },
  { value: 'liter', label: 'liter', units: ['ml', 'liter', 'L'] },
  { value: 'pack', label: 'pack', units: ['pack', 'box', 'bundle'] },
]

export default function EnhancedNewProductPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState<TabKey>('basic')

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    ingredients: '',
    nutrition_info: '',
    price: 0,
    compare_price: 0,
    stock_quantity: 0,
    unit_type: '',
    category_id: '',
    brand: '',
    sku: '',
    weight: 0,
    is_available: true,
    is_featured: false,
    is_cooked: false,
    images: [] as string[],
    uber_eats_url: '',
    doordash_url: ''
  })

  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [showVariants, setShowVariants] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  // Auto-enable variants when unit type is selected
  useEffect(() => {
    if (formData.unit_type && !showVariants) {
      setShowVariants(true)
      // Add default variant
      if (variants.length === 0) {
        addVariant()
      }
    }
  }, [formData.unit_type, showVariants, variants.length])

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
      slug
    })
  }

  const addVariant = () => {
    const selectedUnit = UNIT_TYPES.find(ut => ut.value === formData.unit_type)
    const defaultUnit = selectedUnit?.units[0] || ''
    
    const newVariant: ProductVariant = {
      size_name: '',
      size_value: 0,
      size_unit: defaultUnit,
      price: formData.price || 0,
      compare_price: formData.compare_price || 0,
      stock_quantity: formData.stock_quantity || 0,
      sku: '',
      is_default: variants.length === 0 // First variant is default
    }
    setVariants([...variants, newVariant])
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const updatedVariants = variants.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    )
    setVariants(updatedVariants)
  }

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index)
    // If we removed the default variant, make the first one default
    if (variants[index].is_default && updatedVariants.length > 0) {
      updatedVariants[0].is_default = true
    }
    setVariants(updatedVariants)
  }

  const setDefaultVariant = (index: number) => {
    const updatedVariants = variants.map((variant, i) => ({
      ...variant,
      is_default: i === index
    }))
    setVariants(updatedVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, create the product
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        ingredients: formData.ingredients || null,
        nutrition_info: formData.nutrition_info || null,
        price: showVariants ? (variants.find(v => v.is_default)?.price || 0) : formData.price,
        compare_price: showVariants ? (variants.find(v => v.is_default)?.compare_price || null) : (formData.compare_price || null),
        stock_quantity: showVariants ? variants.reduce((sum, v) => sum + v.stock_quantity, 0) : formData.stock_quantity,
        category_id: formData.category_id || null,
        brand: formData.brand || null,
        unit: formData.unit_type || null,
        weight: formData.weight || null,
        sku: showVariants ? (variants.find(v => v.is_default)?.sku || null) : (formData.sku || null),
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        is_cooked: formData.is_cooked,
        images: formData.images,
        delivery_type: formData.is_cooked ? 'fresh_meals' : 'partner_delivery',
        uber_eats_url: formData.uber_eats_url.trim() || null,
        doordash_url: formData.doordash_url.trim() || null
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (productError) throw productError

      // If using variants, create them
      if (showVariants && variants.length > 0) {
        const variantData = variants.map(variant => ({
          product_id: product.id,
          size_name: variant.size_name,
          size_value: variant.size_value,
          size_unit: variant.size_unit,
          price: variant.price,
          compare_price: variant.compare_price || null,
          stock_quantity: variant.stock_quantity,
          sku: variant.sku || null,
          is_default: variant.is_default
        }))

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantData)

        if (variantError) throw variantError
      }

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
      const tempId = `temp-${Date.now()}`
      const uploadResults = await imageUploadService.uploadMultipleImages(fileArray, tempId)
      
      const successfulUploads = uploadResults
        .filter(result => result.success && result.url)
        .map(result => result.url!)

      if (successfulUploads.length > 0) {
        const newImages = [...formData.images, ...successfulUploads]
        setFormData({ ...formData, images: newImages })
        setUploadProgress([`✅ Uploaded ${successfulUploads.length} image(s) successfully`])
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(['❌ Upload failed. Please try again.'])
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress([]), 5000)
    }
  }

  const handleImageDelete = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({ ...formData, images: newImages })
  }

  const tabs = [
    { key: 'basic' as TabKey, label: '📝 Basic Info', description: 'Name, pricing, stock' },
    { key: 'content' as TabKey, label: '📄 Content', description: 'Description, ingredients, nutrition' },
    { key: 'variants' as TabKey, label: '📏 Size Options', description: 'Multiple sizes & prices' },
    { key: 'specifications' as TabKey, label: '📋 Specifications', description: 'Weight, brand, SKU' },
    { key: 'partners' as TabKey, label: '🚚 Partner Links', description: 'Delivery app URLs' }
  ]

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
              <p className="text-gray-600">Create a new product with professional tabs and options</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-center">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
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
                      placeholder="Enter product name"
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
                      placeholder="URL-friendly version"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

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
                        disabled={showVariants}
                      />
                    </div>
                    {showVariants && (
                      <p className="text-xs text-blue-600 mt-1">Price will be managed in Size Options tab</p>
                    )}
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
                        disabled={showVariants}
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
                      disabled={showVariants}
                    />
                    {showVariants && (
                      <p className="text-xs text-blue-600 mt-1">Stock will be managed in Size Options tab</p>
                    )}
                  </div>

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
                </div>

                {/* Product Type */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_cooked}
                      onChange={(e) => setFormData({ ...formData, is_cooked: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                    />
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      🍽️ Fresh Meal Item (Pickup Only)
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Check this for cooked meals, prepared foods, or items that require pickup
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available for sale</span>
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
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <p className="text-gray-600">
                  Use these text areas to copy and paste product information. You can format text and include detailed descriptions.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📄 Description
                  </label>
                  <textarea
                    rows={6}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter detailed product description..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Main product description that appears on product pages
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🥬 Ingredients
                  </label>
                  <textarea
                    rows={4}
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="List all ingredients..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Complete ingredient list for this product
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📊 Nutrition & Other Information
                  </label>
                  <textarea
                    rows={8}
                    value={formData.nutrition_info}
                    onChange={(e) => setFormData({ ...formData, nutrition_info: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nutrition facts, allergen information, storage instructions, or any other important details..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nutrition facts, allergen info, storage instructions, or any additional product details
                  </p>
                </div>
              </div>
            )}

            {/* Size Options Tab */}
            {activeTab === 'variants' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Type
                  </label>
                  <select
                    value={formData.unit_type}
                    onChange={(e) => {
                      setFormData({ ...formData, unit_type: e.target.value })
                      if (e.target.value && !showVariants) {
                        setShowVariants(true)
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select unit type to enable size options</option>
                    {UNIT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.unit_type && (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Size Options</h3>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Size Option
                      </button>
                    </div>

                    <div className="space-y-4">
                      {variants.map((variant, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="default_variant"
                                checked={variant.is_default}
                                onChange={() => setDefaultVariant(index)}
                                className="text-green-600"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {variant.is_default ? 'Default Size' : 'Alternative Size'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Size Name
                              </label>
                              <input
                                type="text"
                                value={variant.size_name}
                                onChange={(e) => updateVariant(index, 'size_name', e.target.value)}
                                placeholder="e.g., 400g, Large, 1L"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variant.price}
                                  onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={variant.stock_quantity}
                                onChange={(e) => updateVariant(index, 'stock_quantity', parseInt(e.target.value) || 0)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                SKU
                              </label>
                              <input
                                type="text"
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                placeholder="Optional"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {variants.length === 0 && formData.unit_type && (
                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500">No size options added yet</p>
                          <button
                            type="button"
                            onClick={addVariant}
                            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            Add First Size Option
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {!formData.unit_type && (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-2">Select a unit type above to enable size options</p>
                    <p className="text-xs text-gray-400">Size options allow customers to choose different sizes with different prices</p>
                  </div>
                )}
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                      placeholder="e.g., 2.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g., KFresh, Local Farm"
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
                      placeholder="e.g., KF-001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={showVariants}
                    />
                    {showVariants && (
                      <p className="text-xs text-blue-600 mt-1">SKU will be managed in Size Options tab</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Partner Links Tab */}
            {activeTab === 'partners' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Add partner URLs where customers can purchase this specific product online for delivery.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🍃 Uber Eats Product URL
                    </label>
                    <input
                      type="url"
                      value={formData.uber_eats_url}
                      onChange={(e) => setFormData({ ...formData, uber_eats_url: e.target.value })}
                      placeholder="https://www.ubereats.com/stores/store-name/product-id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🚗 DoorDash Product URL
                    </label>
                    <input
                      type="url"
                      value={formData.doordash_url}
                      onChange={(e) => setFormData({ ...formData, doordash_url: e.target.value })}
                      placeholder="https://www.doordash.com/store/store-name/product-id"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
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
      </div>
    </DashboardLayout>
  )
}
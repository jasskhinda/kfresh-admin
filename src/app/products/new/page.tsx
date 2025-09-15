'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { imageUploadService } from '@/lib/imageUpload'
import { generateSlug } from '@/lib/utils'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RichTextEditor from '@/components/ui/RichTextEditor'
import MediaGallerySelector from '@/components/ui/MediaGallerySelector'

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

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    ingredients: '',
    nutrition_info: '',
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

  // Product variants state
  const [variants, setVariants] = useState<Array<{
    id: string
    size_name: string
    price: number
    compare_price: number
    stock_quantity: number
    sku: string
    is_default: boolean
  }>>([{
    id: `variant-${Date.now()}`,
    size_name: '',
    price: 0,
    compare_price: 0,
    stock_quantity: 0,
    sku: '',
    is_default: true
  }])
  const [useVariants, setUseVariants] = useState(false)

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

  const addVariant = () => {
    setVariants([...variants, {
      id: `variant-${Date.now()}`,
      size_name: '',
      price: 0,
      compare_price: 0,
      stock_quantity: 100,
      sku: '',
      is_default: false
    }])
  }

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id))
    }
  }

  const updateVariant = (id: string, field: string, value: any) => {
    setVariants(variants.map(v => {
      if (v.id === id) {
        // If setting as default, unset all others
        if (field === 'is_default' && value === true) {
          variants.forEach(variant => {
            if (variant.id !== id) variant.is_default = false
          })
        }
        return { ...v, [field]: value }
      }
      return v
    }))
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
        ingredients: formData.ingredients || null,
        nutrition_info: formData.nutrition_info || null,
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

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select('id')
        .single()

      if (productError) throw productError

      // If using variants, insert them
      if (useVariants && variants.length > 0 && product) {
        const variantData = variants
          .filter(v => v.size_name.trim() !== '')
          .map(v => ({
            product_id: product.id,
            size_name: v.size_name,
            price: v.price,
            compare_price: v.compare_price || null,
            stock_quantity: v.stock_quantity,
            sku: v.sku || null,
            is_default: v.is_default
          }))

        if (variantData.length > 0) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantData)

          if (variantError) throw variantError
        }
      }

      router.push('/products')
    } catch (error) {
      console.error('Error creating product:', error)
      setError('Error creating product. Please try again.')
    } finally {
      setLoading(false)
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
          {/* Images - Media Gallery */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Product Images</h2>
            <MediaGallerySelector
              selectedImages={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              multiple={true}
            />
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
                {formData.is_cooked && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">Fresh Meals Description Guidelines</p>
                        <p className="text-xs text-amber-700 mt-1">
                          For optimal display on the Fresh Meals page, please keep descriptions concise. 
                          Use the rich text editor for better formatting.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <RichTextEditor
                  content={formData.description}
                  onChange={(content) => setFormData({ ...formData, description: content })}
                  label="📄 Description"
                  placeholder={formData.is_cooked 
                    ? "Enter a concise description for this Fresh Meal item" 
                    : "Enter a detailed description of this product"
                  }
                  description="Main product description that appears on product pages. Supports rich formatting, tables, lists, and more!"
                />
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

          {/* Content & Information - NEW COPY & PASTE SECTIONS */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">📄</span>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Content & Information</h2>
                <p className="text-sm text-gray-600">Product details with rich text formatting</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <RichTextEditor
                  content={formData.ingredients}
                  onChange={(content) => setFormData({ ...formData, ingredients: content })}
                  label="🥬 Ingredients"
                  placeholder="List all ingredients - supports tables, lists, and formatting..."
                  description="Complete ingredient list - paste from anywhere! Tables and lists are automatically formatted."
                />
              </div>

              <div>
                <RichTextEditor
                  content={formData.nutrition_info}
                  onChange={(content) => setFormData({ ...formData, nutrition_info: content })}
                  label="📊 Nutrition & Other Information"
                  placeholder="Nutrition facts, allergen info, storage instructions, or any other details..."
                  description="🌟 Perfect for: Nutrition tables (paste from Excel!), allergen warnings, certifications, storage instructions, or any additional product information."
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
                  {useVariants && <span className="text-xs text-gray-500 ml-2">(Base price if variants enabled)</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required={!useVariants}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    disabled={useVariants}
                  />
                </div>
                {useVariants && (
                  <p className="text-xs text-gray-500 mt-1">
                    Prices are set per variant when using size options
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                  {useVariants && <span className="text-xs text-gray-500 ml-2">(Set per variant)</span>}
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
                    disabled={useVariants}
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
                  {useVariants && <span className="text-xs text-gray-500 ml-2">(Set per variant)</span>}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  disabled={useVariants}
                />
                {useVariants && (
                  <p className="text-xs text-gray-500 mt-1">
                    Stock is tracked per variant when using size options
                  </p>
                )}
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

              {/* Size/Variant Options */}
              <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    📏 Size/Variant Options
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useVariants}
                      onChange={(e) => setUseVariants(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 mr-2"
                    />
                    <span className="text-sm text-gray-600">Enable multiple sizes/variants</span>
                  </label>
                </div>

                {useVariants ? (
                  <div className="space-y-4">
                    {variants.map((variant, index) => (
                      <div key={variant.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-700">
                            Variant {index + 1}
                            {variant.is_default && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Default</span>}
                          </h4>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeVariant(variant.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Size Name *
                            </label>
                            <input
                              type="text"
                              value={variant.size_name}
                              onChange={(e) => updateVariant(variant.id, 'size_name', e.target.value)}
                              placeholder={formData.unit === 'g' ? "e.g., 200g" : formData.unit === 'liter' ? "e.g., 1L" : "e.g., Small"}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              required={useVariants}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Price *
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.price}
                                onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                required={useVariants}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Compare Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.compare_price}
                                onChange={(e) => updateVariant(variant.id, 'compare_price', parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Stock Quantity
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={variant.stock_quantity}
                              onChange={(e) => updateVariant(variant.id, 'stock_quantity', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              SKU
                            </label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                              placeholder="Optional"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                            />
                          </div>
                          
                          <div className="flex items-end">
                            <label className="flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={variant.is_default}
                                onChange={(e) => updateVariant(variant.id, 'is_default', e.target.checked)}
                                className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 mr-2"
                              />
                              <span className="text-sm text-gray-600">Set as default</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addVariant}
                      className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors text-sm"
                    >
                      + Add Another Size/Variant
                    </button>
                    
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>💡 Tip:</strong> Each variant can have different prices and stock levels. Set one as default for initial display.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Enable variants to offer multiple sizes or options with different prices (e.g., 200g for $5.99, 400g for $9.99)
                    </p>
                  </div>
                )}
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

              {/* Partner Purchase URLs - Show for all products */}
              <div className="border-t pt-6">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Online Partner Purchase Links</h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-amber-800">
                      <strong>💡 Pro Tip:</strong> Add partner URLs for delivery options. Fresh Meals can be both pickup AND delivered through partners. 
                      If you don't have your own partner URLs yet, you can use competitor URLs as placeholders.
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
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import RichTextEditor from '@/components/ui/RichTextEditor'
import MediaGallerySelector from '@/components/ui/MediaGallerySelector'

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductVariant {
  id: string
  product_id: string
  size_name: string
  price: number
  compare_price: number | null
  stock_quantity: number
  sku: string | null
  is_default: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  ingredients: string | null
  nutrition_info: string | null
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
  
  // Product variants state
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [useVariants, setUseVariants] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      fetchProduct(),
      fetchCategories(),
      fetchVariants()
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

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('size_name')

      if (error && error.code !== 'PGRST116') throw error // Ignore table not found error
      
      if (data && data.length > 0) {
        setVariants(data)
        setUseVariants(true)
      }
    } catch (error) {
      console.error('Error fetching variants:', error)
    }
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: `new-${Date.now()}`,
      product_id: productId,
      size_name: '',
      price: 0,
      compare_price: null,
      stock_quantity: 100,
      sku: null,
      is_default: variants.length === 0
    }
    setVariants([...variants, newVariant])
  }

  const removeVariant = async (variantId: string) => {
    if (variants.length <= 1) return
    
    // If it's an existing variant (not new), delete from database
    if (!variantId.startsWith('new-')) {
      try {
        const { error } = await supabase
          .from('product_variants')
          .delete()
          .eq('id', variantId)
        
        if (error) throw error
      } catch (error) {
        console.error('Error deleting variant:', error)
        setError('Failed to delete variant')
        return
      }
    }
    
    setVariants(variants.filter(v => v.id !== variantId))
  }

  const updateVariant = (variantId: string, field: keyof ProductVariant, value: any) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        // If setting as default, unset all others
        if (field === 'is_default' && value === true) {
          variants.forEach(variant => {
            if (variant.id !== variantId) variant.is_default = false
          })
        }
        return { ...v, [field]: value }
      }
      return v
    }))
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
        body: JSON.stringify({
          ...product,
          variants: useVariants ? variants : null
        })
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
        {/* Images - Media Gallery */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Product Images</h2>
          <MediaGallerySelector
            selectedImages={product?.images || []}
            onImagesChange={(images) => updateProduct('images', images)}
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

            {/* Product Type Section */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Type
              </label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="is-fresh-meal-edit"
                    checked={product.is_cooked}
                    onChange={(e) => {
                      const isChecked = e.target.checked
                      // If switching to Fresh Meal and description is too long, truncate it
                      const currentDescription = product.description || ''
                      const newDescription = isChecked && currentDescription.length > 152 
                        ? currentDescription.substring(0, 152)
                        : currentDescription
                      
                      updateProduct('is_cooked', isChecked)
                      if (newDescription !== currentDescription) {
                        updateProduct('description', newDescription)
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 mt-1"
                  />
                  <div className="ml-3">
                    <label htmlFor="is-fresh-meal-edit" className="text-sm font-medium text-gray-700 cursor-pointer">
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
                onChange={(e) => {
                  const value = e.target.value
                  // For Fresh Meals (is_cooked), limit to 152 characters
                  if (product.is_cooked && value.length > 152) {
                    return // Don't update if it exceeds limit for Fresh Meals
                  }
                  updateProduct('description', value || null)
                }}
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

        {/* Content & Information - COPY & PASTE SECTIONS */}
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
                content={product?.ingredients || ''}
                onChange={(content) => updateProduct('ingredients', content || null)}
                label="🥬 Ingredients"
                placeholder="List all ingredients - supports tables, lists, and formatting..."
                description="Complete ingredient list - paste from anywhere! Tables and lists are automatically formatted."
              />
            </div>

            <div>
              <RichTextEditor
                content={product?.nutrition_info || ''}
                onChange={(content) => updateProduct('nutrition_info', content || null)}
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
                  value={product.price}
                  onChange={(e) => updateProduct('price', parseFloat(e.target.value) || 0)}
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
                  value={product.compare_price || ''}
                  onChange={(e) => updateProduct('compare_price', parseFloat(e.target.value) || null)}
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
                  value={product.cost_price || ''}
                  onChange={(e) => updateProduct('cost_price', parseFloat(e.target.value) || null)}
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
                value={product.stock_quantity}
                onChange={(e) => updateProduct('stock_quantity', parseInt(e.target.value) || 0)}
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

        {/* Size/Variant Options */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">📏 Size/Variant Options</h2>
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
                        placeholder={product?.unit === 'g' ? "e.g., 200g" : product?.unit === 'liter' ? "e.g., 1L" : "e.g., Small"}
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
                          value={variant.compare_price || ''}
                          onChange={(e) => updateVariant(variant.id, 'compare_price', parseFloat(e.target.value) || null)}
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
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value || null)}
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
                      value={product.uber_eats_url || ''}
                      onChange={(e) => updateProduct('uber_eats_url', e.target.value)}
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
                      onChange={(e) => updateProduct('doordash_url', e.target.value)}
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
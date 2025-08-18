'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, FolderTree, Upload, X, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { imageUploadService } from '@/lib/imageUpload'

type Category = Database['public']['Tables']['categories']['Row']
type NewCategory = Database['public']['Tables']['categories']['Insert']

export default function CategoriesPage() {
  // Fixed edit functionality with proper error handling and loading states
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (submitting) return
    
    // Validation
    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }

    if (!formData.slug.trim()) {
      alert('Category slug is required')
      return
    }
    
    setSubmitting(true)
    
    try {
      const categoryData: NewCategory = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order
      }

      console.log('Submitting category data:', categoryData)
      console.log('Editing category:', editingCategory)

      if (editingCategory) {
        console.log('Updating category with ID:', editingCategory.id)
        const response = await fetch('/api/categories', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingCategory.id,
            ...categoryData
          })
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Update error:', result)
          throw new Error(result.error || 'Failed to update category')
        }
        console.log('Update successful:', result.data)
        alert('Category updated successfully!')
      } else {
        console.log('Creating new category')
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData)
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          console.error('Insert error:', result)
          throw new Error(result.error || 'Failed to create category')
        }
        console.log('Insert successful:', result.data)
        alert('Category created successfully!')
      }

      await fetchCategories()
      resetForm()
      setShowModal(false)
    } catch (error) {
      console.error('Error saving category:', error)
      const errorMessage = error instanceof Error ? error.message : 'Please try again.'
      alert(`Error saving category: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active,
      sort_order: category.sort_order
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete category')
      }
      
      await fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category. Please try again.')
    }
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploading(true)
    setUploadProgress(['Uploading image...'])

    try {
      setUploadProgress(['Uploading image...', 'Processing...'])
      const result = await imageUploadService.uploadImage(file, 'categories')
      
      if (result.success && result.url) {
        setUploadProgress(['Uploading image...', 'Processing...', 'Complete!'])
        
        setFormData({
          ...formData,
          image_url: result.url
        })

        setTimeout(() => setUploadProgress([]), 2000)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert(`Error uploading image: ${error instanceof Error ? error.message : 'Please try again.'}`)
      setUploadProgress([])
    } finally {
      setUploading(false)
    }
  }

  const handleImageDelete = async () => {
    if (!formData.image_url) return

    try {
      await imageUploadService.deleteImage(formData.image_url)
      setFormData({
        ...formData,
        image_url: ''
      })
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Error deleting image. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    })
    setEditingCategory(null)
    setUploadProgress([])
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sort Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-medium text-gray-900">No categories found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Get started by creating a new category.
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Category
                  </button>
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-sm text-gray-500">
                          {category.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image_url ? (
                      <img
                        src={category.image_url}
                        alt={category.name}
                        className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          {/* Modal panel */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                        placeholder="e.g., Rice & Grains"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm bg-white text-gray-900"
                        placeholder="rice-grains"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                        placeholder="Optional description..."
                      />
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image
                      </label>
                      
                      {formData.image_url ? (
                        <div className="space-y-3">
                          <div className="relative inline-block">
                            <img
                              src={formData.image_url}
                              alt="Category preview"
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={handleImageDelete}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                              <Upload className="h-4 w-4" />
                              Replace Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(file)
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                              <Upload className="h-4 w-4" />
                              Upload Image
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleImageUpload(file)
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}

                      {/* Upload Progress */}
                      {uploading && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            Uploading...
                          </div>
                        </div>
                      )}

                      {uploadProgress.length > 0 && !uploading && (
                        <div className="mt-2 space-y-1">
                          {uploadProgress.map((step, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                              {step}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sort Order
                        </label>
                        <input
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={formData.is_active ? 'true' : 'false'}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-3 sm:gap-0">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      submitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {submitting 
                      ? (editingCategory ? 'Updating...' : 'Creating...') 
                      : (editingCategory ? 'Update' : 'Create')
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, FolderTree } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export default function TestCategoriesPageNoAuth() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    console.log('🔄 Starting fetchCategories...')
    try {
      const supabase = createClient()
      console.log('📡 Making Supabase categories query...')
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('❌ Categories Supabase error:', error)
        setError(error.message)
        setCategories(getMockCategories())
      } else {
        console.log('✅ Got categories:', data?.length || 0)
        setCategories(data || [])
      }
    } catch (error) {
      console.error('❌ Categories fetch error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setCategories(getMockCategories())
    } finally {
      console.log('✅ Setting categories loading to false')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Categories (No Auth Test)</h1>
              <p className="text-gray-600">Testing categories page without authentication wrapper</p>
            </div>
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Category</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Active Categories</p>
            <p className="text-2xl font-bold text-green-600">
              {categories.filter(c => c.is_active).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="text-sm text-gray-600">Inactive Categories</p>
            <p className="text-2xl font-bold text-gray-600">
              {categories.filter(c => !c.is_active).length}
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FolderTree className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">/{category.slug}</p>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {category.description && (
                    <p className="mt-3 text-sm text-gray-600">{category.description}</p>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Sort: {category.sort_order}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FolderTree className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500">No categories found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getMockCategories(): Category[] {
  return [
    {
      id: '1',
      name: 'Fresh Produce',
      slug: 'fresh-produce',
      description: 'Fresh fruits and vegetables',
      image_url: null,
      is_active: true,
      sort_order: 1,
      created_at: '2025-01-07T10:00:00Z',
      updated_at: '2025-01-07T10:00:00Z'
    },
    {
      id: '2',
      name: 'Meat & Poultry',
      slug: 'meat-poultry',
      description: 'Fresh and frozen meat products',
      image_url: null,
      is_active: true,
      sort_order: 2,
      created_at: '2025-01-07T10:00:00Z',
      updated_at: '2025-01-07T10:00:00Z'
    },
    {
      id: '3',
      name: 'Pantry Essentials',
      slug: 'pantry-essentials',
      description: 'Rice, flour, spices and cooking ingredients',
      image_url: null,
      is_active: true,
      sort_order: 3,
      created_at: '2025-01-07T10:00:00Z',
      updated_at: '2025-01-07T10:00:00Z'
    }
  ]
}

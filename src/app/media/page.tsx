'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Upload, Search, Trash2, Download, Eye, X } from 'lucide-react'
import { imageUploadService } from '@/lib/imageUpload'

interface MediaItem {
  id: string
  name: string
  url: string
  size?: number
  created_at: string
  metadata?: {
    width?: number
    height?: number
    type?: string
  }
}

export default function MediaGalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewImage, setPreviewImage] = useState<MediaItem | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      setLoading(true)
      
      // Get files from all folders
      const folders = ['', 'products', 'media-gallery', 'product-gallery']
      const allFiles: any[] = []

      for (const folder of folders) {
        const { data: files, error } = await supabase.storage
          .from('product-images')
          .list(folder, {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' }
          })

        if (!error && files) {
          // Add folder info to each file
          const folderFiles = files
            .filter(file => file.name !== '.emptyFolderPlaceholder')
            .map(file => ({
              ...file,
              folder: folder,
              fullPath: folder ? `${folder}/${file.name}` : file.name
            }))
          allFiles.push(...folderFiles)
        }
      }

      // Convert to MediaItem format with public URLs
      const mediaItems: MediaItem[] = allFiles.map(file => ({
        id: file.id || file.fullPath,
        name: file.name,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${file.fullPath}`,
        size: file.metadata?.size,
        created_at: file.created_at,
        metadata: {
          width: file.metadata?.width,
          height: file.metadata?.height,
          type: file.metadata?.mimetype
        }
      }))

      setMedia(mediaItems)
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBulkUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress([])

    try {
      const fileArray = Array.from(files)
      const results = await imageUploadService.uploadMultipleImages(fileArray, 'media-gallery')
      
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length

      setUploadProgress([
        `✅ Successfully uploaded ${successful} images`,
        ...(failed > 0 ? [`❌ ${failed} uploads failed`] : [])
      ])

      // Refresh media list
      await fetchMedia()

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(['❌ Upload failed. Please try again.'])
    } finally {
      setUploading(false)
      setTimeout(() => setUploadProgress([]), 5000)
    }
  }

  const deleteSelectedItems = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Delete ${selectedItems.size} selected item(s)?`)) return

    try {
      const itemsToDelete = Array.from(selectedItems)
      const filePaths = itemsToDelete.map(id => {
        const item = media.find(m => m.id === id)
        // Extract the full path from the URL
        if (item?.url) {
          const urlParts = item.url.split('/product-images/')
          return urlParts[1] // This gives us the full path like 'products/filename.jpg'
        }
        return null
      }).filter(Boolean) as string[]

      const { error } = await supabase.storage
        .from('product-images')
        .remove(filePaths)

      if (error) throw error

      setSelectedItems(new Set())
      await fetchMedia()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const deleteItem = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.name}"?`)) return

    try {
      // Extract the full path from the URL
      const filePath = item.url.split('/product-images/')[1]
      
      const { error } = await supabase.storage
        .from('product-images')
        .remove([filePath])

      if (error) throw error
      await fetchMedia()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const toggleItemSelection = (id: string) => {
    const newSelection = new Set(selectedItems)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedItems(newSelection)
  }

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
            <p className="text-gray-600">Manage all your images in one place</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {viewMode === 'grid' ? 'List View' : 'Grid View'}
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bulk Upload Images</h2>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Upload className={`h-12 w-12 mx-auto mb-4 ${uploading ? 'text-blue-500 animate-pulse' : 'text-gray-400'}`} />
            <p className="text-gray-600 mb-2">
              {uploading ? 'Uploading images...' : 'Drag & drop images here or click to select'}
            </p>
            <p className="text-sm text-gray-500 mb-4">PNG, JPG, WebP, GIF up to 10MB each</p>
            
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
              onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
              className="hidden"
              id="bulk-upload"
              disabled={uploading}
            />
            <label
              htmlFor="bulk-upload"
              className={`inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
                uploading 
                  ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Select Images'}
            </label>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <span className="text-sm text-gray-500">
                {filteredMedia.length} of {media.length} images
              </span>
            </div>
            
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedItems.size} selected</span>
                <button
                  onClick={deleteSelectedItems}
                  className="flex items-center gap-1 px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 text-sm"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Media Grid/List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No images found</p>
              <p className="text-sm text-gray-400">Upload some images to get started</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4' : 'divide-y'}>
              {filteredMedia.map((item) => (
                <div key={item.id} className={viewMode === 'grid' ? 'group relative' : 'flex items-center justify-between p-4'}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewImage(item)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100"
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteItem(item)}
                            className="p-2 bg-white rounded-full hover:bg-red-50 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 truncate" title={item.name}>{item.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(item.size)}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200"
                        />
                        <img src={item.url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(item.size)} • {new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewImage(item)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(item)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-medium">{previewImage.name}</h3>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4">
                <img
                  src={previewImage.url}
                  alt={previewImage.name}
                  className="max-w-full max-h-96 mx-auto"
                />
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <p><strong>Size:</strong> {formatFileSize(previewImage.size)}</p>
                  <p><strong>Uploaded:</strong> {new Date(previewImage.created_at).toLocaleString()}</p>
                  <p><strong>URL:</strong> <code className="bg-gray-100 px-1 rounded text-xs">{previewImage.url}</code></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Search, Check, CloudUpload, Plus } from 'lucide-react'
import { imageUploadService } from '@/lib/imageUpload'

interface MediaItem {
  id: string
  name: string
  url: string
  size?: number
  created_at: string
}

interface MediaGallerySelectorProps {
  selectedImages: string[]
  onImagesChange: (images: string[]) => void
  multiple?: boolean
  className?: string
}

export function MediaGallerySelector({ 
  selectedImages, 
  onImagesChange, 
  multiple = true,
  className = "" 
}: MediaGallerySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadProgress, setUploadProgress] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const [uploadingCount, setUploadingCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

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

      const mediaItems: MediaItem[] = allFiles.map(file => ({
        id: file.id || file.fullPath,
        name: file.name,
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${file.fullPath}`,
        size: file.metadata?.size,
        created_at: file.created_at
      }))

      // Sort by created_at date in descending order (most recent first)
      mediaItems.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime()
        const dateB = new Date(b.created_at || 0).getTime()
        return dateB - dateA // Most recent first
      })

      setMedia(mediaItems)
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen])

  const handleImageSelect = (url: string) => {
    if (multiple) {
      if (selectedImages.includes(url)) {
        onImagesChange(selectedImages.filter(img => img !== url))
      } else {
        onImagesChange([...selectedImages, url])
      }
    } else {
      onImagesChange([url])
      setIsOpen(false)
    }
  }

  const handleUpload = async (files: FileList, showInGallery = false) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress([])
    setUploadingCount(files.length)

    try {
      const fileArray = Array.from(files)
      const results = await imageUploadService.uploadMultipleImages(fileArray, 'product-gallery')
      
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success).length

      setUploadProgress([
        `✅ Successfully uploaded ${successful.length} images`,
        ...(failed > 0 ? [`❌ ${failed} uploads failed`] : [])
      ])

      // Add successful uploads to selection if multiple is true
      if (multiple && successful.length > 0) {
        const newUrls = successful.map(r => r.url!).filter(Boolean)
        onImagesChange([...selectedImages, ...newUrls])
      } else if (!multiple && successful.length > 0) {
        onImagesChange([successful[0].url!])
      }

      // Refresh media list
      await fetchMedia()

    } catch (error) {
      console.error('Upload error:', error)
      setUploadProgress(['❌ Upload failed. Please try again.'])
    } finally {
      setUploading(false)
      setUploadingCount(0)
      setTimeout(() => setUploadProgress([]), 3000)
    }
  }

  // Drag and drop handlers - Fixed to prevent flashing
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragCounter(prev => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0 && !dragActive) {
      setDragActive(true)
    }
  }

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragCounter(prev => {
      const newCount = prev - 1
      if (newCount <= 0) {
        setDragActive(false)
        return 0
      }
      return newCount
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setDragActive(false)
    setDragCounter(0)
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Filter for image files only
      const imageFiles = Array.from(files).filter(file => 
        file.type.startsWith('image/')
      )
      
      if (imageFiles.length > 0) {
        const dt = new DataTransfer()
        imageFiles.forEach(file => dt.items.add(file))
        handleUpload(dt.files, true)
      }
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const removeImage = (url: string) => {
    onImagesChange(selectedImages.filter(img => img !== url))
  }

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={className}>
      {/* Selected Images Display */}
      {selectedImages.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedImages.map((url, index) => (
              <div key={url} className="relative group">
                <img
                  src={url}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                {index === 0 && (
                  <div className="absolute bottom-1 left-1 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📸 Add from Media Gallery
        </button>
        
        <div 
          className={`relative border-2 border-dashed rounded-lg transition-all ${
            dragActive ? 'border-green-400 bg-green-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple={multiple}
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
            id={`upload-${Date.now()}`}
            disabled={uploading}
          />
          <label
            htmlFor={`upload-${Date.now()}`}
            className={`flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            } ${dragActive ? 'text-green-700' : ''}`}
          >
            {dragActive ? (
              <CloudUpload className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {dragActive ? 'Drop images here' : (uploading ? `Uploading ${uploadingCount} files...` : 'Upload New Images')}
          </label>
          
          {dragActive && (
            <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-r from-green-100 to-emerald-100 bg-opacity-90 flex items-center justify-center backdrop-blur-sm">
              <div className="text-center animate-in zoom-in duration-200">
                <div className="relative mb-3">
                  <div className="absolute inset-0 bg-green-200 rounded-full blur-lg opacity-40"></div>
                  <CloudUpload className="h-10 w-10 text-green-600 mx-auto relative animate-bounce" />
                </div>
                <p className="text-sm text-green-800 font-semibold">Drop to upload</p>
                <p className="text-xs text-green-600 mt-1">Multiple files supported</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          {uploadProgress.map((message, index) => (
            <p key={index} className="text-sm text-gray-700">{message}</p>
          ))}
        </div>
      )}

      {/* Media Gallery Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-medium">Select Images from Media Gallery</h3>
                <p className="text-sm text-gray-500">
                  {multiple ? 'Select multiple images' : 'Select an image'} • {selectedImages.length} selected
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Upload Area & Media Grid */}
            <div 
              className="relative p-4 max-h-96 overflow-y-auto transition-all duration-200"
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {/* Beautiful Drag and Drop Overlay */}
              {dragActive && (
                <div className="absolute inset-2 bg-gradient-to-br from-green-50 to-emerald-50 bg-opacity-95 flex items-center justify-center z-50 border-2 border-dashed border-green-400 rounded-xl backdrop-blur-sm">
                  <div className="text-center p-8 animate-in zoom-in duration-200">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-60"></div>
                      <CloudUpload className="h-20 w-20 text-green-500 mx-auto relative animate-bounce" />
                    </div>
                    <p className="text-xl font-semibold text-green-800 mb-2">Drop your images here</p>
                    <p className="text-sm text-green-600 mb-4">Upload multiple images at once</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-green-500">
                      <span className="px-2 py-1 bg-green-100 rounded-full">JPG</span>
                      <span className="px-2 py-1 bg-green-100 rounded-full">PNG</span>
                      <span className="px-2 py-1 bg-green-100 rounded-full">GIF</span>
                      <span className="px-2 py-1 bg-green-100 rounded-full">WEBP</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Hidden File Input for Drag & Drop */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                onChange={(e) => e.target.files && handleUpload(e.target.files, true)}
                className="hidden"
              />

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-16 px-8">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl opacity-40"></div>
                    <CloudUpload className="h-20 w-20 text-gray-400 mx-auto relative" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                  <p className="text-gray-500 mb-6">Get started by uploading your first images</p>
                  
                  {/* Drag and drop area */}
                  <div className="max-w-md mx-auto mb-6 p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:border-green-400 hover:bg-green-50 transition-all duration-200 cursor-pointer"
                       onClick={triggerFileUpload}>
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP, AVIF • Max 150KB per image</p>
                      <p className="text-xs text-orange-600 mt-1">Images larger than 150KB will be auto-optimized</p>
                    </div>
                  </div>

                  <button
                    onClick={triggerFileUpload}
                    disabled={uploading}
                    className={`inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow-md ${
                      uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {uploading ? `Uploading ${uploadingCount} files...` : 'Choose Images'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Upload Button Row */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 bg-gray-50 -mx-4 px-4 py-3 rounded-t-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Click images to select</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CloudUpload className="h-4 w-4 text-green-500" />
                        <span>Drag & drop to upload new images</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span>Most recent uploads first</span>
                      </div>
                    </div>
                    <button
                      onClick={triggerFileUpload}
                      disabled={uploading}
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm shadow-sm hover:shadow-md ${
                        uploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      {uploading ? `Uploading ${uploadingCount}...` : 'Upload More'}
                    </button>
                  </div>

                  {/* Media Grid */}
                  <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {filteredMedia.map((item, index) => {
                      // Check if image was uploaded in the last 24 hours
                      const isNew = item.created_at && 
                        (new Date().getTime() - new Date(item.created_at).getTime()) < 24 * 60 * 60 * 1000;
                      
                      return (
                        <div
                          key={item.id}
                          className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                            selectedImages.includes(item.url)
                              ? 'border-green-500 ring-2 ring-green-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleImageSelect(item.url)}
                        >
                          <div className="aspect-square">
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>

                          {/* NEW Badge for recent uploads */}
                          {isNew && (
                            <div className="absolute top-1 left-1 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold shadow-sm animate-pulse">
                              NEW
                            </div>
                          )}

                          {/* Recent upload indicator (top 5 most recent) */}
                          {index < 5 && (
                            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
                          )}

                          {selectedImages.includes(item.url) && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                              <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                <Check className="h-3 w-3" />
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs truncate">{item.name}</p>
                            {isNew && (
                              <p className="text-xs text-green-300">Recently uploaded</p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* Upload Progress in Modal */}
              {uploadProgress.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm animate-in slide-in-from-top duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800">Upload Results</span>
                  </div>
                  {uploadProgress.map((message, index) => (
                    <p key={index} className="text-sm text-green-700 ml-4">{message}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                </span>
                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    Uploading {uploadingCount} file{uploadingCount !== 1 ? 's' : ''}...
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onImagesChange([])}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={uploading}
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  disabled={uploading}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaGallerySelector
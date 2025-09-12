'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Search, Check } from 'lucide-react'
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
  
  const supabase = createClient()

  const fetchMedia = async () => {
    try {
      setLoading(true)
      
      const { data: files, error } = await supabase.storage
        .from('product-images')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) throw error

      const mediaItems: MediaItem[] = files
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => ({
          id: file.id || file.name,
          name: file.name,
          url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${file.name}`,
          size: file.metadata?.size,
          created_at: file.created_at
        }))

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

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadProgress([])

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
      setTimeout(() => setUploadProgress([]), 3000)
    }
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
        
        <div className="relative">
          <input
            type="file"
            multiple={multiple}
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
            className="hidden"
            id={`upload-${Date.now()}`}
            disabled={uploading}
          />
          <label
            htmlFor={`upload-${Date.now()}`}
            className={`flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload New Images'}
          </label>
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

            {/* Media Grid */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No images found</p>
                  <p className="text-sm text-gray-400">Try uploading some images first</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {filteredMedia.map((item) => (
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
                        />
                      </div>
                      {selectedImages.includes(item.url) && (
                        <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-xs truncate">{item.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-gray-600">
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
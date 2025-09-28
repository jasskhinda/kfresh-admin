import { createClient } from '@/lib/supabase/client'

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export class ImageUploadService {
  private supabase = createClient()
  private bucketName = 'product-images'

  async uploadImage(file: File, folder: string = 'products'): Promise<UploadResult> {
    try {
      console.log('📁 Starting image upload to folder:', folder)
      console.log('📄 File info:', { name: file.name, size: file.size, type: file.type })

      // Check if user is authenticated
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      console.log('👤 Auth check:', { user: !!user, error: authError })

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required. Please log in to upload images.'
        }
      }

      // Validate file
      if (!this.isValidImageFile(file)) {
        return {
          success: false,
          error: 'Invalid file type. Please upload PNG, JPG, WebP, or AVIF images.'
        }
      }

      // Optimize image if larger than 150KB
      const maxSize = 150 * 1024 // 150KB in bytes
      let processedFile = file

      if (file.size > maxSize) {
        console.log('🔄 Image size exceeds 150KB, optimizing...')
        processedFile = await this.optimizeImage(file, maxSize)
        console.log('✅ Image optimized from', Math.round(file.size / 1024), 'KB to', Math.round(processedFile.size / 1024), 'KB')
      }

      // Generate unique filename using processed file
      const fileExt = processedFile.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`
      
      console.log('📤 Upload details:', { fileName, filePath, bucketName: this.bucketName })

      // Upload to Supabase Storage with explicit options (using optimized file)
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, processedFile, {
          cacheControl: '3600',
          upsert: false,
          duplex: 'half'
        })

      console.log('🔄 Upload response:', { data, error })

      if (error) {
        console.error('❌ Upload error:', error)
        
        // Provide more specific error messages
        if (error.message.includes('row-level security')) {
          return {
            success: false,
            error: 'Storage permissions error. Please check your Supabase storage policies.'
          }
        }
        
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        }
      }

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      console.log('🔗 Public URL generated:', urlData.publicUrl)

      return {
        success: true,
        url: urlData.publicUrl
      }

    } catch (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: 'Upload failed. Please try again.'
      }
    }
  }

  async uploadMultipleImages(files: File[], folder: string = 'products'): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, folder))
    return Promise.all(uploadPromises)
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folderName = urlParts[urlParts.length - 2] // Get folder from URL path
      const filePath = `${folderName}/${fileName}`

      const { error } = await this.supabase.storage
        .from(this.bucketName)
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Delete error:', error)
      return false
    }
  }

  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
    return validTypes.includes(file.type)
  }

  // Setup storage bucket (run this once)
  async setupStorageBucket(): Promise<boolean> {
    try {
      // Create bucket if it doesn't exist
      const { data, error } = await this.supabase.storage.createBucket(this.bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
        fileSizeLimit: 10485760 // 10MB
      })

      if (error && error.message !== 'Bucket already exists') {
        console.error('Bucket creation error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Setup error:', error)
      return false
    }
  }

  // Optimize image to target size (150KB max)
  private async optimizeImage(file: File, targetSize: number): Promise<File> {
    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()

        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!

          // Start with original dimensions
          let width = img.width
          let height = img.height

          // Calculate initial quality based on file size
          let quality = 0.9
          if (file.size > targetSize * 5) {
            // If file is > 750KB, start with lower quality
            quality = 0.6
          } else if (file.size > targetSize * 3) {
            // If file is > 450KB, start with medium quality
            quality = 0.7
          }

          // Also reduce dimensions if image is very large
          const maxDimension = 1200
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (maxDimension / width) * height
              width = maxDimension
            } else {
              width = (maxDimension / height) * width
              height = maxDimension
            }
          }

          // Set canvas dimensions
          canvas.width = width
          canvas.height = height

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height)

          // Try different quality levels to get close to target size
          const tryCompress = (q: number) => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  resolve(file) // Fallback to original if compression fails
                  return
                }

                if (blob.size > targetSize && q > 0.3) {
                  // If still too large and quality can be reduced, try again
                  tryCompress(q - 0.1)
                } else {
                  // Convert blob to File
                  const optimizedFile = new File([blob], file.name, {
                    type: blob.type || file.type,
                    lastModified: Date.now()
                  })
                  resolve(optimizedFile)
                }
              },
              file.type === 'image/png' ? 'image/jpeg' : file.type, // Convert PNG to JPEG for better compression
              q
            )
          }

          tryCompress(quality)
        }

        img.src = e.target?.result as string
      }

      reader.readAsDataURL(file)
    })
  }
}

export const imageUploadService = new ImageUploadService()
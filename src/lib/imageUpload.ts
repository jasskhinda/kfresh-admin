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
          error: 'Invalid file type. Please upload PNG, JPG, or WebP images.'
        }
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return {
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        }
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`
      
      console.log('📤 Upload details:', { fileName, filePath, bucketName: this.bucketName })

      // Upload to Supabase Storage with explicit options
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    return validTypes.includes(file.type)
  }

  // Setup storage bucket (run this once)
  async setupStorageBucket(): Promise<boolean> {
    try {
      // Create bucket if it doesn't exist
      const { data, error } = await this.supabase.storage.createBucket(this.bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
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
}

export const imageUploadService = new ImageUploadService()
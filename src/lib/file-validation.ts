import { FileUploadSchema, ImageUploadSchema, type FileUpload, type ImageUpload } from '@/lib/validations'

/**
 * Validates file upload data
 */
export function validateFileUpload(file: File | { name: string; size: number; type: string; lastModified?: number }): FileUpload {
  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: 'lastModified' in file ? file.lastModified : undefined,
  }

  const validation = FileUploadSchema.safeParse(fileData)

  if (!validation.success) {
    const errors = validation.error.errors.map(err => err.message).join(', ')
    throw new Error(`File validation failed: ${errors}`)
  }

  return validation.data
}

/**
 * Validates image upload data with additional image-specific checks
 */
export function validateImageUpload(
  file: File | { name: string; size: number; type: string; lastModified?: number },
  options?: { maxWidth?: number; maxHeight?: number; minWidth?: number; minHeight?: number }
): ImageUpload {
  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: 'lastModified' in file ? file.lastModified : undefined,
  }

  // First validate as regular file
  const fileValidation = FileUploadSchema.safeParse(fileData)
  if (!fileValidation.success) {
    const errors = fileValidation.error.errors.map(err => err.message).join(', ')
    throw new Error(`File validation failed: ${errors}`)
  }

  // Then validate as image
  const imageValidation = ImageUploadSchema.safeParse(fileData)
  if (!imageValidation.success) {
    const errors = imageValidation.error.errors.map(err => err.message).join(', ')
    throw new Error(`Image validation failed: ${errors}`)
  }

  // Additional dimension checks if provided
  if (options && 'width' in file && 'height' in file) {
    const imageData = file as any // Type assertion for dimension properties
    if (options.minWidth && imageData.width < options.minWidth) {
      throw new Error(`Image width must be at least ${options.minWidth}px`)
    }
    if (options.maxWidth && imageData.width > options.maxWidth) {
      throw new Error(`Image width must be at most ${options.maxWidth}px`)
    }
    if (options.minHeight && imageData.height < options.minHeight) {
      throw new Error(`Image height must be at least ${options.minHeight}px`)
    }
    if (options.maxHeight && imageData.height > options.maxHeight) {
      throw new Error(`Image height must be at most ${options.maxHeight}px`)
    }
  }

  return imageValidation.data
}

/**
 * Validates multiple file uploads
 */
export function validateMultipleFileUploads(files: File[]): FileUpload[] {
  return files.map(validateFileUpload)
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Checks if file type is allowed for a specific category
 */
export function isAllowedFileType(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(fileType)
}

/**
 * Calculates file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Generates a safe filename
 */
export function generateSafeFilename(originalName: string, prefix?: string): string {
  const timestamp = Date.now()
  const extension = getFileExtension(originalName)
  const baseName = originalName.replace(/\.[^/.]+$/, '') // Remove extension
  const safeName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_') // Replace unsafe chars
  const prefixStr = prefix ? `${prefix}_` : ''

  return `${prefixStr}${safeName}_${timestamp}.${extension}`
}

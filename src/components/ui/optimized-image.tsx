'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  alt: string
  placeholderType?: 'blur' | 'empty'
  priority?: boolean
}

const OptimizedImage = ({ 
  src, 
  alt, 
  placeholderType = 'empty',
  priority = false,
  ...props 
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate blurDataURL from the image URL if needed
  const getPlaceholder = () => {
    if (placeholderType === 'blur' && !src.startsWith('http')) {
      // In a real app, you would generate actual blur data
      // This is just a placeholder. In real implementation, you'd use:
      // https://github.com/joe-bell/plaiceholder or similar
      return '/placeholder-blur.svg'
    }
    return undefined
  }

  if (hasError) {
    return (
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
        <span className="text-gray-500">Image unavailable</span>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <Image
        src={src}
        alt={alt}
        priority={priority}
        placeholder={placeholderType === 'blur' ? 'blur' : 'empty'}
        blurDataURL={getPlaceholder()}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
        }}
        className={`
          transition-opacity duration-300
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${props.className ?? ''}
        `}
        {...props}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  )
}

export { OptimizedImage }
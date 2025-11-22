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
  const blurDataURL = placeholderType === 'blur' && !src.startsWith('http') ? '/placeholder-blur.svg' : undefined

  if (hasError) {
    return (
      <div className="bg-muted border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
        <span className="text-muted-foreground">Image unavailable</span>
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
        {...(blurDataURL && { blurDataURL })}
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
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}

export { OptimizedImage }
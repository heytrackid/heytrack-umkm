'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Optimized Image Component
 * Lazy loading with blur placeholder and WebP support
 */



interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  fill?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  quality?: number
}

export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
  quality = 75
}: OptimizedImageProps): JSX.Element => {
  const [isLoading] = useState(true)
  const [hasError] = useState(false)

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
   );
}

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={className}
        style={{ objectFit }}
        {...(width && { width })}
        {...(height && { height })}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  )
}

/**
 * Avatar with optimized loading
 */
export const OptimizedAvatar = ({
  src,
  alt,
  size = 40,
  className = ''
}: {
  src: string
  alt: string
  size?: number
  className?: string
}) => (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      objectFit="cover"
      quality={80}
    />
  )

/**
 * Logo with optimized loading
 */
export const OptimizedLogo = ({
  src,
  alt,
  width = 120,
  height = 40,
  className = ''
}: {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) => (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      objectFit="contain"
      priority
      quality={90}
    />
  )

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted ${className}`}
        style={{ width, height }}
      >
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
   );
}

  const resolvedWidth = width ?? 1
  const resolvedHeight = height ?? 1

  const imageClass = `duration-300 ease-in-out ${isLoading ? 'scale-105 blur-sm' : 'scale-100 blur-0'} ${objectFit === 'cover' ? 'object-cover' : ''} ${objectFit === 'contain' ? 'object-contain' : ''}`

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : resolvedWidth}
        height={fill ? undefined : resolvedHeight}
        fill={fill}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={imageClass}
        style={{ objectFit }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError(true)
        }}
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

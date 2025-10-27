'use client'

import Image from 'next/image'
import { forwardRef, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends ComponentProps<typeof Image> {
  /** Show skeleton loader while loading */
  showLoading?: boolean
  /** Custom loading component */
  loadingComponent?: ReactNode
  /** Image priority for LCP optimization */
  priority?: boolean
  /** Container aspect ratio (for responsive sizing) */
  aspectRatio?: 'square' | 'video' | 'auto'
  /** Container className */
  containerClassName?: string
  /** Fallback color if image fails to load */
  fallbackBgColor?: string
}

const aspectRatioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  auto: 'aspect-auto',
}

/**
 * OptimizedImage - Wrapper around Next.js Image with loading states
 * Handles lazy loading, responsive sizes, and loading indicators
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      showLoading = true,
      loadingComponent,
      priority = false,
      aspectRatio = 'auto',
      containerClassName,
      fallbackBgColor = '#f3f4f6',
      className,
      alt,
      onLoadingComplete,
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    const handleLoadingComplete = (result: any) => {
      void setIsLoading(false)
      onLoadingComplete?.(result)
    }

    const handleError = () => {
      void setIsLoading(false)
      void setHasError(true)
    }

    const containerClasses = cn(
      'relative overflow-hidden bg-muted',
      aspectRatioClasses[aspectRatio],
      containerClassName
    )

    return (
      <div className={containerClasses} style={{ backgroundColor: fallbackBgColor }}>
        {isLoading && showLoading && (
          <div className="absolute inset-0 bg-muted animate-pulse z-10" />
        )}

        {hasError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Image failed to load</p>
              <p className="text-xs text-muted-foreground">{alt}</p>
            </div>
          </div>
        ) : (
          <Image
            ref={ref}
            alt={alt || 'Image'}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            onLoadingComplete={handleLoadingComplete}
            onError={handleError}
            className={cn('object-cover w-full h-full', className)}
            {...props}
          />
        )}
      </div>
    )
  }
)

OptimizedImage.displayName = 'OptimizedImage'

/**
 * ProfileImage - Optimized image for user profiles/avatars
 */
export const ProfileImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ containerClassName, ...props }, ref) => (
    <OptimizedImage
      ref={ref}
      containerClassName={cn('rounded-full', containerClassName)}
      aspectRatio="square"
      {...props}
    />
  )
)

ProfileImage.displayName = 'ProfileImage'

/**
 * CardImage - Optimized image for card components
 */
export const CardImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ containerClassName, ...props }, ref) => (
    <OptimizedImage
      ref={ref}
      containerClassName={cn('rounded-md', containerClassName)}
      aspectRatio="video"
      {...props}
    />
  )
)

CardImage.displayName = 'CardImage'

/**
 * Image blur placeholder utility
 */
export function generateBlurDataURL(): string {
  const blurSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <filter id="blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
      </filter>
      <rect width="400" height="300" fill="#f3f4f6" filter="url(#blur)" />
    </svg>
  `
  return `data:image/svg+xml;base64,${Buffer.from(blurSvg).toString('base64')}`
}

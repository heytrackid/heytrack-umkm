'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'





interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    priority?: boolean
    quality?: number
    fill?: boolean
    sizes?: string
    onLoad?: () => void
}

/**
 * Optimized image component with blur placeholder
 */
export const OptimizedImage = ({
    src,
    alt,
    width,
    height,
    className,
    priority = false,
    quality = 75,
    fill = false,
    sizes,
    onLoad
}: OptimizedImageProps) => {
    const [isLoading, setIsLoading] = useState(true)

    return (
        <div className={cn('relative overflow-hidden', className)}>
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                fill={fill}
                sizes={sizes}
                quality={quality}
                priority={priority}
                className={cn(
                    'duration-700 ease-in-out',
                    isLoading ? 'scale-110 blur-lg' : 'scale-100 blur-0'
                )}
                onLoad={() => {
                    setIsLoading(false)
                    onLoad?.()
                }}
            />
            {isLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
        </div>
    )
}

/**
 * Generate blur data URL for placeholder
 */
export function generateBlurDataURL(width = 10, height = 10): string {
    const canvas = typeof document !== 'undefined'
        ? document.createElement('canvas')
        : null

    if (!canvas) {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+'
    }

    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (!ctx) {return ''}

    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, 0, width, height)

    return canvas.toDataURL()
}

/**
 * Lazy load image with intersection observer
 */
export function useLazyImage(ref: React.RefObject<HTMLElement>) {
    const [isVisible, setIsVisible] = useState(false)

    useState(() => {
        if (!ref.current) {return}

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '50px' }
        )

        observer.observe(ref.current)

        return () => observer.disconnect()
    })

    return isVisible
}

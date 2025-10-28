'use client'
import { type ComponentProps, type MouseEvent } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { apiLogger } from '@/lib/logger'
interface PrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetchOnHover?: boolean
  prefetchOnMount?: boolean
}

/**
 * Enhanced Link component with smart prefetching
 * - Automatically prefetches on hover (desktop)
 * - Supports touch devices
 * - Compatible with all Next.js Link props
 */
export const PrefetchLink = ({ 
  href, 
  prefetchOnHover = true,
  prefetchOnMount = false,
  onMouseEnter,
  children,
  ...props 
}: PrefetchLinkProps) => {
  const router = useRouter()
  
  // Prefetch on mount if needed
  if (prefetchOnMount && typeof href === 'string') {
    void router.prefetch(href)
  }
  
  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call original onMouseEnter if provided
    if (onMouseEnter) {
      onMouseEnter(e)
    }
    
    // Prefetch on hover
    if (prefetchOnHover && typeof href === 'string') {
      try {
        void router.prefetch(href)
      } catch (err) {
        // Silently fail - prefetch is enhancement, not critical
        apiLogger.debug(`Prefetch failed for: ${href}`)
      }
    }
  }
  
  return (
    <Link 
      href={href} 
      prefetch // Enable Next.js default prefetch
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </Link>
  )
}

// Export as default for easier migration
export default PrefetchLink

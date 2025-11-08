'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type ComponentProps, type MouseEvent } from 'react'

import { createClientLogger } from '@/lib/client-logger'

const logger = createClientLogger('PrefetchLink')



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
    router.prefetch(href)
  }
  
  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    // Call original onMouseEnter if provided
    if (onMouseEnter) {
      onMouseEnter(e)
    }
    
    // Prefetch on hover
    if (prefetchOnHover && typeof href === 'string') {
      try {
        router.prefetch(href)
      } catch {
        // Silently fail - prefetch is enhancement, not critical
        logger.debug(`Prefetch failed for: ${href}`)
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

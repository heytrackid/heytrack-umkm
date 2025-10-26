'use client'

import { useEffect, useState } from 'react'

/**
 * Detect device orientation
 */
export function useOrientation(): 'portrait' | 'landscape' | undefined {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

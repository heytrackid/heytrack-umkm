'use client'

import { useEffect, useState } from 'react'
import type { ScreenSizeState } from './types'



/**
 * Get current screen size in pixels
 */
export function useScreenSize(): ScreenSizeState {
  const [screenSize, setScreenSize] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') {return}

    const updateSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    void updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return screenSize
}

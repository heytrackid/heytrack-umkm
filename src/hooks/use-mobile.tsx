import { useState, useEffect } from "react"

/**
 * Mobile Detection Hook
 * Detects if the current device is mobile based on screen width
 * 
 * Returns false on server-side to prevent hydration mismatch
 */


const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Start with false to match server-side rendering
  // This prevents hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Only run on client-side
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)

    // Listen for changes
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

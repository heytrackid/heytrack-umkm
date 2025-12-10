'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

interface VersionResponse {
  version: string
  timestamp: number
}

interface UpdateCheckerOptions {
  /** Polling interval in milliseconds (default: 60000 = 1 minute) */
  pollInterval?: number
  /** Whether to enable polling (default: true) */
  enabled?: boolean
}

interface UpdateCheckerResult {
  /** Whether an update is available */
  hasUpdate: boolean
  /** Current version stored locally */
  currentVersion: string | null
  /** Latest version from server */
  latestVersion: string | null
  /** Whether currently checking for updates */
  isChecking: boolean
  /** Manually check for updates */
  checkForUpdate: () => Promise<void>
  /** Dismiss the update notification */
  dismissUpdate: () => void
  /** Refresh the page to get the update */
  applyUpdate: () => void
}

const VERSION_STORAGE_KEY = 'heytrack_app_version'
const DISMISSED_VERSION_KEY = 'heytrack_dismissed_version'

export function useUpdateChecker(options: UpdateCheckerOptions = {}): UpdateCheckerResult {
  const { pollInterval = 60000, enabled = true } = options
  
  const [hasUpdate, setHasUpdate] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const checkForUpdate = useCallback(async () => {
    if (isChecking) return
    
    setIsChecking(true)
    try {
      const response = await fetch('/api/version', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch version')
      }
      
      const data: VersionResponse = await response.json()
      const serverVersion = data.version
      
      setLatestVersion(serverVersion)
      
      // Get stored version
      const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY)
      const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY)
      
      if (!storedVersion) {
        // First visit - store current version
        localStorage.setItem(VERSION_STORAGE_KEY, serverVersion)
        setCurrentVersion(serverVersion)
        setHasUpdate(false)
      } else {
        setCurrentVersion(storedVersion)
        
        // Check if there's a new version and it hasn't been dismissed
        if (serverVersion !== storedVersion && serverVersion !== dismissedVersion) {
          setHasUpdate(true)
        } else {
          setHasUpdate(false)
        }
      }
    } catch (_error) {
      // Silently fail - don't disrupt user experience
      // Error is intentionally ignored to not disrupt UX
    } finally {
      setIsChecking(false)
    }
  }, [isChecking])

  const dismissUpdate = useCallback(() => {
    if (latestVersion) {
      localStorage.setItem(DISMISSED_VERSION_KEY, latestVersion)
    }
    setHasUpdate(false)
  }, [latestVersion])

  const applyUpdate = useCallback(() => {
    if (latestVersion) {
      // Update stored version before refresh
      localStorage.setItem(VERSION_STORAGE_KEY, latestVersion)
      localStorage.removeItem(DISMISSED_VERSION_KEY)
    }
    // Hard refresh to get new assets
    window.location.reload()
  }, [latestVersion])

  // Initial check and polling setup
  useEffect(() => {
    if (!enabled) return

    // Initial check after a short delay to not block initial render
    const initialTimeout = setTimeout(() => {
      void checkForUpdate()
    }, 3000)

    // Set up polling
    intervalRef.current = setInterval(() => {
      void checkForUpdate()
    }, pollInterval)

    return () => {
      clearTimeout(initialTimeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, pollInterval, checkForUpdate])

  // Also check when tab becomes visible
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, checkForUpdate])

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
    isChecking,
    checkForUpdate,
    dismissUpdate,
    applyUpdate
  }
}

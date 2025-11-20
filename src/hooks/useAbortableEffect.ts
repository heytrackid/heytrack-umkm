import { useEffect, useRef } from 'react'

/**
 * Hook for running async operations with automatic abort on unmount
 * Prevents memory leaks from pending fetch requests
 */
export function useAbortableEffect(
  effect: (signal: AbortSignal) => void | (() => void),
  deps: React.DependencyList
): void {
  useEffect(() => {
    const abortController = new AbortController()
    const cleanup = effect(abortController.signal)

    return () => {
      abortController.abort()
      if (cleanup) {
        cleanup()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Hook for safe fetch calls that auto-abort on unmount
 */
export function useAbortableFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList
): {
  execute: () => Promise<T | null>
  abort: () => void
} {
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const execute = async (): Promise<T | null> => {
    // Abort any existing request
    abortControllerRef.current?.abort()
    
    // Create new controller
    abortControllerRef.current = new AbortController()

    try {
      return await fetcher(abortControllerRef.current.signal)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return null
      }
      throw error
    }
  }

  const abort = (): void => {
    abortControllerRef.current?.abort()
  }

  // Re-create execute function when deps change
  useEffect(() => {
    // Just ensure cleanup on deps change
    return () => {
      abortControllerRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { execute, abort }
}

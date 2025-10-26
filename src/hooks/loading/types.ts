/**
 * Loading Hooks Types
 * Type definitions for loading state management
 */

export interface LoadingState {
  [key: string]: boolean
}

export interface UseLoadingReturn {
  loading: LoadingState
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  setLoading: (key: string, value: boolean) => void
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  withLoading: <T>(key: string, fn: () => Promise<T>) => Promise<T>
}

export interface UseMinimumLoadingReturn {
  isLoading: boolean
  startLoading: () => void
  stopLoading: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

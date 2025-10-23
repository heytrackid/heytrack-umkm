/**
 * Shared Hooks Module
 * Reusable custom hooks yang digunakan across domains
 */

// Data Management Hooks (consolidated in @/hooks/useSupabase)
// Re-export from main hooks location
export { useSupabaseCRUD } from '@/hooks/useSupabase'
export { useLocalStorage } from './data/useLocalStorage'
export { useDebounce } from './data/useDebounce'

// UI State Hooks
export { useResponsive } from './ui/useResponsive'

// Note: Other hooks will be implemented as needed
// export { usePagination } from './data/usePagination'
// export { useForm } from './forms/useForm'
// export { useFormValidation } from './forms/useFormValidation'
// export { useFormPersist } from './forms/useFormPersist'
// export { useVirtualization } from './performance/useVirtualization'
// export { useIntersectionObserver } from './performance/useIntersectionObserver'
// export { useMemoizedValue } from './performance/useMemoizedValue'
// export { useApiCall } from './network/useApiCall'
// export { useOptimisticUpdates } from './network/useOptimisticUpdates'
// export { useRealtime } from './network/useRealtime'
// export { usePullToRefresh } from './mobile/usePullToRefresh'
// export { useSwipeGestures } from './mobile/useSwipeGestures'
// export { useTouchGestures } from './mobile/useTouchGestures'

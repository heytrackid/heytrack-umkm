// Data Synchronization - Modular Store Architecture
// This file now re-exports from the modular store architecture
// for better separation of concerns and maintainability

// Re-export types
export * from './data-synchronization/types'

// Re-export modular stores
export * from './stores'

// Re-export composite store for backward compatibility
export { useCompositeDataStore as useDataSynchronization } from './stores'

// Re-export sync manager
export { syncManager } from './stores'

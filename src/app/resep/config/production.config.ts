/**
 * Production Configuration
 * Configuration for production planning and scheduling
 */

export const PRODUCTION_CONFIG = {
  // Batch settings
  MIN_BATCH_SIZE: 1,
  MAX_BATCH_SIZE: 1000,
  DEFAULT_BATCH_SIZE: 10,

  // Time settings (in minutes)
  DEFAULT_PREP_TIME: 30,
  DEFAULT_COOK_TIME: 60,
  BUFFER_TIME: 15,

  // Capacity settings
  MAX_DAILY_BATCHES: 10,
  MAX_CONCURRENT_BATCHES: 3,

  // Status options
  BATCH_STATUSES: {
    PLANNED: 'Direncanakan',
    IN_PROGRESS: 'Sedang Produksi',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan'
  } as const,

  // Priority levels
  PRIORITY_LEVELS: {
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi',
    URGENT: 'Mendesak'
  } as const
} as const

export type BatchStatus = keyof typeof PRODUCTION_CONFIG.BATCH_STATUSES
export type PriorityLevel = keyof typeof PRODUCTION_CONFIG.PRIORITY_LEVELS

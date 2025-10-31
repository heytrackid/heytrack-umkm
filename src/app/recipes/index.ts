// Production Module Barrel Exports
// Comprehensive batch management, quality control, and scheduling system

// Types and interfaces
export type {
  ProductionBatch,
  IngredientAllocation,
  QualityCheck,
  ProductionEquipment,
  ProductionStaff,
  ProductionLog,
  TemperatureLog,
  ProductionStatus,
  BatchPriority,
  QualityCheckPoint,
  QualityStatus,
  ProductionLogType,
  EquipmentType,
  EquipmentStatus,
  StaffRole,
  ProductionSkill,
  CreateBatchData,
  UpdateBatchData,
  ProductionFilters,
  ProductionAnalytics,
  ProductionCapacity,
  BatchSchedule,
  ProductionNotification,
  ProductionValidationError,
  ProductionExportFormat,
  ProductionExportOptions,
  ProductionRealtimeUpdate,
  RecipeProductionData,
  AutoScheduleOptions
} from './types/production.types'

// Configuration and utilities
export {
  PRODUCTION_CONFIG
} from './config/production.config'

export type {
  BatchStatus,
  PriorityLevel
} from './config/production.config'

// Service hooks
export {
  useProductionBatches,
  useQualityChecks,
  useProductionEquipment,
  useProductionStaff,
  useIngredientAllocations,
  useBatchScheduling,
  useProductionCapacity,
  useBatchStatus,
  useProductionAnalytics,
  useProductionNotifications,
  useTemperatureMonitoring,
  useProductionCurrency,
  useBatchValidation
} from './hooks/use-production'

// Module metadata
export const PRODUCTION_MODULE_INFO = {
  name: 'Production Management',
  version: '1.0.0',
  description: 'Comprehensive production management system for Indonesian UMKM operations with batch tracking, quality control, and resource planning',
  features: [
    'Automated batch scheduling and planning',
    'Comprehensive quality control system',
    'Equipment and staff resource management',
    'Temperature monitoring and compliance',
    'Real-time production tracking',
    'Cost analysis and efficiency metrics',
    'Integration with orders and inventory',
    'Indonesian food safety standards (HALAL, BPOM, SNI)',
    'Multi-priority batch processing',
    'Production analytics and reporting',
    'Equipment maintenance tracking',
    'Staff skill matching and workload balancing',
    'Waste tracking and yield optimization'
  ],
  UMKM_specific_features: [
    'Early morning production scheduling (4 AM start)',
    'Temperature-critical process monitoring',
    'Cooling and proofing time management',
    'Ingredient freshness tracking',
    'Batch yield optimization',
    'Equipment capacity planning (ovens, mixers, proofers)',
    'Food safety compliance tracking',
    'Rush order priority handling'
  ],
  dependencies: [
    '@/hooks/useSupabaseCRUD',
    '@/lib/shared/utils/currency',
    '@/app/recipes (integration)',
    '@/app/orders (integration)',
    '@/app/inventory (integration)'
  ]
} as const

// Production workflow states
export const PRODUCTION_WORKFLOW = {
  STANDARD_FLOW: [
    'planned',
    'ingredients_ready',
    'in_progress',
    'quality_check',
    'completed'
  ],
  EMERGENCY_FLOW: [
    'planned',
    'in_progress', // Skip ingredient allocation for rush orders
    'quality_check',
    'completed'
  ],
  QUALITY_FAILURE_FLOW: [
    'quality_check',
    'failed',
    'in_progress' // Retry production
  ]
} as const

// Indonesian UMKM standards
export const INDONESIAN_UMKM_STANDARDS = {
  WORKING_HOURS: {
    EARLY_SHIFT: { start: '04:00', end: '12:00' }, // Fresh bread production
    DAY_SHIFT: { start: '08:00', end: '16:00' },   // Cakes and pastries
    EVENING_SHIFT: { start: '12:00', end: '20:00' } // Next-day prep
  },
  TEMPERATURE_STANDARDS: {
    MIXING: { min: 18, max: 25, unit: 'celsius' },
    PROOFING: { min: 28, max: 35, unit: 'celsius' },
    BAKING_BREAD: { min: 180, max: 220, unit: 'celsius' },
    BAKING_CAKE: { min: 160, max: 180, unit: 'celsius' },
    COOLING: { min: 20, max: 25, unit: 'celsius' },
    STORAGE: { min: 4, max: 8, unit: 'celsius' }
  },
  QUALITY_STANDARDS: {
    MINIMUM_PASS_SCORE: 80,
    CRITICAL_CHECKS: ['temperature', 'appearance', 'texture'],
    SAMPLING_PERCENTAGE: 10,
    INSPECTOR_REQUIRED: true
  },
  COMPLIANCE: {
    HALAL_CERTIFICATION: true,
    BPOM_REGISTRATION: true,
    SNI_STANDARDS: true,
    HACCP_COMPLIANCE: false // Optional initially
  }
} as const
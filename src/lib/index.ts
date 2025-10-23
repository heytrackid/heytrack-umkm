/**
 * Barrel export for all lib utilities
 * Provides convenient single-import access to all library functions
 * 
 * Usage:
 *   import { cn, formatCurrency } from '@/lib'
 *   import { AppError, ValidationError } from '@/lib/errors'
 */

// ============================================================================
// UTILITIES
// ============================================================================

export { cn } from './utils'
export { debounce } from './debounce'
export { logger, uiLogger } from './logger'

// ============================================================================
// VALIDATION & ERRORS
// ============================================================================

export type { ErrorCode, ErrorDetails } from './errors'
export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  DatabaseError,
  AuthError,
  NetworkError,
  handleError,
  getErrorMessage,
  logError,
} from './errors'

export {
  requiredString,
  optionalString,
  positiveNumber,
  nonNegativeNumber,
  email,
  phone,
  uuid,
  rupiah,
  percentage,
  indonesianName,
  IngredientSchema,
  CustomerSchema,
  validateInput,
  sanitizeSQL,
  formatValidationErrors,
  zodErrorsToFieldErrors,
} from './validations'

// ============================================================================
// DATABASE & API
// ============================================================================

export { 
  createSupabaseClient,
  supabase,
  dbService,
} from './supabase'

export {
  apiCache,
  queryCache,
  clearApiCache,
  getCachedData,
  setCachedData,
} from './query-cache'

// ============================================================================
// CURRENCY & CALCULATIONS
// ============================================================================

export { 
  formatCurrentCurrency,
  formatRupiah,
  parseCurrency,
} from './currency'

export {
  calculateHPP,
  calculateMargin,
  calculateMarkup,
  updateHPP,
} from './hpp-calculator'

// ============================================================================
// BUSINESS LOGIC
// ============================================================================

export {
  detectAlerts,
  getAlertSeverity,
  formatAlertMessage,
} from './hpp-alert-detector'

export {
  takeSnapshot,
  getSnapshots,
  compareSnapshots,
} from './hpp-snapshot-manager'

export {
  synchronizeData,
  syncWithExternal,
  handleSyncErrors,
} from './data-synchronization'

export {
  sendNotification,
  createSmartNotification,
  getNotificationPreferences,
} from './smart-notifications'

export {
  sendWhatsAppMessage,
  broadcastMessage,
  scheduleMessage,
} from './whatsapp-service'

// ============================================================================
// AI & AUTOMATION
// ============================================================================

export {
  processChatbotQuery,
  trainNLPModel,
  parseNaturalLanguage,
} from './nlp-processor'

export {
  generateAIInsights,
  getPredictions,
  optimizeInventory,
} from './smart-business'

export {
  detectAnomalies,
  getOptimizations,
  suggestActions,
} from './smart-inventory-intelligence'

export {
  runAutomation,
  scheduleAutomation,
  getAutomationStatus,
} from './automation-engine'

export {
  runScheduledJobs,
  setupCronJobs,
} from './cron-jobs'

// ============================================================================
// EXTERNAL SERVICES
// ============================================================================

export {
  callExternalAI,
  getModelResponse,
} from './external-ai-service'

export {
  getAIChatResponse,
  trainChatbot,
} from './ai-chatbot-service'

// ============================================================================
// PERFORMANCE & OPTIMIZATION
// ============================================================================

export {
  measurePerformance,
  getPerformanceReport,
} from './performance'

export {
  quickPerformanceCheck,
} from './performance-simple'

export {
  optimizeQuery,
  analyzeQueryPerformance,
} from './query-optimization'

export {
  optimizeAPI,
  getOptimizedEndpoints,
} from './optimized-api'

export {
  enhanceAPI,
  addAPIMiddleware,
} from './enhanced-api'

// ============================================================================
// PRODUCTION & AUTOMATION
// ============================================================================

export {
  automateProduction,
  startProduction,
  stopProduction,
} from './production-automation'

export {
  enhanceAutomation,
  getAutomationEnhancements,
} from './enhanced-automation-engine'

// ============================================================================
// VALIDATION & SECURITY
// ============================================================================

export {
  validateAPI,
  validateRequest,
} from './api-validation'

export {
  handleAuthError,
  logAuthError,
  createAuthError,
} from './auth-errors'

export {
  handleAPIError,
  normalizeError,
} from './error-handler'

// Note: The lib directory contains many interdependent modules.
// Import specific items as needed, or use namespace imports for related modules:
// import * as HPP from '@/lib/hpp-*'
// import * as AI from '@/lib/ai-*'
// import * as Automation from '@/lib/automation-*'

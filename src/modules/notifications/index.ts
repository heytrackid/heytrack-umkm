/**
 * Notifications Domain Module
 * Centralized exports untuk semua functionality terkait smart notifications & alerts
 */

// Core notification components
export { default as SmartNotificationCenter } from './components/SmartNotificationCenter'

// Lazy loaded notification components
export { 
  LazySmartNotificationCenter,
  preloadNotificationComponents,
  NotificationCenterWithProgressiveLoading,
  useNotificationProgressiveLoading,
  SmartNotificationLoader,
  LazyNotificationBell
} from './components/LazyComponents'

// Hooks (when added)
// export { useNotifications } from './hooks/useNotifications'
// export { useNotificationSettings } from './hooks/useNotificationSettings'
// export { useRealTimeNotifications } from './hooks/useRealTimeNotifications'

// Services (when added)
// export { NotificationService } from './services/NotificationService'
// export { AlertService } from './services/AlertService'
// export { NotificationRulesEngine } from './services/NotificationRulesEngine'

// Types (when added)
// export type {
//   Notification,
//   NotificationSettings,
//   AlertRule,
//   NotificationChannel,
//   NotificationPriority
// } from './types'

// Utils (when added)
// export { 
//   formatNotificationTime,
//   prioritizeNotifications,
//   filterNotificationsByCategory,
//   playNotificationSound
// } from './utils'

// Constants (when added)
// export { 
//   NOTIFICATION_TYPES, 
//   NOTIFICATION_CATEGORIES,
//   DEFAULT_NOTIFICATION_SETTINGS 
// } from './constants'
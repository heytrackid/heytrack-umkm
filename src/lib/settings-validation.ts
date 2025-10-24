import {
  UserProfileSettingsSchema,
  BusinessInfoSettingsSchema,
  NotificationSettingsSchema,
  RegionalSettingsSchema,
  SecuritySettingsSchema,
  BackupSettingsSchema,
  ThemeSettingsSchema,
  AppSettingsSchema,
  type UserProfileSettings,
  type BusinessInfoSettings,
  type NotificationSettings,
  type RegionalSettings,
  type SecuritySettings,
  type BackupSettings,
  type ThemeSettings,
  type AppSettings
} from '@/lib/validations'

/**
 * Validates user profile settings
 */
export function validateUserProfileSettings(data: unknown): UserProfileSettings {
  const result = UserProfileSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`User profile validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates business information settings
 */
export function validateBusinessInfoSettings(data: unknown): BusinessInfoSettings {
  const result = BusinessInfoSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Business info validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates notification settings
 */
export function validateNotificationSettings(data: unknown): NotificationSettings {
  const result = NotificationSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Notification settings validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates regional settings
 */
export function validateRegionalSettings(data: unknown): RegionalSettings {
  const result = RegionalSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Regional settings validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates security settings
 */
export function validateSecuritySettings(data: unknown): SecuritySettings {
  const result = SecuritySettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Security settings validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates backup settings
 */
export function validateBackupSettings(data: unknown): BackupSettings {
  const result = BackupSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Backup settings validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates theme settings
 */
export function validateThemeSettings(data: unknown): ThemeSettings {
  const result = ThemeSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`Theme settings validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates complete app settings
 */
export function validateAppSettings(data: unknown): AppSettings {
  const result = AppSettingsSchema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(`App settings validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validates individual settings category and returns validation result
 */
export function validateSettingsCategory(category: string, data: unknown): { success: boolean; data?: any; errors?: string[] } {
  try {
    let validatedData: any

    switch (category) {
      case 'user':
        validatedData = validateUserProfileSettings(data)
        break
      case 'business':
        validatedData = validateBusinessInfoSettings(data)
        break
      case 'notifications':
        validatedData = validateNotificationSettings(data)
        break
      case 'regional':
        validatedData = validateRegionalSettings(data)
        break
      case 'security':
        validatedData = validateSecuritySettings(data)
        break
      case 'backup':
        validatedData = validateBackupSettings(data)
        break
      case 'theme':
        validatedData = validateThemeSettings(data)
        break
      default:
        return { success: false, errors: [`Unknown settings category: ${category}`] }
    }

    return { success: true, data: validatedData }
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Validation failed']
    }
  }
}

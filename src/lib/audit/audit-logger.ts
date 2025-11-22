// lib/audit/audit-logger.ts
// Centralized audit logging for user actions and system events

import { apiLogger } from '@/lib/logger'

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'CALCULATE'
  | 'GENERATE'

export type AuditResource =
  | 'customers'
  | 'orders'
  | 'recipes'
  | 'ingredients'
  | 'suppliers'
  | 'expenses'
  | 'financial_records'
  | 'production_batches'
  | 'inventory'
  | 'settings'
  | 'reports'
  | 'hpp'
  | 'ai_sessions'
  | 'whatsapp_templates'
  | 'users'

export interface AuditLogEntry {
  userId: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

/**
 * Centralized audit logger for tracking user actions
 */
export class AuditLogger {
  /**
   * Log a user action
   */
  async logUserAction(
    userId: string,
    action: AuditAction,
    resource: AuditResource,
    resourceId?: string,
    details?: Record<string, unknown>,
    context?: {
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {


    // Log to structured logger
    apiLogger.info(
      {
        audit: true,
        userId,
        action,
        resource,
        resourceId,
        details,
        ipAddress: context?.ipAddress,
        userAgent: context?.userAgent,
      },
      `AUDIT: ${action} ${resource}${resourceId ? `:${resourceId}` : ''}`
    )

    // TODO: In the future, this could also write to a dedicated audit table
    // await this.persistAuditLog(auditEntry)
  }

  /**
   * Log bulk operations
   */
  async logBulkAction(
    userId: string,
    action: AuditAction,
    resource: AuditResource,
    resourceIds: string[],
    details?: Record<string, unknown>,
    context?: {
      ipAddress?: string
      userAgent?: string
    }
  ): Promise<void> {
    await this.logUserAction(
      userId,
      action,
      resource,
      `bulk:${resourceIds.length}`,
      {
        ...details,
        resourceIds,
        count: resourceIds.length,
      },
      context
    )
  }

  /**
   * Log system events (not user-initiated)
   */
  async logSystemEvent(
    event: string,
    details?: Record<string, unknown>
  ): Promise<void> {
    apiLogger.info(
      {
        audit: true,
        systemEvent: true,
        event,
        details,
      },
      `SYSTEM: ${event}`
    )
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger()

// Convenience functions for common audit operations
export const audit = {
  create: (userId: string, resource: AuditResource, resourceId?: string, details?: Record<string, unknown>) =>
    auditLogger.logUserAction(userId, 'CREATE', resource, resourceId, details),

  update: (userId: string, resource: AuditResource, resourceId?: string, details?: Record<string, unknown>) =>
    auditLogger.logUserAction(userId, 'UPDATE', resource, resourceId, details),

  delete: (userId: string, resource: AuditResource, resourceId?: string, details?: Record<string, unknown>) =>
    auditLogger.logUserAction(userId, 'DELETE', resource, resourceId, details),

  read: (userId: string, resource: AuditResource, resourceId?: string, details?: Record<string, unknown>) =>
    auditLogger.logUserAction(userId, 'READ', resource, resourceId, details),

  export: (userId: string, resource: AuditResource, details?: Record<string, unknown>) =>
    auditLogger.logUserAction(userId, 'EXPORT', resource, undefined, details),

  import: (userId: string, resource: AuditResource, details?: Record<string, unknown>) =>
    auditLogger.logUserAction(userId, 'IMPORT', resource, undefined, details),
}
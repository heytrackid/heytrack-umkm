// lib/services/base-service.ts
// Base service class for business logic separation

import type { AuditAction, AuditResource } from '@/lib/audit/audit-logger'
import { auditLogger } from '@/lib/audit/audit-logger'
import { withTransaction } from '@/lib/database/transactions'
import { apiLogger } from '@/lib/logger'
import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ServiceContext {
  userId: string
  supabase: SupabaseClient<Database>
  audit?: boolean
}

export interface ServiceResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

/**
 * Base service class providing common functionality for all business services
 */
export abstract class BaseService {
  protected context: ServiceContext

  constructor(context: ServiceContext) {
    this.context = context
  }

  /**
   * Execute an operation with audit logging
   */
  protected async executeWithAudit<T>(
    operation: () => Promise<T>,
    action: AuditAction,
    resource: AuditResource,
    resourceId?: string,
    details?: Record<string, unknown>
  ): Promise<T> {
    try {
      const result = await operation()

      if (this.context.audit !== false) {
        await auditLogger.logUserAction(
          this.context.userId,
          action,
          resource,
          resourceId,
          details
        )
      }

      return result
    } catch (error) {
      // Log the error but don't audit failed operations
      apiLogger.error({ error, action, resource }, `Service operation failed: ${action} ${resource}`)
      throw error
    }
  }

  /**
   * Execute a database transaction
   */
  protected async executeTransaction<T>(
    operation: (tx: SupabaseClient<Database>) => Promise<T>
  ): Promise<T> {
    return withTransaction(this.context.supabase, operation)
  }

  /**
   * Create a standardized service result
   */
  protected createResult<T>(data: T): ServiceResult<T> {
    return { success: true, data }
  }

  protected createError(error: string, code?: string): ServiceResult {
    return { success: false, error, ...(code && { code }) }
  }

  /**
   * Validate user permissions for an operation
   */
  protected async validatePermission(): Promise<boolean> {
    // Basic permission check - can be extended with role-based permissions
    // For now, just check if user owns the resource or has admin access

    // This is a placeholder - implement actual permission logic based on your requirements
    return true
  }

  /**
   * Get user-specific query filter
   */
  protected getUserFilter(tableAlias: string = ''): Record<string, string> {
    const prefix = tableAlias ? `${tableAlias}.` : ''
    return { [`${prefix}user_id`]: this.context.userId }
  }
}

/**
 * Factory function to create service instances
 */
export function createService<T extends BaseService>(
  ServiceClass: new (context: ServiceContext) => T,
  context: ServiceContext
): T {
  return new ServiceClass(context)
}

/**
 * Service registry for dependency injection
 */
export class ServiceRegistry {
  private static services = new Map<string, unknown>()

  static register<T>(name: string, service: T): void {
    this.services.set(name, service)
  }

  static get<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined
  }

  static clear(): void {
    this.services.clear()
  }
}
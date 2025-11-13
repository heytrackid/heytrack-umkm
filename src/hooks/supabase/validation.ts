
/**
 * Validation utilities for Supabase operations
 */

/**
 * Validate Supabase query parameters
 */
export function validateQueryParams(params: {
  select?: string
  filter?: Record<string, unknown>
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
}): void {
  if (params.limit && (params.limit < 1 || params.limit > 10000)) {
    throw new Error('Limit must be between 1 and 10000')
  }

  if (params.select && typeof params.select !== 'string') {
    throw new Error('Select must be a string')
  }

  if (params.filter && typeof params.filter !== 'object') {
    throw new Error('Filter must be an object')
  }
}

/**
 * Validate CRUD operation data
 */
export function validateCRUDData(
  operation: 'create' | 'update',
  data: Record<string, unknown>,
  id?: string
): void {
  if (!data || typeof data !== 'object') {
    throw new Error('Data must be a valid object')
  }

  if (operation === 'update' && !id) {
    throw new Error('ID is required for update operations')
  }

  // Check for required fields based on common patterns
  if (operation === 'create' && data['created_at'] === undefined) {
    data['created_at'] = new Date().toISOString()
  }

  if (data['updated_at'] !== undefined) {
    data['updated_at'] = new Date().toISOString()
  }
}

/**
 * Sanitize query filters to prevent injection
 */
export function sanitizeFilters(filters: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(filters)) {
    // Basic sanitization - remove any potentially dangerous values
    if (typeof value === 'string' && value.length > 1000) {
      throw new Error(`Filter value for ${key} is too long`)
    }

    if (typeof value === 'object' && value !== null) {
      // For complex objects, only allow simple types
      throw new Error(`Complex filter values not allowed for ${key}`)
    }

    sanitized[key] = value
  }

  return sanitized
}

/**
 * Validate table name exists in schema
 */
export function validateTableName(tableName: string, allowedTables: string[]): void {
  if (!allowedTables.includes(tableName)) {
    throw new Error(`Table ${tableName} is not allowed`)
  }
}

/**
 * Pino Logger Configuration
 * 
 * High-performance logging with Pino
 * - Development: Pretty formatted logs
 * - Production: JSON structured logs
 */

import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Configure Pino logger
const logger = pino({
  level: isTest ? 'silent' : isDevelopment ? 'debug' : 'info',
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
})

/**
 * Create a child logger with context
 */
export const createLogger = (context: string) => logger.child({ context })

/**
 * Helper to safely serialize errors for logging
 * Handles non-serializable properties like Error objects
 */
export const serializeError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    const serialized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
    
    if (error.cause) {
      serialized.cause = serializeError(error.cause)
    }
    
    return serialized
  }
  
  if (typeof error === 'object' && error !== null) {
    return { error: String(error) }
  }
  
  return { error: String(error) }
}

/**
 * Helper to log errors safely in API routes
 * Usage: logError(apiLogger, error, 'Failed to create order', { userId, orderId })
 */
export const logError = (
  logger: pino.Logger,
  error: unknown,
  message: string,
  context?: Record<string, unknown>
) => {
  logger.error({
    ...(context || {}),
    error: serializeError(error),
  }, message)
}

// Context-specific loggers
export const apiLogger = createLogger('API')
export const dbLogger = createLogger('Database')
export const authLogger = createLogger('Auth')
export const automationLogger = createLogger('Automation')
export const uiLogger = createLogger('UI')
export const middlewareLogger = createLogger('Middleware')
export const productionLogger = createLogger('ProductionService')
export const inventoryLogger = createLogger('InventoryService')

// Default export
export default logger

// Re-export for convenience
export { logger }

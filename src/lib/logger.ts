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
  level: isTest ? 'silent' : isDevelopment ? 'info' : 'info',
  browser: {
    asObject: true,
  },
  // Disable transport in development to avoid thread-stream issues
  // ...(isDevelopment && {
  //   transport: {
  //     target: 'pino-pretty',
  //     options: {
  //       colorize: true,
  //       translateTime: 'HH:MM:ss',
  //       ignore: 'pid,hostname',
  //     },
  //   },
  // }),
})

// Suppress logs in test environment
if (isTest) {
  logger.level = 'silent'
}

/**
 * Create a child logger with context
 */
export const createLogger = (context: string) => {
  return logger.child({ context })
}

// Context-specific loggers
export const apiLogger = createLogger('API')
export const dbLogger = createLogger('Database')
export const authLogger = createLogger('Auth')
export const cronLogger = createLogger('Cron')
export const automationLogger = createLogger('Automation')
export const uiLogger = createLogger('UI')
export const middlewareLogger = createLogger('Middleware')
export const productionLogger = createLogger('ProductionService')
export const inventoryLogger = createLogger('InventoryService')

// Default export
export default logger

// Re-export for convenience
export { logger }

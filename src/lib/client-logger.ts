
/**
 * Client-Side Logger
 *
 * Structured logger for client components
 * Uses console methods for browser compatibility but with structured format
 * 
 * Note: Console usage is intentional here for client-side logging
 * This is a wrapper that provides structured logging interface
 */

/* eslint-disable no-console */

type LogContext = Record<string, unknown>

interface LoggerContext {
  context?: string
  [key: string]: unknown
}

/**
 * Client-safe logger using console methods
 */
class ClientLogger {
  private context: LoggerContext

  constructor(context?: LoggerContext) {
    this.context = context || {}
  }

  info(obj: LogContext | string, msg?: string): void {
    if (typeof obj === 'string') {
      console.info(`[${this.context.context || 'Client'}] ${obj}`)
    } else if (msg) {
      console.info(`[${this.context.context || 'Client'}] ${msg}`, { ...this.context, ...obj })
    } else {
      console.info({ ...this.context, ...obj })
    }
  }

  error(obj: LogContext | string, msg?: string): void {
    if (typeof obj === 'string') {
      console.error(`[${this.context.context || 'Client'}] ${obj}`)
    } else if (msg) {
      console.error(`[${this.context.context || 'Client'}] ${msg}`, { ...this.context, ...obj })
    } else {
      console.error({ ...this.context, ...obj })
    }
  }

  warn(obj: LogContext | string, msg?: string): void {
    if (typeof obj === 'string') {
      console.warn(`[${this.context.context || 'Client'}] ${obj}`)
    } else if (msg) {
      console.warn(`[${this.context.context || 'Client'}] ${msg}`, { ...this.context, ...obj })
    } else {
      console.warn({ ...this.context, ...obj })
    }
  }

  debug(obj: LogContext | string, msg?: string): void {
    if (typeof obj === 'string') {
      console.debug(`[${this.context.context || 'Client'}] ${obj}`)
    } else if (msg) {
      console.debug(`[${this.context.context || 'Client'}] ${msg}`, { ...this.context, ...obj })
    } else {
      console.debug({ ...this.context, ...obj })
    }
  }

  child(context: LoggerContext): ClientLogger {
    return new ClientLogger({ ...this.context, ...context })
  }
}

/**
 * Create a client logger instance
 */
export const createClientLogger = (context?: string): ClientLogger => {
  return new ClientLogger({ context })
}

/**
 * Default client logger instance
 */
export const clientLogger = createClientLogger()

// Pre-configured loggers for common use cases
export const uiLogger = createClientLogger('UI')
export const queryLogger = createClientLogger('Query')
export const formLogger = createClientLogger('Form')
export const performanceLogger = createClientLogger('Performance')
export const securityLogger = createClientLogger('Security')

// Default export
const logger = new ClientLogger()
export { logger }
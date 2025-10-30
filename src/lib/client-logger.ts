/**
 * Client-Side Logger
 * 
 * Safe logging utilities for client components
 * Uses console in development, can be extended to send to error tracking service
 */

interface LogContext {
  [key: string]: unknown
}

/**
 * Client-safe logger that works in browser
 */
class ClientLogger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private formatMessage(level: string, message: string, data?: LogContext): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] [${this.context}] ${message}`
  }

  info(message: string, data?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('INFO', message), data || '')
    }
  }

  warn(message: string, data?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(this.formatMessage('WARN', message), data || '')
    }
  }

  error(message: string, error?: unknown, data?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(this.formatMessage('ERROR', message), { error, ...data })
    }
    
    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { ...data } })
  }

  debug(message: string, data?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message), data || '')
    }
  }
}

/**
 * Create a client logger with context
 */
export const createClientLogger = (context: string): ClientLogger => {
  return new ClientLogger(context)
}

// Pre-configured loggers for common use cases
export const uiLogger = createClientLogger('UI')
export const queryLogger = createClientLogger('Query')
export const formLogger = createClientLogger('Form')

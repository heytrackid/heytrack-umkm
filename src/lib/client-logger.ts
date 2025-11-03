

/**
 * Client-Side Logger
 * 
 * Pino-compatible logger for client components
 * Uses console in browser, API matches Pino for consistency
 */

type LogContext = Record<string, unknown>

/**
 * Check if we're in development mode
 */
const isDevelopment = (): boolean => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true
  }
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  }
  return false
}

/**
 * Client-safe logger with Pino-compatible API
 */
class ClientLogger {
  private context: Record<string, unknown>

  constructor(context: Record<string, unknown> = {}) {
    this.context = context
  }

  /**
   * Format log entry to match Pino structure
   */
  private formatLog(level: string, obj: LogContext | string, msg?: string): void {
    const timestamp = new Date().toISOString()
    const logLevel = level.toUpperCase()
    
    let data: LogContext = {}
    let message = ''

    // Pino-style: logger.info(obj, msg) or logger.info(msg)
    if (typeof obj === 'string') {
      message = obj
      if (msg) {
        data = { extra: msg }
      }
    } else {
      data = obj
      message = msg ?? ''
    }

    const logEntry = {
      time: timestamp,
      level: logLevel,
      ...this.context,
      ...data,
      ...(message && { msg: message })
    }

    // Use appropriate console method
    /* eslint-disable no-console */
    const getConsoleMethod = () => {
      if (level === 'error') {return console.error}
      if (level === 'warn') {return console.warn}
      if (level === 'debug') {return console.debug}
      return console.log
    }
    const consoleMethod = getConsoleMethod()
    /* eslint-enable no-console */

    if (isDevelopment()) {
      consoleMethod(
        `[${timestamp}] ${logLevel}${this.context.context ? ` [${this.context.context}]` : ''}:`,
        message || data,
        Object.keys(data).length > 0 && message ? data : ''
      )
    }

    // In production, send to error tracking service
    if (!isDevelopment() && (level === 'error' || level === 'warn')) {
      this.sendToMonitoring(logEntry)
    }
  }

  /**
   * Send error to monitoring service (placeholder)
   */
  private sendToMonitoring(logEntry: LogContext): void {
    if (typeof window !== 'undefined' && 'sendBeacon' in navigator) {
      try {
        navigator.sendBeacon('/api/errors', JSON.stringify(logEntry))
      } catch {
        // Silently fail if sendBeacon doesn't work
      }
    }
  }

  /**
   * Pino-style info logger
   * Usage: logger.info('message') or logger.info({ data }, 'message')
   */
  info(obj: LogContext | string, msg?: string): void {
    this.formatLog('info', obj, msg)
  }

  /**
   * Pino-style warn logger
   */
  warn(obj: LogContext | string, msg?: string): void {
    this.formatLog('warn', obj, msg)
  }

  /**
   * Pino-style error logger
   */
  error(obj: LogContext | string, msg?: string): void {
    this.formatLog('error', obj, msg)
  }

  /**
   * Pino-style debug logger
   */
  debug(obj: LogContext | string, msg?: string): void {
    if (isDevelopment()) {
      this.formatLog('debug', obj, msg)
    }
  }

  /**
   * Create child logger with additional context (Pino-compatible)
   */
  child(bindings: LogContext): ClientLogger {
    return new ClientLogger({ ...this.context, ...bindings })
  }
}

/**
 * Create a client logger with context (Pino-compatible)
 */
export const createClientLogger = (context: string): ClientLogger => 
  new ClientLogger({ context })

// Pre-configured loggers for common use cases
export const uiLogger = createClientLogger('UI')
export const queryLogger = createClientLogger('Query')
export const formLogger = createClientLogger('Form')
export const performanceLogger = createClientLogger('Performance')
export const securityLogger = createClientLogger('Security')

// Default export
const logger = new ClientLogger()
export default logger

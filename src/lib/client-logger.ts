

/**
 * Client-Side Logger
 * 
 * Pino-compatible logger for client components
 * Uses console in browser, API matches Pino for consistency
 */

type LogContext = Record<string, unknown>

interface LoggerContext {
  context?: string
  [key: string]: unknown
}

/**
 * Check if we're in development mode or if logging is explicitly enabled
 */
const isDevelopment = (): boolean => {
  // Check for explicit logging flag from Next.js public env
  if (typeof window !== 'undefined' && (window as Window & { NEXT_PUBLIC_ENABLE_CLIENT_LOGS?: string }).NEXT_PUBLIC_ENABLE_CLIENT_LOGS === 'true') {
    return true
  }
  // Check if we're in development by checking hostname
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('vercel-preview') ||
           window.location.hostname.includes('vercel-stage')
  }
  return false
}

/**
 * Safe console wrapper to prevent logging errors from breaking the app
 */
const safeConsole = {
  log: (...args: unknown[]): void => {
    try {
      console.log(...args)
    } catch {
      // Silently fail if console is not available or throws
    }
  },
  error: (...args: unknown[]): void => {
    try {
      console.error(...args)
    } catch {
      // Silently fail if console is not available or throws
    }
  },
  warn: (...args: unknown[]): void => {
    try {
      console.warn(...args)
    } catch {
      // Silently fail if console is not available or throws
    }
  },
  debug: (...args: unknown[]): void => {
    try {
      console.debug(...args)
    } catch {
      // Silently fail if console is not available or throws
    }
  }
}

/**
 * Client-safe logger with Pino-compatible API
 */
class ClientLogger {
  private readonly context: LoggerContext

  constructor(context: LoggerContext = {}) {
    this.context = context
  }

  /**
   * Format log entry to match Pino structure
   */
  private formatLog(level: string, obj: LogContext | string, msg?: string | LogContext): void {
    const timestamp = new Date().toISOString()
    const logLevel = level.toUpperCase()
    
    let data: LogContext = {}
    let message = ''

    // Pino-style: logger.info(obj, msg) or logger.info(msg)
    if (typeof obj === 'string') {
      message = obj
      if (msg) {
        if (typeof msg === 'string') {
          data = { extra: msg }
        } else {
          // msg is LogContext, merge it into data
          data = msg
        }
      }
    } else {
      data = obj
      if (typeof msg === 'string') {
        message = msg
      } else if (msg) {
        // msg is LogContext, merge it into data
        data = { ...data, ...msg }
      }
    }

    const logEntry = {
      time: timestamp,
      level: logLevel,
      ...this.context,
      ...data,
      ...(message && { msg: message })
    }

    // Use appropriate console method

    const getConsoleMethod = () => {
      if (level === 'error') {return safeConsole.error}
      if (level === 'warn') {return safeConsole.warn}
      if (level === 'debug') {return safeConsole.debug}
      return safeConsole.log
    }
    const consoleMethod = getConsoleMethod()
     

    if (isDevelopment()) {
      try {
        // Sanitize data to prevent circular reference issues
        const sanitizeData = (obj: LogContext): LogContext => {
          // Special handling for Error objects
          if (obj instanceof Error && typeof obj.message === 'string' && typeof obj.name === 'string') {
            try {
              return {
                message: obj.message,
                name: obj.name,
                stack: obj.stack ? '[Error Stack]' : undefined,
                // Add other enumerable properties if they exist
                ...Object.fromEntries(
                  Object.entries(obj).map(([key, value]) => [
                    key,
                    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                      ? value
                      : '[Complex Property]'
                  ])
                )
              }
            } catch (serializationError) {
              // If Object.entries fails, return a safe fallback
              return {
                message: obj.message || '[No message]',
                name: obj.name || 'Error',
                stack: obj.stack ? '[Error Stack]' : undefined,
                error: '[Error object serialization failed]',
                serializationError: serializationError instanceof Error ? serializationError.message : String(serializationError)
              }
            }
          }

          // Create a safe shallow copy to avoid circular references
          const safe: LogContext = {}
          try {
            for (const key in obj) {
              if (Object.hasOwn(obj, key)) {
                const value = obj[key]
                if (value === null || value === undefined) {
                  safe[key] = value
                } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                  safe[key] = value
                } else {
                  // For complex objects, just mark as complex to avoid issues
                  safe[key] = '[Complex Object]'
                }
              }
            }
          } catch {
            // If anything fails, return empty object
            return {}
          }
          return safe
        }

        const sanitizedData = data && typeof data === 'object' ? sanitizeData(data) : data
        const hasData = sanitizedData && typeof sanitizedData === 'object' ? Object.keys(sanitizedData).length > 0 : Boolean(sanitizedData)

        if (message && hasData) {
          // Both message and data exist - log them separately to preserve console formatting
          consoleMethod(
            `[${timestamp}] ${logLevel}${this.context.context ? ` [${this.context.context}]` : ''}:`,
            message,
            sanitizedData
          )
        } else if (message) {
          // Only message exists
          consoleMethod(
            `[${timestamp}] ${logLevel}${this.context.context ? ` [${this.context.context}]` : ''}:`,
            message
          )
        } else if (hasData) {
          // Only data exists - log separately to preserve console formatting
          consoleMethod(
            `[${timestamp}] ${logLevel}${this.context.context ? ` [${this.context.context}]` : ''}:`,
            sanitizedData
          )
        } else {
          // Neither exists
          consoleMethod(
            `[${timestamp}] ${logLevel}${this.context.context ? ` [${this.context.context}]` : ''}:`
          )
        }
      } catch {
        // Fallback logging if console fails
        consoleMethod(
          `[${timestamp}] ${logLevel}${this.context.context ? ` [${this.context.context}]` : ''}:`,
          'Logging error occurred'
        )
      }
    }

    // In production, send to error tracking service
    if (!isDevelopment() && (level === 'error' || level === 'warn')) {
      this.sendToMonitoring(logEntry)
    }
  }

  /**
   * Send error to monitoring service
   */
  private sendToMonitoring(logEntry: LogContext): void {
    if (typeof window !== 'undefined') {
      try {
        // Use sendBeacon with proper Content-Type
        if ('sendBeacon' in navigator) {
          const blob = new Blob([JSON.stringify(logEntry)], {
            type: 'application/json'
          })
          navigator.sendBeacon('/api/errors', blob)
        } else {
          // Fallback to fetch for browsers without sendBeacon
          void fetch('/api/errors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(logEntry),
            keepalive: true, // Similar to sendBeacon behavior
          }).catch(() => {
            // Silently fail - error reporting shouldn't break the app
          })
        }
      } catch {
        // Silently fail if error reporting doesn't work
      }
    }
  }

  /**
   * Pino-style info logger
   * Usage: logger.info('message') or logger.info({ data }, 'message')
   */
  info(obj: LogContext | string, msg?: string | LogContext): void {
    this.formatLog('info', obj, msg)
  }

  /**
   * Pino-style warn logger
   */
  warn(obj: LogContext | string, msg?: string | LogContext): void {
    this.formatLog('warn', obj, msg)
  }

  /**
   * Pino-style error logger
   */
  error(obj: LogContext | string, msg?: string | LogContext): void {
    this.formatLog('error', obj, msg)
  }

  /**
   * Pino-style debug logger
   */
  debug(obj: LogContext | string, msg?: string | LogContext): void {
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
export { logger }
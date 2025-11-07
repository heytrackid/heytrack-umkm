

/**
 * Client-Side Logger
 * 
 * Pino-compatible logger for client components
 * Uses console in browser, API matches Pino for consistency
 */

type LogContext = Record<string, unknown>

/**
 * Check if we're in development mode or if logging is explicitly enabled
 */
const isDevelopment = (): boolean => {
  // Check for explicit logging flag
  if (typeof process !== 'undefined' && process['env']?.['NEXT_PUBLIC_ENABLE_CLIENT_LOGS'] === 'true') {
    return true
  }
  if (typeof process !== 'undefined' && process['env']?.NODE_ENV === 'development') {
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
  private readonly context: Record<string, unknown>

  constructor(context: Record<string, unknown> = {}) {
    this['context'] = context
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
    /* eslint-disable no-console, heytrack/no-console-usage */
    const getConsoleMethod = () => {
      if (level === 'error') {return console.error}
      if (level === 'warn') {return console.warn}
      if (level === 'debug') {return console.debug}
      return console.log
    }
    const consoleMethod = getConsoleMethod()
    /* eslint-enable no-console */

    if (isDevelopment()) {
      try {
        // Sanitize data to prevent circular reference issues
        const sanitizeData = (obj: LogContext): LogContext => {
          // Special handling for Error objects
          if (obj instanceof Error) {
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
            `[${timestamp}] ${logLevel}${this['context']['context'] ? ` [${this['context']['context']}]` : ''}:`,
            message,
            sanitizedData
          )
        } else if (message) {
          // Only message exists
          consoleMethod(
            `[${timestamp}] ${logLevel}${this['context']['context'] ? ` [${this['context']['context']}]` : ''}:`,
            message
          )
        } else if (hasData) {
          // Only data exists - log separately to preserve console formatting
          consoleMethod(
            `[${timestamp}] ${logLevel}${this['context']['context'] ? ` [${this['context']['context']}]` : ''}:`,
            sanitizedData
          )
        } else {
          // Neither exists
          consoleMethod(
            `[${timestamp}] ${logLevel}${this['context']['context'] ? ` [${this['context']['context']}]` : ''}:`
          )
        }
      } catch (_error) {
        // Fallback logging if console fails
        consoleMethod(
          `[${timestamp}] ${logLevel}${this['context']['context'] ? ` [${this['context']['context']}]` : ''}:`,
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
    return new ClientLogger({ ...this['context'], ...bindings })
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

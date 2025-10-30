/**
 * Client-side logger utility
 * 
 * Use this for logging in client components (browser environment).
 * For server-side logging, use apiLogger from @/lib/logger
 * 
 * Features:
 * - Structured logging with context
 * - Development/production mode awareness
 * - Consistent format with server-side logger
 * - Type-safe
 */

interface LogContext {
  [key: string]: any
}

class ClientLogger {
  private isDev = process.env.NODE_ENV === 'development'

  /**
   * Log info message (only in development)
   */
  info(context: LogContext, message: string): void {
    if (this.isDev) {
      console.log(`[Client] ${message}`, context)
    }
  }

  /**
   * Log error message (always logged)
   */
  error(context: LogContext, message: string): void {
    console.error(`[Client] ${message}`, context)
  }

  /**
   * Log warning message (always logged)
   */
  warn(context: LogContext, message: string): void {
    console.warn(`[Client] ${message}`, context)
  }

  /**
   * Log debug message (only in development)
   */
  debug(context: LogContext, message: string): void {
    if (this.isDev) {
      console.debug(`[Client] ${message}`, context)
    }
  }
}

export const clientLogger = new ClientLogger()

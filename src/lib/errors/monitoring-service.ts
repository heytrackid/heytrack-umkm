import { apiLogger } from '@/lib/logger'


/**
 * Error Monitoring Service
 * Integrates with external error monitoring services like Sentry, LogRocket, etc.
 */


interface ErrorEvent {
  message: string
  stack?: string
  name?: string
  timestamp: string
  _context?: Record<string, unknown>
  _user?: {
    id?: string
    email?: string
    username?: string
  }
  tags?: Record<string, string>
  level?: 'debug' | 'error' | 'fatal' | 'info' | 'warning'
  url?: string
  userAgent?: string
  componentStack?: string
}

interface MonitoringServiceConfig {
  dsn?: string
  enabled?: boolean
  environment?: string
  release?: string
  sampleRate?: number
  beforeSend?: (event: ErrorEvent) => ErrorEvent | null
}

class ErrorMonitoringService {
  private config: MonitoringServiceConfig
  private enabled: boolean
  private globalErrorHandler: ((event: globalThis.ErrorEvent) => void) | null = null
  private globalRejectionHandler: ((event: globalThis.PromiseRejectionEvent) => void) | null = null

  constructor(config?: MonitoringServiceConfig) {
    this.config = {
      enabled: true,
      environment: process['env'].NODE_ENV || 'development',
      release: process['env']?.['NEXT_PUBLIC_APP_VERSION'] ?? '1.0.0',
      sampleRate: 1.0,
      beforeSend: (event) => event,
      ...config
    }
    this.enabled = this.config.enabled ?? false
  }

  /**
   * Initialize error monitoring service
   */
  init(config?: MonitoringServiceConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
      this.enabled = this.config.enabled ?? false
    }
    
    // Set up global error handlers
    this.setupGlobalHandlers()
    
    apiLogger.info({ 
      environment: this.config.environment,
      release: this.config.release 
    }, 'Error monitoring service initialized')
  }

  /**
   * Capture exception
   */
  captureException(
    error: Error, 
    context: {
      _user?: ErrorEvent['_user']
      tags?: ErrorEvent['tags']
      extra?: Record<string, unknown>
      level?: ErrorEvent['level']
    } = {}
  ): void {
    if (!this.enabled) {
      apiLogger.debug({ message: error.message }, 'Error monitoring disabled')
      return
    }

    // Skip if sample rate is lower than random value
    if (Math.random() > (this.config.sampleRate ?? 1.0)) {
      return
    }

    const tags: Record<string, string> = {
      ...(context.tags ?? {}),
      environment: this.config.environment ?? 'development',
      release: this.config.release ?? '1.0.0'
    }

    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      _context: context.extra,
      _user: context._user,
      tags,
      level: context.level ?? 'error',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' 
        ? window.navigator.userAgent 
        : undefined,
    }

    // Apply beforeSend hook if provided
    const processedEvent = this.config.beforeSend?.(errorEvent) ?? errorEvent
    
    if (processedEvent) {
      // Log to console in development or if no external service is configured
      if (process['env'].NODE_ENV === 'development' || !this.config.dsn) {
        apiLogger.error({
          ...processedEvent,
          error
        }, 'Captured error (development mode)')
      } else {
        // Send to external error monitoring service
        this.sendError(processedEvent)
      }
    }
  }

  /**
   * Capture message
   */
  captureMessage(
    message: string, 
    level: ErrorEvent['level'] = 'error',
    _context: {
      _user?: ErrorEvent['_user']
      tags?: ErrorEvent['tags']
      extra?: Record<string, unknown>
    } = {}
  ): void {
    if (!this.enabled) {
      apiLogger.debug({ message }, 'Error monitoring disabled')
      return
    }

    const tags: Record<string, string> = {
      ...(_context.tags ?? {}),
      environment: this.config.environment ?? 'development',
      release: this.config.release ?? '1.0.0'
    }

    const errorEvent: ErrorEvent = {
      message,
      timestamp: new Date().toISOString(),
      _context: _context.extra,
      _user: _context._user,
      tags,
      level,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' 
        ? window.navigator.userAgent 
        : undefined,
    }

    const processedEvent = this.config.beforeSend?.(errorEvent) ?? errorEvent
    
    if (processedEvent) {
      if (process['env'].NODE_ENV === 'development' || !this.config.dsn) {
        type LogLevelKey = NonNullable<ErrorEvent['level']>
        const levelMap: Record<LogLevelKey, 'debug' | 'error' | 'info' | 'warn'> = {
          fatal: 'error',
          error: 'error',
          warning: 'warn',
          info: 'info',
          debug: 'debug'
        }
        const logLevel = levelMap[level ?? 'error']
        apiLogger[logLevel]({
          ...processedEvent
        }, `Captured message (${level})`)
      } else {
        this.sendError(processedEvent)
      }
    }
  }

  /**
   * Send error to external monitoring service (placeholder implementation)
   */
  private sendError(errorEvent: ErrorEvent): void {
    try {
      // If a DSN is provided, we could send to external service
      if (this.config.dsn) {
        // This is where you'd implement the specific monitoring service API call
        // For example, for Sentry: fetch(this.config.dsn, { ... })
        apiLogger.error({
          ...errorEvent,
          dsn_used: Boolean(this.config.dsn)
        }, 'External error monitoring DSN configured but not implemented')
      } else {
        // Log to our own error log for now
        apiLogger.error({
          ...errorEvent,
          dsn_used: Boolean(this.config.dsn)
        }, 'Error sent to monitoring service')
      }
    } catch (error) {
      apiLogger.error({ 
        error: error instanceof Error ? error.message : String(error),
        original_event: errorEvent.message
      }, 'Error sending to monitoring service')
    }
  }

  /**
   * Set user context for error reporting
   */
  setUser(_user: ErrorEvent['_user']): void {
    // Store _user _context for future error events
    // Implementation depends on specific monitoring service
  }

  /**
   * Set extra context for error reporting
   */
  setContext(_key: string, _context: Record<string, unknown>): void {
    // Store _context for future error events
    // Implementation depends on specific monitoring service
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (typeof window === 'undefined') {return}
    
    // Global error handler for uncaught errors
    this.globalErrorHandler = (event: globalThis.ErrorEvent): void => {
      const errorEvent = event as unknown as { error: Error; filename?: string; lineno?: number; colno?: number }
      if (errorEvent.error) {
        this.captureException(errorEvent.error, {
          level: 'error',
          extra: {
            filename: errorEvent.filename,
            lineno: errorEvent.lineno,
            colno: errorEvent.colno,
          }
        })
      }
    }
    window.addEventListener('error', this.globalErrorHandler)

    // Global promise rejection handler
    this.globalRejectionHandler = (event: globalThis.PromiseRejectionEvent): void => {
      const rejectionEvent = event as unknown as { reason: unknown }
      const error = rejectionEvent.reason instanceof Error 
        ? rejectionEvent.reason 
        : new Error(String(rejectionEvent.reason))
      
      this.captureException(error, {
        level: 'error',
        extra: {
          promise: true,
          reason: rejectionEvent.reason
        }
      })
    }
    window.addEventListener('unhandledrejection', this.globalRejectionHandler)
  }

  /**
   * Cleanup global error handlers
   * Call this when destroying the service instance
   */
  destroy(): void {
    if (typeof window === 'undefined') {return}
    
    if (this.globalErrorHandler) {
      window.removeEventListener('error', this.globalErrorHandler)
      this.globalErrorHandler = null
    }
    
    if (this.globalRejectionHandler) {
      window.removeEventListener('unhandledrejection', this.globalRejectionHandler)
      this.globalRejectionHandler = null
    }
    
    this.enabled = false
  }

  /**
   * Configure sample rate for error reporting
   */
  setSampleRate(rate: number): void {
    this.config.sampleRate = Math.max(0, Math.min(1, rate))
  }

  /**
   * Enable or disable error monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Get current status
   */
  getStatus(): { enabled: boolean; environment: string; release: string } {
    return {
      enabled: this.enabled,
      environment: this.config.environment ?? 'development',
      release: this.config.release ?? '1.0.0'
    }
  }
}

// Create global instance
export const monitoringService = new ErrorMonitoringService()

// Convenience functions
export const captureException = monitoringService.captureException.bind(monitoringService)
export const captureMessage = monitoringService.captureMessage.bind(monitoringService)

// Export the class for advanced usage
export { ErrorMonitoringService }

// Add error monitoring to global scope
if (typeof window !== 'undefined') {
  type WindowWithMonitoring = Window & { monitoringService?: typeof monitoringService }
  ;(window as WindowWithMonitoring).monitoringService = monitoringService
}

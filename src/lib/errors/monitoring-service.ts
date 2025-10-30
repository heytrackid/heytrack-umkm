/**
 * Error Monitoring Service
 * Integrates with external error monitoring services like Sentry, LogRocket, etc.
 */

import { apiLogger } from '../logger'

interface ErrorEvent {
  message: string
  stack?: string
  name?: string
  timestamp: string
  context?: Record<string, unknown>
  user?: {
    id?: string
    email?: string
    username?: string
  }
  tags?: Record<string, string>
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug'
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

  constructor(config?: MonitoringServiceConfig) {
    this.config = {
      enabled: true,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      sampleRate: 1.0,
      beforeSend: (event) => event,
      ...config
    }
    this.enabled = this.config.enabled || false
  }

  /**
   * Initialize error monitoring service
   */
  init(config?: MonitoringServiceConfig) {
    if (config) {
      this.config = { ...this.config, ...config }
      this.enabled = this.config.enabled || false
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
      user?: ErrorEvent['user']
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
    if (Math.random() > (this.config.sampleRate || 1.0)) {
      return
    }

    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      context: context.extra,
      user: context.user,
      tags: {
        ...context.tags,
        environment: this.config.environment,
        release: this.config.release
      },
      level: context.level || 'error',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' 
        ? window.navigator.userAgent 
        : undefined,
    }

    // Apply beforeSend hook if provided
    const processedEvent = this.config.beforeSend?.(errorEvent) || errorEvent
    
    if (processedEvent) {
      // Log to console in development or if no external service is configured
      if (process.env.NODE_ENV === 'development' || !this.config.dsn) {
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
    context: {
      user?: ErrorEvent['user']
      tags?: ErrorEvent['tags']
      extra?: Record<string, unknown>
    } = {}
  ): void {
    if (!this.enabled) {
      apiLogger.debug({ message }, 'Error monitoring disabled')
      return
    }

    const errorEvent: ErrorEvent = {
      message,
      timestamp: new Date().toISOString(),
      context: context.extra,
      user: context.user,
      tags: {
        ...context.tags,
        environment: this.config.environment,
        release: this.config.release
      },
      level,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' 
        ? window.navigator.userAgent 
        : undefined,
    }

    const processedEvent = this.config.beforeSend?.(errorEvent) || errorEvent
    
    if (processedEvent) {
      if (process.env.NODE_ENV === 'development' || !this.config.dsn) {
        apiLogger[level === 'error' || level === 'fatal' ? 'error' : level]({
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
  private async sendError(errorEvent: ErrorEvent): Promise<void> {
    try {
      // If a DSN is provided, we could send to external service
      if (this.config.dsn) {
        // This is where you'd implement the specific monitoring service API call
        // For example, for Sentry: fetch(this.config.dsn, { ... })
        // For now, we'll log to our API
        const response = await fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorEvent),
        })

        if (!response.ok) {
          throw new Error(`Failed to send error to monitoring service: ${response.statusText}`)
        }
      } else {
        // Log to our own error log for now
        apiLogger.error({
          ...errorEvent,
          dsn_used: !!this.config.dsn
        }, 'Error sent to monitoring service')
      }
    } catch (err) {
      apiLogger.error({ 
        error: err instanceof Error ? err.message : String(err),
        original_event: errorEvent.message
      }, 'Error sending to monitoring service')
    }
  }

  /**
   * Set user context for error reporting
   */
  setUser(user: ErrorEvent['user']): void {
    // Store user context for future error events
    // Implementation depends on specific monitoring service
  }

  /**
   * Set extra context for error reporting
   */
  setContext(key: string, context: Record<string, unknown>): void {
    // Store context for future error events
    // Implementation depends on specific monitoring service
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Global error handler for uncaught errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error, {
        level: 'error',
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      })
    })

    // Global promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason))
      
      this.captureException(error, {
        level: 'error',
        extra: {
          promise: true,
          reason: event.reason
        }
      })
    })
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
      environment: this.config.environment || 'development',
      release: this.config.release || '1.0.0'
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
  (window as any).monitoringService = monitoringService
}
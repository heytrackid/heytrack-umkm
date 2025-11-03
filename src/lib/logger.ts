import pino from 'pino'


/**
 * Pino Logger Configuration
 * 
 * High-performance logging with Pino
 * - Development: Pretty formatted logs
 * - Production: JSON structured logs
 */


const isDevelopment = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

// Configure Pino logger
const getLogLevel = () => {
  if (isTest) {return 'silent'}
  if (isDevelopment) {return 'debug'}
  return 'info'
}

const logger = pino({
  level: getLogLevel(),
  // Disable pino-pretty transport in development due to Turbopack compatibility issues
  // Use browser option instead for better compatibility
  browser: {
    asObject: isDevelopment,
  },
  // Add more detailed serialization for better debugging
  serializers: {
    error: (err: Error) => ({
        type: err.constructor.name,
        name: err.name,
        message: err.message,
        stack: err.stack,
        // Include additional error properties
        ...Object.getOwnPropertyNames(err).reduce((acc, key) => {
          if (!['name', 'message', 'stack'].includes(key)) {
            try {
              const errorRecord = err as unknown as Record<string, unknown>
              acc[key] = errorRecord[key]
            } catch {
              // If property can't be accessed, skip it
              acc[key] = '[Non-serializable]';
            }
          }
          return acc;
        }, {} as Record<string, unknown>)
      })
  },
})

/**
 * Create a child logger with context
 */
export const createLogger = (context: string) => logger.child({ context })

/**
 * Serialized error type for logging
 */
export interface SerializedError {
  name: string
  message: string
  stack?: string
  type: string
  cause?: SerializedError
  status?: number
  statusCode?: number
  [key: string]: unknown
}

/**
 * Helper to safely serialize errors for logging
 * Handles non-serializable properties like Error objects
 */
export const serializeError = (error: unknown): Record<string, unknown> | SerializedError => {
  if (error instanceof Error) {
    const serialized: Record<string, unknown> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    }

    // Include additional error properties if they exist
    if (error.cause) {
      serialized.cause = serializeError(error.cause)
    }
    
    // Add request-specific properties if they exist
    if ('status' in error) {
      serialized.status = (error as Record<string, unknown>).status
    }
    if ('statusCode' in error) {
      serialized.statusCode = (error as Record<string, unknown>).statusCode
    }
    if ('code' in error) {
      serialized.code = (error as Record<string, unknown>).code
    }
    if ('errno' in error) {
      serialized.errno = (error as Record<string, unknown>).errno
    }
    
    return serialized
  }
  
  if (typeof error === 'object' && error !== null) {
    return { error: String(error) }
  }
  
  return { error: String(error) }
}

/**
 * Enhanced error context with additional debugging information
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  userAgent?: string;
  ipAddress?: string;
  functionName?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  stackTrace?: string;
}

/**
 * Helper to log errors safely in API routes
 * Usage: logError(apiLogger, error, 'Failed to create order', { userId, orderId })
 */
export const logError = (
  logger: pino.Logger,
  error: unknown,
  message: string,
  context?: ErrorContext
) => {
  logger.error({
    ...(context ?? {}),
    error: serializeError(error),
  }, message)
}

/**
 * Enhanced debugging logger with performance tracking
 */
export interface DebugOptions {
  includeMemory?: boolean;
  includeTimestamp?: boolean;
  includeUserId?: boolean;
  performanceTracking?: boolean;
  logParams?: boolean;
  logResult?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Create a debug logger with additional context
 */
export const createDebugLogger = (context: string, userId?: string) => {
  const baseLogger = createLogger(context);
  
  return {
    ...baseLogger,
    debugWithContext: (message: string, additionalContext?: Record<string, unknown>, options?: DebugOptions) => {
      const logData: Record<string, unknown> = { ...additionalContext ?? {} };
      
      if (options?.includeTimestamp) {
        logData.timestamp = new Date().toISOString();
      }
      
      if (options?.includeUserId && userId) {
        logData.userId = userId;
      }
      
      const level = options?.logLevel ?? 'debug';
      baseLogger[level](logData, message);
    },
    
    performanceDebug: (fn: () => unknown, operationName: string, userIdParam?: string) => {
      // Use Date.now() for Edge Runtime compatibility
      const start = Date.now();
      
      try {
        const result = fn();
        const end = Date.now();
        const duration = end - start; // milliseconds
        
        baseLogger.info({
          operation: operationName,
          duration: `${duration.toFixed(2)}ms`,
          userId: userIdParam,
        }, `Performance: ${operationName} completed`);
        
        return result;
      } catch (error) {
        const end = Date.now();
        const duration = end - start;
        
        baseLogger.error({
          operation: operationName,
          duration: `${duration.toFixed(2)}ms`,
          userId: userIdParam,
          error: serializeError(error),
        }, `Performance: ${operationName} failed`);
        
        throw error;
      }
    }
  };
}

/**
 * Detailed logger for API requests with request/response information
 */
export const createApiDebugLogger = () => {
  const baseLogger = createLogger('API');
  
  return {
    ...baseLogger,
    request: (
      url: string,
      method: string,
      requestContext?: Record<string, unknown>,
      userId?: string
    ) => {
      baseLogger.info({
        url,
        method,
        userId,
        timestamp: new Date().toISOString(),
        ...requestContext
      }, 'API Request Started');
    },
    
    response: (
      url: string,
      method: string,
      status: number,
      duration: number,
      responseContext?: Record<string, unknown>,
      userId?: string
    ) => {
      baseLogger.info({
        url,
        method,
        status,
        duration: `${duration.toFixed(2)}ms`,
        userId,
        timestamp: new Date().toISOString(),
        ...responseContext
      }, 'API Request Completed');
    },
    
    error: (
      url: string,
      method: string,
      error: unknown,
      errorContext?: Record<string, unknown>,
      userId?: string
    ) => {
      baseLogger.error({
        url,
        method,
        userId,
        timestamp: new Date().toISOString(),
        error: serializeError(error),
        ...errorContext
      }, 'API Request Error');
    }
  };
};

// Context-specific loggers
export const apiLogger = createLogger('API')
export const dbLogger = createLogger('Database')
export const authLogger = createLogger('Auth')
export const automationLogger = createLogger('Automation')
export const uiLogger = createLogger('UI')
export const middlewareLogger = createLogger('Middleware')
export const productionLogger = createLogger('ProductionService')
export const inventoryLogger = createLogger('InventoryService')

// Enhanced debug loggers with additional capabilities
export const apiDebugLogger = createApiDebugLogger();
export const debugLogger = createDebugLogger('GlobalDebug');

// Default export
export default logger

// Re-export for convenience
export { logger }

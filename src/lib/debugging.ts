import {serializeError } from '@/lib/logger';

import type pino from 'pino';


/**
 * Comprehensive Debugging Utility
 * 
 * Provides detailed debugging capabilities with:
 * - Performance timing
 * - Function execution tracing
 * - Memory usage tracking
 * - Detailed error context
 * - Request/response logging
 */


interface DebugContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  functionName?: string;
  component?: string;
  action?: string;
  timestamp?: string;
  duration?: number;
  memory?: MemoryUsage;
  error?: Record<string, unknown>;
}

interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface DetailedDebugOptions {
  level?: 'debug' | 'error' | 'info' | 'warn';
  includeMemory?: boolean;
  includeStack?: boolean;
  includeTimestamp?: boolean;
  includeUserId?: boolean;
  performanceTracking?: boolean;
  logParams?: boolean;
  logResult?: boolean;
}

class DebugLogger {
  private readonly logger: pino.Logger;
  private context: DebugContext = {};

  constructor(context = 'Debug') {
     
    this.logger = require('./logger').createLogger(context); // Dynamic import to avoid circular dependencies
  }

  public setContext(context: DebugContext): void {
    this.context = { ...this.context, ...context };
  }

  public logDetailed(
    message: string, 
    options: DetailedDebugOptions = {},
    additionalData?: Record<string, unknown>
  ): void {
    const logData: DebugContext & { additionalData?: Record<string, unknown> } = {
      ...this['context'],
      ...additionalData,
    };

    if (options.includeTimestamp) {
      logData['timestamp'] = new Date().toISOString();
    }

    if (options.includeMemory && typeof process !== 'undefined' && process.memoryUsage) {
      logData.memory = process.memoryUsage() as MemoryUsage;
    }

    if (options.level === 'error' && additionalData?.['error']) {
      logData.error = serializeError(additionalData['error']);
    }

    switch (options.level ?? 'debug') {
      case 'error':
        this.logger.error(logData, message);
        break;
      case 'warn':
        this.logger.warn(logData, message);
        break;
      case 'info':
        this.logger.info(logData, message);
        break;
      case 'debug':
      default:
        this.logger.debug(logData, message);
        break;
    }
  }

  public time<T>(message: string, fn: () => T, options: DetailedDebugOptions = {}): T {
    const start = process.hrtime.bigint();
    const startMemory = options.includeMemory && typeof process !== 'undefined'
      ? process.memoryUsage()
      : undefined;
    
    try {
      const result = fn();
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      
      const logData = {
        ...this['context'],
        duration,
        ...(options.includeMemory && startMemory ? { 
          memoryBefore: startMemory,
          memoryAfter: process.memoryUsage(),
          memoryDiff: this.calculateMemoryDiff(startMemory, process.memoryUsage())
        } : {})
      };

      this.logger.info(logData, `${message} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      
      const logData = {
        ...this['context'],
        duration,
        error: serializeError(error),
        ...(options.includeMemory && startMemory ? { 
          memoryBefore: startMemory,
          memoryAfter: process.memoryUsage(),
          memoryDiff: this.calculateMemoryDiff(startMemory, process.memoryUsage())
        } : {})
      };

      this.logger.error(logData, `${message} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  }

  public async timeAsync<T>(message: string, fn: () => Promise<T>, options: DetailedDebugOptions = {}): Promise<T> {
    const start = process.hrtime.bigint();
    const startMemory = options.includeMemory && typeof process !== 'undefined' ? process.memoryUsage() : undefined;
    
    try {
      const result = await fn();
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      
      const logData = {
        ...this['context'],
        duration,
        ...(options.includeMemory && startMemory ? { 
          memoryBefore: startMemory,
          memoryAfter: process.memoryUsage(),
          memoryDiff: this.calculateMemoryDiff(startMemory, process.memoryUsage())
        } : {})
      };

      this.logger.info(logData, `${message} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1_000_000; // Convert to milliseconds
      
      const logData = {
        ...this['context'],
        duration,
        error: serializeError(error),
        ...(options.includeMemory && startMemory ? { 
          memoryBefore: startMemory,
          memoryAfter: process.memoryUsage(),
          memoryDiff: this.calculateMemoryDiff(startMemory, process.memoryUsage())
        } : {})
      };

      this.logger.error(logData, `${message} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  }

  public traceFunction<T extends (...args: unknown[]) => unknown>(
    fn: T,
    options: DetailedDebugOptions & { name?: string } = {}
  ): T {
    const name = options.name ?? fn.name ?? 'anonymous';
    
    return ((...args: unknown[]) => {
      if (options.logParams) {
        this.logDetailed(`${name} called with`, { 
          ...options, 
          level: 'debug' 
        }, { 
          params: args.map(arg => this.safeSerialize(arg)) 
        });
      }

      const start = process.hrtime.bigint();
      
      try {
        const result = fn.apply(this, args);
        
        // Handle async functions
        if (result instanceof Promise) {
          return result.then(resolvedResult => {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1_000_000;
            
            if (options.logResult) {
              this.logDetailed(`${name} completed`, { 
                ...options, 
                level: 'debug',
                includeMemory: false // Memory will be added separately
              }, { 
                result: this.safeSerialize(resolvedResult),
                duration
              });
            }
            
            return resolvedResult;
          }).catch(error => {
            const end = process.hrtime.bigint();
            const duration = Number(end - start) / 1_000_000;
            
            this.logDetailed(`${name} failed`, { 
              ...options, 
              level: 'error' 
            }, { 
              error: serializeError(error),
              duration
            });
            
            throw error;
          });
        }
        
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000;
        
        if (options.logResult) {
          this.logDetailed(`${name} completed`, { 
            ...options, 
            level: 'debug',
            includeMemory: false // Memory will be added separately
          }, { 
            result: this.safeSerialize(result),
            duration
          });
        }
        
        return result;
      } catch (error) {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1_000_000;
        
        this.logDetailed(`${name} failed`, { 
          ...options, 
          level: 'error' 
        }, { 
          error: serializeError(error),
          duration
        });
        
        throw error;
      }
    }) as unknown as T;
  }

  private calculateMemoryDiff(before: NodeJS.MemoryUsage, after: NodeJS.MemoryUsage): Record<string, number> {
    return {
      rss: after.rss - before.rss,
      heapTotal: after.heapTotal - before.heapTotal,
      heapUsed: after.heapUsed - before.heapUsed,
      external: after.external - before.external,
    };
  }

  private safeSerialize(obj: unknown): unknown {
    if (obj === null || obj === undefined) {return obj;}
    
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    if (obj instanceof Error) {
      return serializeError(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.safeSerialize(item));
    }
    
    if (typeof obj === 'object') {
      // Prevent circular references
      const seen = new WeakSet();
      const serialize = (obj: unknown): unknown => {
        if (obj === null || obj === undefined) {return obj;}
        
        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
          return obj;
        }
        
        if (obj instanceof Date) {
          return obj.toISOString();
        }
        
        if (obj instanceof Error) {
          return serializeError(obj);
        }
        
        if (Array.isArray(obj)) {
          return obj.map(item => serialize(item));
        }
        
        if (typeof obj === 'object') {
          if (seen.has(obj)) {
            return '[Circular Reference]';
          }
          seen.add(obj);
          
          const result: Record<string, unknown> = {};
          const record = obj as Record<string, unknown>;
          for (const key of Object.keys(record)) {
            result[key] = serialize(record[key]);
          }
          return result;
        }
        
        return String(obj);
      };
      
      return serialize(obj);
    }
    
    return String(obj);
  }
}

// Default instance for general use
export const debugLogger = new DebugLogger('GlobalDebug');

// Specific debug loggers for different contexts
export const performanceLogger = new DebugLogger('Performance');
export const apiDebugLogger = new DebugLogger('ApiDebug');
export const dbDebugLogger = new DebugLogger('DbDebug');
export const uiDebugLogger = new DebugLogger('UiDebug');

/**
 * Decorator for class methods to automatically add debugging
 */
export function DebugMethod(options: DetailedDebugOptions = {}) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const debugLog = new DebugLogger((target as { constructor: { name: string } }).constructor.name);
    
    descriptor.value = function (...args: unknown[]) {
      return debugLog.traceFunction(originalMethod.bind(this), {
        ...options,
        name: propertyKey
      }).apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Higher-order function to wrap API route handlers with detailed debugging
 */
export function withDetailedDebug<T extends (...args: unknown[]) => unknown>(
  handler: T,
  options: DetailedDebugOptions & { name?: string } = {}
): T {
  const debugLog = new DebugLogger('ApiRoute');
  const wrappedHandler = debugLog.traceFunction(handler, {
    ...options,
    name: options.name ?? 'ApiRouteHandler',
    performanceTracking: true,
    includeMemory: true
  });
  return wrappedHandler;
}

/**
 * Performance monitoring function
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  return performanceLogger.time(`Performance: ${name}`, fn, {
    includeMemory: true,
    level: 'info'
  });
}

export function measurePerformanceAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  return performanceLogger.timeAsync(`Performance: ${name}`, fn, {
    includeMemory: true,
    level: 'info'
  });
}

/**
 * Detailed error logger with context
 */
export function detailedErrorLog(
  error: unknown,
  context: DebugContext,
  message = 'Detailed error occurred'
): void {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const logData = {
    ...context,
    errorId,
    error: serializeError(error),
    timestamp: new Date().toISOString()
  };

  debugLogger.logDetailed(message, { level: 'error', includeTimestamp: true }, logData);
}


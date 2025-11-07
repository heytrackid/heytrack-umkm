import { apiLogger } from '@/lib/logger'
import { Cache } from '@/utils/performance/performance'
import { PerformanceMonitor } from '@/utils/performance/performance-monitoring'

import type { NextApiRequest, NextApiResponse } from 'next'

interface PerformanceApiRequest extends NextApiRequest {
  performanceStart?: number
}

// Performance monitoring middleware for API routes
export const performanceMiddleware = (
  req: PerformanceApiRequest,
  res: NextApiResponse,
  next?: () => void
) => {
  req.performanceStart = Date.now()
  
  // Continue with the request
  if (next) {
    next()
  }
  
  // Log response time after the response is sent
  res.on('finish', () => {
    const duration = Date.now() - (req.performanceStart ?? Date.now())
    const url = req.url ?? ''
    const method = req.method ?? 'GET'
    
    // Log slow requests
    if (duration > 500) {
      apiLogger.warn({ 
        duration, 
        method, 
        url 
      }, 'Slow API request detected')
    } else {
      apiLogger.debug({ 
        duration, 
        method, 
        url 
      }, 'API request completed')
    }
  })
}

// Performance monitoring for server actions
export const withPerformanceMonitoring = <T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance()
  return monitor.measure(operationName, operation)
}

// Cache wrapper for frequently accessed data
export const withCache = async <T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  const cache = Cache.getInstance()
  const cached = cache.get<T>(cacheKey)
  
  if (cached) {
    return cached
  }
  
   const data = await fetcher()
   cache.set(cacheKey, data, ttl)

   return data
}
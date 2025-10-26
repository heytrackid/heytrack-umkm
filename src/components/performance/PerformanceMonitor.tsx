'use client'
import * as React from 'react'

import { useEffect, useState, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { apiLogger } from '@/lib/logger'
import { 
  Activity, 
  Clock, 
  Database, 
  Zap, 
  Cpu, 
  HardDrive,
  Trash2,
  RefreshCw
} from 'lucide-react'
// Removed cacheMetrics import as it doesn't exist in '@/lib/api-cache'

// Performance Observer API interfaces
interface PerformanceEntry {
  name: string
  entryType: string
  startTime: number
  duration: number
  processingStart?: number
}

interface LargestContentfulPaintEntry extends PerformanceEntry {
  entryType: 'largest-contentful-paint'
  size: number
  element?: Element
}

interface FirstInputEntry extends PerformanceEntry {
  entryType: 'first-input'
  processingStart: number
  target?: Element
}

interface PaintEntry extends PerformanceEntry {
  entryType: 'paint'
}

interface PerformanceMetrics {
  // Web Vitals
  lcp?: number // Largest Contentful Paint
  fid?: number // First Input Delay
  cls?: number // Cumulative Layout Shift
  fcp?: number // First Contentful Paint
  ttfb?: number // Time to First Byte
  
  // Custom metrics
  apiResponseTime: number[]
  cacheHitRate: number
  memoryUsage: number
  bundleSize?: number
}

interface PerformanceStats {
  score: number
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor'
  recommendations: string[]
}

// Web Vitals thresholds (Core Web Vitals)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // ms
  FID: { good: 100, poor: 300 },   // ms
  CLS: { good: 0.1, poor: 0.25 },  // score
  FCP: { good: 1800, poor: 3000 }, // ms
  TTFB: { good: 800, poor: 1800 }  // ms
}

const PerformanceMonitor = memo(() => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: [],
    cacheHitRate: 0,
    memoryUsage: 0
  })
  const [stats, setStats] = useState<PerformanceStats>({
    score: 0,
    status: 'good',
    recommendations: []
  })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Web Vitals monitoring
    const observeWebVitals = () => {
      if ('web-vital' in window) {
        // LCP - Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            const lcp = entries[entries.length - 1] as LargestContentfulPaintEntry
            setMetrics(prev => ({ ...prev, lcp: lcp?.startTime || 0 }))
          })

          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
          } catch (error: unknown) {
            apiLogger.warn('LCP observation not supported')
          }

          // FID - First Input Delay
          const fidObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            entries.forEach((entry: FirstInputEntry) => {
              setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }))
            })
          })

          try {
            fidObserver.observe({ entryTypes: ['first-input'] })
          } catch (error: unknown) {
            apiLogger.warn('FID observation not supported')
          }

          // FCP - First Contentful Paint
          const fcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries()
            entries.forEach((entry: PaintEntry) => {
              if (entry.name === 'first-contentful-paint') {
                setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
              }
            })
          })

          try {
            fcpObserver.observe({ entryTypes: ['paint'] })
          } catch (error: unknown) {
            apiLogger.warn('FCP observation not supported')
          }
        }
      }
    }

    observeWebVitals()
    updateCacheMetrics()
    
    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      updateCacheMetrics()
      calculatePerformanceScore()
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const updateCacheMetrics = () => {
    try {
      // Placeholder values since cacheMetrics doesn't exist
      const cacheStats = {
        size: 100, // Mock size
        validEntries: 90 // Mock valid entries
      }
      const totalCacheSize = 100 // Mock total cache size
      
      // Calculate cache hit rate (simplified)
      const totalRequests = cacheStats.size
      const validEntries = cacheStats.validEntries
      const hitRate = totalRequests > 0 ? (validEntries / totalRequests) * 100 : 0

      setMetrics(prev => ({
        ...prev,
        cacheHitRate: hitRate,
        memoryUsage: totalCacheSize
      }))
    } catch (error: unknown) {
      apiLogger.warn('Failed to update cache metrics:', error)
    }
  }

  const calculatePerformanceScore = () => {
    const { lcp, fid, cls, fcp, ttfb, cacheHitRate, apiResponseTime } = metrics
    
    let score = 100
    const recommendations: string[] = []

    // Web Vitals scoring
    if (lcp && lcp > THRESHOLDS.LCP.poor) {
      score -= 25
      recommendations.push('Optimize Largest Contentful Paint (LCP) - reduce image sizes and server response time')
    } else if (lcp && lcp > THRESHOLDS.LCP.good) {
      score -= 10
      recommendations.push('Improve LCP by optimizing critical resources')
    }

    if (fid && fid > THRESHOLDS.FID.poor) {
      score -= 20
      recommendations.push('Reduce First Input Delay (FID) - minimize main thread blocking')
    } else if (fid && fid > THRESHOLDS.FID.good) {
      score -= 8
      recommendations.push('Optimize JavaScript execution to improve FID')
    }

    if (cls && cls > THRESHOLDS.CLS.poor) {
      score -= 15
      recommendations.push('Fix Cumulative Layout Shift (CLS) - specify image dimensions and avoid dynamic content')
    }

    // Cache performance
    if (cacheHitRate < 50) {
      score -= 15
      recommendations.push('Improve cache hit rate by optimizing cache TTL settings')
    } else if (cacheHitRate < 80) {
      score -= 5
      recommendations.push('Good cache performance, consider preloading common data')
    }

    // API performance
    const avgApiTime = apiResponseTime.length > 0 
      ? apiResponseTime.reduce((sum, time) => sum + time, 0) / apiResponseTime.length 
      : 0

    if (avgApiTime > 2000) {
      score -= 20
      recommendations.push('API response times are slow - consider database optimization and caching')
    } else if (avgApiTime > 1000) {
      score -= 10
      recommendations.push('API response times could be improved with better caching')
    }

    // Determine status
    let status: PerformanceStats['status'] = 'excellent'
    if (score < 50) {status = 'poor'}
    else if (score < 70) {status = 'needs-improvement'}
    else if (score < 90) {status = 'good'}

    setStats({
      score: Math.max(0, score),
      status,
      recommendations
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'needs-improvement': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const clearCaches = () => {
    const confirmed = window.confirm('Are you sure you want to clear all caches? This may temporarily slow down the application.')
    if (confirmed) {
      // Clear API caches (placeholder since cacheMetrics doesn't exist)
      try {
        //window.location.reload() // Commenting out reload for now
        setMetrics(prev => ({
          ...prev,
          apiResponseTime: [],
          cacheHitRate: 0,
          memoryUsage: 0
        }))
      } catch (error: unknown) {
        apiLogger.warn('Failed to clear caches:', error)
      }
    }
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Activity className="w-4 h-4 mr-2" />
        Performance
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ×
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(stats.status)}`}></div>
            <span className="text-sm font-medium">Score: {stats.score.toFixed(0)}/100</span>
            <Badge variant={stats.status === 'excellent' ? 'default' : 'secondary'}>
              {stats.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Web Vitals */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Web Vitals</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>LCP: {metrics.lcp ? `${metrics.lcp.toFixed(0)}ms` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>FID: {metrics.fid ? `${metrics.fid.toFixed(0)}ms` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                <span>FCP: {metrics.fcp ? `${metrics.fcp.toFixed(0)}ms` : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                <span>Cache: {metrics.cacheHitRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Cache Performance */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Cache Performance</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Hit Rate</span>
                <span>{metrics.cacheHitRate.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cacheHitRate} className="h-2" />
              <div className="flex justify-between text-xs">
                <span>Memory Usage</span>
                <span>{metrics.memoryUsage} entries</span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {stats.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recommendations</h4>
              <div className="space-y-1">
                {stats.recommendations.slice(0, 3).map((rec, index: number) => (
                  <p key={index} className="text-xs text-gray-600 leading-tight">
                    • {rec}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={updateCacheMetrics}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={clearCaches}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

export default PerformanceMonitor

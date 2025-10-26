'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Activity, HardDrive, Zap, RefreshCw, Download } from 'lucide-react'
import { usePerformanceMonitoring, useServiceWorker } from '@/hooks'
import { formatBytes } from '@/lib/utils'

export function PerformanceDashboard() {
  const {
    metrics,
    isSupported: perfSupported,
    performanceScore,
    performanceRating,
    exportMetrics
  } = usePerformanceMonitoring()

  const {
    isSupported: swSupported,
    isRegistered,
    isActive,
    cacheStats,
    updateCacheStats,
    clearAllCaches
  } = useServiceWorker()

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100'
      case 'poor': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return '🌟'
      case 'good': return '✅'
      case 'needs-improvement': return '⚠️'
      case 'poor': return '❌'
      default: return '❓'
    }
  }

  const handleExportMetrics = () => {
    const data = exportMetrics()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Monitor app performance, caching, and optimization metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportMetrics}>
            <Download className="h-4 w-4 mr-2" />
            Export Metrics
          </Button>
          <Button onClick={() => updateCacheStats()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Score
          </CardTitle>
          <CardDescription>
            Overall performance rating based on Core Web Vitals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getRatingIcon(performanceRating || 'unknown')}</span>
              <div>
                <div className="text-2xl font-bold">{performanceScore || 'N/A'}</div>
                <Badge className={getRatingColor(performanceRating || 'unknown')}>
                  {performanceRating?.replace('-', ' ').toUpperCase() || 'UNKNOWN'}
                </Badge>
              </div>
            </div>
            {performanceScore && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Score</div>
                <Progress value={performanceScore} className="w-24" />
              </div>
            )}
          </div>

          {!perfSupported && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Performance monitoring not supported in this browser
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle>Core Web Vitals</CardTitle>
            <CardDescription>
              Key performance metrics for user experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Largest Contentful Paint (LCP)</p>
                <p className="text-sm text-muted-foreground">Loading performance</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A'}</p>
                <Badge variant={metrics.lcp && metrics.lcp < 2500 ? 'default' : 'secondary'}>
                  {metrics.lcp && metrics.lcp < 2500 ? 'Good' :
                   metrics.lcp && metrics.lcp < 4000 ? 'Needs Work' :
                   metrics.lcp ? 'Poor' : 'Unknown'}
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">First Input Delay (FID)</p>
                <p className="text-sm text-muted-foreground">Interactivity</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{metrics.fid ? `${metrics.fid.toFixed(1)}ms` : 'N/A'}</p>
                <Badge variant={metrics.fid && metrics.fid < 100 ? 'default' : 'secondary'}>
                  {metrics.fid && metrics.fid < 100 ? 'Good' :
                   metrics.fid && metrics.fid < 300 ? 'Needs Work' :
                   metrics.fid ? 'Poor' : 'Unknown'}
                </Badge>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Cumulative Layout Shift (CLS)</p>
                <p className="text-sm text-muted-foreground">Visual stability</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</p>
                <Badge variant={metrics.cls && metrics.cls < 0.1 ? 'default' : 'secondary'}>
                  {metrics.cls && metrics.cls < 0.1 ? 'Good' :
                   metrics.cls && metrics.cls < 0.25 ? 'Needs Work' :
                   metrics.cls ? 'Poor' : 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Worker Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Service Worker & Caching
            </CardTitle>
            <CardDescription>
              Offline capabilities and cache management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Service Worker Status</p>
                <p className="text-sm text-muted-foreground">Offline support</p>
              </div>
              <div className="text-right">
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : swSupported ? 'Inactive' : 'Not Supported'}
                </Badge>
              </div>
            </div>

            {cacheStats && (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Cache Entries</p>
                    <p className="text-sm text-muted-foreground">Total cached resources</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{cacheStats.total}</p>
                    <p className="text-xs text-muted-foreground">
                      Static: {cacheStats.static} • Dynamic: {cacheStats.dynamic} • API: {cacheStats.api}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearAllCaches}>
                    Clear Cache
                  </Button>
                  <Button variant="outline" size="sm" onClick={updateCacheStats}>
                    Update Stats
                  </Button>
                </div>
              </>
            )}

            {!swSupported && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Service Worker not supported in this browser
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Additional Performance Metrics
          </CardTitle>
          <CardDescription>
            Detailed timing and resource information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{metrics.fcp ? `${(metrics.fcp / 1000).toFixed(1)}s` : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">First Contentful Paint</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Time to First Byte</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{metrics.domContentLoaded ? `${(metrics.domContentLoaded / 1000).toFixed(1)}s` : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">DOM Content Loaded</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold">{metrics.loadComplete ? `${(metrics.loadComplete / 1000).toFixed(1)}s` : 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Page Load Complete</p>
            </div>
          </div>

          {metrics.memoryUsage.used && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Memory Usage</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold">{formatBytes(metrics.memoryUsage.used || 0)}</p>
                  <p className="text-sm text-muted-foreground">Used Heap</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatBytes(metrics.memoryUsage.total || 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Heap</p>
                </div>
                <div>
                  <p className="text-lg font-bold">{formatBytes(metrics.memoryUsage.limit || 0)}</p>
                  <p className="text-sm text-muted-foreground">Heap Limit</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            Performance Optimization Tips
          </CardTitle>
          <CardDescription>
            Recommendations to improve your app's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Immediate Actions</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Enable service worker for offline caching</li>
                <li>• Implement lazy loading for heavy components</li>
                <li>• Optimize bundle size with code splitting</li>
                <li>• Use proper image optimization and formats</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Long-term Improvements</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Implement virtual scrolling for large lists</li>
                <li>• Add proper error boundaries</li>
                <li>• Use React.memo for expensive components</li>
                <li>• Optimize database queries and caching</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring'

/**
 * Performance Monitor Component
 * Real-time display of Core Web Vitals and performance metrics
 */

export const PerformanceMonitor = () => {
  const {
    metrics,
    isSupported,
    performanceScore,
    performanceRating,
    exportMetrics
  } = usePerformanceMonitoring()

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Show monitor only in development or when ?perf=true is in URL
    const shouldShow = 
      process.env.NODE_ENV === 'development' || 
      new URLSearchParams(window.location.search).get('perf') === 'true'
    
    setIsVisible(shouldShow)
  }, [])

  if (!isVisible || !isSupported) {
    return null
  }

  const formatMetric = (value: number | null, unit = 'ms') => {
    if (value === null) {return '—'}
    return `${value.toFixed(0)}${unit}`
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) {return 'gray'}
    if (score >= 90) {return 'green'}
    if (score >= 70) {return 'yellow'}
    if (score >= 50) {return 'orange'}
    return 'red'
  }

  const getRatingBadge = (rating: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      excellent: { label: 'Excellent', variant: 'default' },
      good: { label: 'Good', variant: 'secondary' },
      'needs-improvement': { label: 'Needs Improvement', variant: 'outline' },
      poor: { label: 'Poor', variant: 'destructive' },
      unknown: { label: 'Unknown', variant: 'outline' }
    }

    const { label, variant } = variants[rating] || variants.unknown
    return <Badge variant={variant}>{label}</Badge>
  }

  const handleExport = () => {
    const _data = exportMetrics()
    // console.log('Performance Metrics:', _data)
    
    // Could send to analytics service here
    // analytics.track('performance_metrics', _data)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </div>
            <div className="flex items-center gap-2">
              {getRatingBadge(performanceRating)}
              <button
                onClick={handleExport}
                className="text-xs px-2 py-1 rounded hover:bg-gray-100"
              >
                Export
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Score</span>
              <span className="text-sm font-bold" style={{ color: getScoreColor(performanceScore) }}>
                {performanceScore !== null ? Math.round(performanceScore) : '—'}/100
              </span>
            </div>
            <Progress 
              value={performanceScore ?? 0} 
              className="h-2"
            />
          </div>

          {/* Core Web Vitals */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Core Web Vitals
            </h4>

            {/* LCP */}
            <MetricRow
              label="LCP (Largest Contentful Paint)"
              value={formatMetric(metrics.lcp)}
              threshold={{ good: 2500, poor: 4000 }}
              currentValue={metrics.lcp}
              icon={Clock}
            />

            {/* FID */}
            <MetricRow
              label="FID (First Input Delay)"
              value={formatMetric(metrics.fid)}
              threshold={{ good: 100, poor: 300 }}
              currentValue={metrics.fid}
              icon={Zap}
            />

            {/* CLS */}
            <MetricRow
              label="CLS (Cumulative Layout Shift)"
              value={formatMetric(metrics.cls, '')}
              threshold={{ good: 0.1, poor: 0.25 }}
              currentValue={metrics.cls}
              icon={Activity}
            />
          </div>

          {/* Additional Metrics */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm font-semibold">Additional Metrics</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">FCP:</span>{' '}
                <span className="font-medium">{formatMetric(metrics.fcp)}</span>
              </div>
              <div>
                <span className="text-gray-600">TTFB:</span>{' '}
                <span className="font-medium">{formatMetric(metrics.ttfb)}</span>
              </div>
              <div>
                <span className="text-gray-600">DOM:</span>{' '}
                <span className="font-medium">{formatMetric(metrics.domContentLoaded)}</span>
              </div>
              <div>
                <span className="text-gray-600">Load:</span>{' '}
                <span className="font-medium">{formatMetric(metrics.loadComplete)}</span>
              </div>
            </div>
          </div>

          {/* Memory Usage (Chrome only) */}
          {metrics.memoryUsage.used !== null && (
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-semibold">Memory Usage</h4>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-medium">
                    {(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">
                    {metrics.memoryUsage.total ? (metrics.memoryUsage.total / 1024 / 1024).toFixed(1) : '—'} MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Performance Tips */}
          {performanceScore !== null && performanceScore < 70 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Performance can be improved. Check console for detailed metrics.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for metric rows
interface MetricRowProps {
  label: string
  value: string
  threshold: { good: number; poor: number }
  currentValue: number | null
  icon: React.ComponentType<{ className?: string }>
}

const MetricRow = ({ label, value, threshold, currentValue, icon: Icon }: MetricRowProps) => {
  const getStatus = () => {
    if (currentValue === null) {return 'unknown'}
    if (currentValue <= threshold.good) {return 'good'}
    if (currentValue <= threshold.poor) {return 'needs-improvement'}
    return 'poor'
  }

  const status = getStatus()
  const icons = {
    good: <CheckCircle className="h-3 w-3 text-gray-500" />,
    'needs-improvement': <TrendingUp className="h-3 w-3 text-yellow-500" />,
    poor: <AlertTriangle className="h-3 w-3 text-red-500" />,
    unknown: <Icon className="h-3 w-3 text-gray-400" />
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {icons[status]}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span className="font-medium text-xs">{value}</span>
    </div>
  )
}

export default PerformanceMonitor

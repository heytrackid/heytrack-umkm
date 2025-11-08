'use client'

import { 
  Activity, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { usePerformanceMonitoring } from '@/lib/performance'

/**
 * Performance Monitor Component
 * Real-time display of Core Web Vitals and performance metrics
 */

export const PerformanceMonitor = (): JSX.Element | null => {
  const {
    metrics,
    isSupported,
    performanceScore,
    performanceRating,
    exportMetrics
  } = usePerformanceMonitoring()

  const shouldShow =
    process['env'].NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('perf') === 'true')

   const isVisible = shouldShow

  if (!isVisible || !isSupported) {
    return null
  }

  const formatMetric = (value: number | null, unit = 'ms'): string => {
    if (value === null) {return '—'}
    return `${value.toFixed(0)}${unit}`
  }

  const getScoreColor = (score: number | null): string => {
    if (score === null) {return 'gray'}
    if (score >= 90) {return 'green'}
    if (score >= 70) {return 'yellow'}
    if (score >= 50) {return 'orange'}
    return 'red'
  }

  const getRatingBadge = (rating: string): JSX.Element => {
    const variants = {
      excellent: { label: 'Excellent', variant: 'default' as const },
      good: { label: 'Good', variant: 'secondary' as const },
      'needs-improvement': { label: 'Needs Improvement', variant: 'outline' as const },
      poor: { label: 'Poor', variant: 'destructive' as const },
      unknown: { label: 'Unknown', variant: 'outline' as const }
    }

    const ratingData = variants[rating as keyof typeof variants] || variants.unknown
    const { label, variant } = ratingData
    return <Badge variant={variant}>{label}</Badge>
  }

  const handleExport = (): void => {
    exportMetrics()
    // Could send to analytics service here
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
  icon: React.ComponentType<{ className?: string | undefined }>
}

const MetricRow = ({ label, value, threshold, currentValue, icon: Icon }: MetricRowProps): JSX.Element => {
  const getStatus = (): string => {
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
        {icons[status as keyof typeof icons]}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <span className="font-medium text-xs">{value}</span>
    </div>
  )
}

export default PerformanceMonitor

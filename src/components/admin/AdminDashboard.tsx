'use client'
/* eslint-disable no-nested-ternary */

import { format } from 'date-fns'
import {
    Activity,
    Database,
    Users,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Server,
    Zap,
    HardDrive,
    Cpu,
    BarChart3,
    RefreshCw,
    Download
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useSettings } from '@/contexts/settings-context'
import { useToast } from '@/hooks/use-toast'

interface AdminDashboardProps {
    userId: string
}

interface SystemMetrics {
    database: {
        total_tables: number
        total_rows: number
        database_size: string
        active_connections: number
    }
    performance: {
        avg_query_time: number
        slow_queries: number
        cache_hit_rate: number
        api_response_time: number
    }
    users: {
        total_users: number
        active_today: number
        new_this_week: number
    }
    business: {
        total_recipes: number
        total_orders: number
        total_revenue: number
        total_ingredients: number
    }
}

interface PerformanceLog {
    id: string
    endpoint: string
    method: string
    duration_ms: number
    status: number
    timestamp: string
    user_id: string | null
}

interface ErrorLog {
    id: string
    error_type: string
    error_message: string
    endpoint: string
    timestamp: string
    user_id: string | null
    stack_trace: string | null
}

const AdminDashboard = (_props: AdminDashboardProps) => {
    const [metrics, setMetrics] = useState<SystemMetrics | null>(null)
    const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([])
    const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const { toast } = useToast()
    const { formatCurrency } = useSettings()

    useEffect(() => {
        void loadMetrics()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loadMetrics = async () => {
        try {
            setLoading(true)

            // Load system metrics
            const metricsRes = await fetch('/api/admin/metrics')
            if (metricsRes.ok) {
                const data = await metricsRes.json() as SystemMetrics
                setMetrics(data)
            }

            // Load performance logs
            const perfRes = await fetch('/api/admin/performance-logs?limit=50')
            if (perfRes.ok) {
                const data = await perfRes.json() as PerformanceLog[]
                setPerformanceLogs(data)
            }

            // Load error logs
            const errorRes = await fetch('/api/admin/error-logs?limit=20')
            if (errorRes.ok) {
                const data = await errorRes.json() as ErrorLog[]
                setErrorLogs(data)
            }
        } catch (_error) {
            toast({
                title: 'Error',
                description: 'Failed to load admin metrics',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await loadMetrics()
        setRefreshing(false)
        toast({
            title: 'Success',
            description: 'Metrics refreshed'
        })
    }

    const handleExportLogs = async () => {
        try {
            const response = await fetch('/api/admin/export-logs')
            if (!response.ok) { throw new Error('Export failed') }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `logs-${format(new Date(), 'yyyy-MM-dd')}.json`
            document['body'].appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document['body'].removeChild(a)

            toast({
                title: 'Success',
                description: 'Logs exported successfully'
            })
        } catch (_error) {
            toast({
                title: 'Error',
                description: 'Failed to export logs',
                variant: 'destructive'
            })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Activity className="h-3 w-3" />
                        Live Monitoring
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                        Last updated: {format(new Date(), 'HH:mm:ss')}
                    </span>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportLogs}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Export Logs
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                Total Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.users.total_users}</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.users.active_today} active today
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Database className="h-4 w-4 text-muted-foreground" />
                                Database Size
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.database.database_size}</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.database.total_rows.toLocaleString()} total rows
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                Avg Response Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {metrics.performance.avg_query_time}ms
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.performance.cache_hit_rate}% cache hit rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-gray-500" />
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(metrics.business.total_revenue)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.business.total_orders} orders
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Detailed Tabs */}
            <SwipeableTabs defaultValue="performance" className="w-full">
                <SwipeableTabsList className="grid w-full grid-cols-4">
                    <SwipeableTabsTrigger value="performance">Performance</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="database">Database</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="errors">Errors</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="business">Business</SwipeableTabsTrigger>
                </SwipeableTabsList>

                {/* Performance Tab */}
                <SwipeableTabsContent value="performance" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Performance Metrics
                            </CardTitle>
                            <CardDescription>
                                API response times and system performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {metrics && (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Cache Hit Rate</span>
                                            <span className="font-medium">
                                                {metrics.performance.cache_hit_rate}%
                                            </span>
                                        </div>
                                        <Progress value={metrics.performance.cache_hit_rate} />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-3 bg-muted rounded-lg">
                                            <div className="text-xs text-muted-foreground">Avg Query Time</div>
                                            <div className="text-lg font-bold">
                                                {metrics.performance.avg_query_time}ms
                                            </div>
                                        </div>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <div className="text-xs text-muted-foreground">Slow Queries</div>
                                            <div className="text-lg font-bold">
                                                {metrics.performance.slow_queries}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <div className="text-xs text-muted-foreground">API Response</div>
                                            <div className="text-lg font-bold">
                                                {metrics.performance.api_response_time}ms
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Recent Performance Logs */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Recent API Calls</h4>
                                <div className="space-y-1 max-h-64 overflow-y-auto">
                                    {performanceLogs.map((log) => (
                                        <div
                                            key={log['id']}
                                            className="flex items-center justify-between p-2 text-xs border rounded"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={log['status'] >= 400 ? 'destructive' : 'outline'}
                                                    className="text-xs"
                                                >
                                                    {log.method}
                                                </Badge>
                                                <span className="font-mono">{log.endpoint}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={
                                                        log.duration_ms > 1000
                                                            ? 'text-red-500'
                                                            : log.duration_ms > 500
                                                                ? 'text-yellow-500'
                                                                : 'text-muted-foreground'
                                                    }
                                                >
                                                    {log.duration_ms}ms
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {format(new Date(log['timestamp']), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>

                {/* Database Tab */}
                <SwipeableTabsContent value="database" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-5 w-5" />
                                Database Statistics
                            </CardTitle>
                            <CardDescription>
                                Database health and connection metrics
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {metrics && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Database Size</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {metrics.database.database_size}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Server className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Active Connections</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {metrics.database.active_connections}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Total Tables</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {metrics.database.total_tables}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Cpu className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm font-medium">Total Rows</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {metrics.database.total_rows.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {metrics.database.active_connections > 80 && (
                                        <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                                High number of active connections detected. Consider optimizing queries.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>

                {/* Errors Tab */}
                <SwipeableTabsContent value="errors" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Error Logs
                            </CardTitle>
                            <CardDescription>
                                Recent errors and exceptions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {errorLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <CheckCircle className="h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        No errors in the last 24 hours
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {errorLogs.map((log) => (
                                        <div
                                            key={log['id']}
                                            className="p-3 border rounded-lg space-y-2"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="destructive">{log.error_type}</Badge>
                                                        <span className="text-xs font-mono">{log.endpoint}</span>
                                                    </div>
                                                    <p className="text-sm">{log.error_message}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(log['timestamp']), 'MMM dd, HH:mm')}
                                                </span>
                                            </div>
                                            {log.stack_trace && (
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer text-muted-foreground">
                                                        Stack trace
                                                    </summary>
                                                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                                        {log.stack_trace}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>

                {/* Business Tab */}
                <SwipeableTabsContent value="business" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Business Metrics
                            </CardTitle>
                            <CardDescription>
                                Key business statistics and insights
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {metrics && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">Total Recipes</div>
                                        <div className="text-3xl font-bold">
                                            {metrics.business.total_recipes}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
                                        <div className="text-3xl font-bold">
                                            {metrics.business.total_orders}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                                        <div className="text-3xl font-bold">
                                            {formatCurrency(metrics.business.total_revenue)}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg">
                                        <div className="text-sm text-muted-foreground mb-1">Total Ingredients</div>
                                        <div className="text-3xl font-bold">
                                            {metrics.business.total_ingredients}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg col-span-2">
                                        <div className="text-sm text-muted-foreground mb-1">Active Users Today</div>
                                        <div className="text-3xl font-bold">
                                            {metrics.users.active_today}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {metrics.users.new_this_week} new users this week
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>
            </SwipeableTabs>
        </div>
    )
}

export default AdminDashboard

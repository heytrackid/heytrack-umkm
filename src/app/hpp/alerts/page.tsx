'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle, Bell } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { dbLogger } from '@/lib/logger'
import { PageHeader } from '@/components/shared'
import { useRealtimeAlerts } from '@/hooks/useRealtimeAlerts'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

const alertsBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'Cost Alerts' }
]

export default function HppAlertsPage() {
  const { toast: showToast } = useToast()
  const { user } = useAuth()
  type AlertFilter = 'all' | 'unread' | 'read'

  const [filter, setFilter] = useState<AlertFilter>('unread')
  const [triggering, setTriggering] = useState(false)

  // Use real-time alerts hook
  const {
    alerts: realtimeAlerts,
    unreadCount,
    isConnected,
    error: realtimeError,
    markAsRead,
    markAllAsRead,
    getAlertsByType,
    getAlertsBySeverity,
    getRecentAlerts
  } = useRealtimeAlerts({
    userId: user?.id,
    enabled: !!user?.id,
    onNewAlert: (alert) => {
      // Show toast notification for new alerts
      toast(`New Alert: ${alert.title}`, {
        description: alert.message,
        action: {
          label: "View",
          onClick: () => {
            // Could navigate to specific alert or refresh view
          }
        }
      })
    }
  })

  // Load recent alerts on mount
  useEffect(() => {
    void getRecentAlerts()
  }, [getRecentAlerts])

  // Show error toast when there's a realtime error
  useEffect(() => {
    if (realtimeError) {
      dbLogger.error({ error: realtimeError }, 'Real-time alerts error:')
      showToast({
        title: 'Error',
        description: 'Failed to load real-time alerts',
        variant: 'destructive'
      })
    }
  }, [realtimeError, showToast])

  // Filter alerts based on current filter
  const filteredAlerts = realtimeAlerts.filter(alert => {
    if (filter === 'unread') {return !alert.is_read}
    if (filter === 'read') {return alert.is_read}
    return true
  })

  // Handle mark as read
  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAsRead(alertId)
      showToast({
        title: 'Success',
        description: 'Alert marked as read',
      })
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Failed to mark alert as read:')
      showToast({
        title: 'Error',
        description: 'Failed to mark alert as read',
        variant: 'destructive'
      })
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      showToast({
        title: 'Success',
        description: 'All alerts marked as read',
      })
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Failed to mark all alerts as read:')
      showToast({
        title: 'Error',
        description: 'Failed to mark all alerts as read',
        variant: 'destructive'
      })
    }
  }

  // Trigger alert detection
  const triggerAlertDetection = async () => {
    try {
      void setTriggering(true)
      const response = await fetch('/api/hpp/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threshold: 10 }) // 10% threshold
      })

      if (response.ok) {
        const result = await response.json()
        showToast({
          title: 'Success',
          description: `Alert detection completed: ${result.data?.alertsCreated || 0} alerts created`,
        })
      } else {
        throw new Error('Failed to trigger alert detection')
      }
    } catch (err: unknown) {
      dbLogger.error({ error: err }, 'Failed to trigger alert detection:')
      showToast({
        title: 'Error',
        description: 'Failed to trigger alert detection',
        variant: 'destructive'
      })
    } finally {
      void setTriggering(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType) {
      case 'COST_INCREASE':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'COST_DECREASE':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
  }

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)

  return (
    <AppLayout pageTitle="Cost Alerts">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="Cost Alerts"
          description="Notifikasi otomatis saat terjadi perubahan biaya signifikan"
          breadcrumbs={alertsBreadcrumbs}
          actions={
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                onClick={triggerAlertDetection}
                disabled={triggering}
                className="flex items-center gap-2"
              >
                <Bell className={`h-4 w-4 ${triggering ? 'animate-pulse' : ''}`} />
                {triggering ? 'Detecting...' : 'Run Detection'}
              </Button>
            </div>
          }
        />

        {/* Connection Status */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Real-time connection lost</span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Alerts may not update automatically. Refresh the page to reconnect.
            </p>
          </div>
        )}

        {/* Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Alert Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filter:</label>
              <Select
                value={filter}
                onValueChange={(value) => {
                  if (value === 'all' || value === 'unread' || value === 'read') {
                    setFilter(value)
                  }
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unread">Unread Alerts ({unreadCount})</SelectItem>
                  <SelectItem value="read">Read Alerts</SelectItem>
                  <SelectItem value="all">All Alerts ({realtimeAlerts.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">
                    {filter === 'unread' ? 'No Unread Alerts' : 'No Alerts Found'}
                  </h3>
                  <p>
                    {filter === 'unread'
                      ? 'All caught up! No unread alerts at this time.'
                      : 'No alerts found with the current filter.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`transition-all ${!alert.is_read ? 'border-l-4 border-l-red-500' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {getAlertTypeIcon(alert.alert_type)}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          {!alert.is_read && (
                            <Badge variant="destructive">Unread</Badge>
                          )}
                        </div>

                        <p className="text-muted-foreground">{alert.message}</p>

                        {alert.change_percentage && (
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-medium">Change:</span>
                            <span className={`font-semibold ${
                              alert.change_percentage >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {alert.change_percentage >= 0 ? '+' : ''}{alert.change_percentage.toFixed(1)}%
                            </span>
                            {alert.old_value && alert.new_value && (
                              <span className="text-muted-foreground">
                                ({formatCurrency(alert.old_value)} → {formatCurrency(alert.new_value)})
                              </span>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {!alert.is_read && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(alert.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {realtimeAlerts.length}
              </div>
              <p className="text-sm text-muted-foreground">All system alerts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Unread Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {unreadCount}
              </div>
              <p className="text-sm text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {getAlertsBySeverity('high').length + getAlertsBySeverity('critical').length}
              </div>
              <p className="text-sm text-muted-foreground">Critical issues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Cost Reductions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getAlertsByType('COST_DECREASE').length}
              </div>
              <p className="text-sm text-muted-foreground">Savings opportunities</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}

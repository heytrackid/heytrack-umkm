'use client'

import { AlertTriangle, Bell, CheckCircle, Info, X } from '@/components/icons'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useHppOverview, type HppOverviewData } from '@/modules/hpp/hooks/useHppOverview'

interface HppAlertsTabProps {
  className?: string
}

type HppAlert = HppOverviewData['recentAlerts'][number]

export const HppAlertsTab = ({ className }: HppAlertsTabProps): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const {
    data: overview,
    markAlertAsRead,
    markAllAlertsAsRead,
    isLoading
  } = useHppOverview()

  const getAlertIcon = (severity: string): JSX.Element => {
    switch (severity) {
      case 'high':
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getAlertVariant = (severity: string): 'destructive' | 'default' | 'secondary' | 'outline' => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'destructive' as const
      case 'medium':
        return 'default' as const
      case 'low':
        return 'secondary' as const
      default:
        return 'outline' as const
    }
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Peringatan HPP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Memuat peringatan...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const recentAlerts: HppAlert[] = overview?.recentAlerts ?? []
  const unreadCount = overview?.unreadAlerts ?? 0

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Peringatan HPP
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} belum dibaca
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAlertsAsRead.mutate()}
              disabled={markAllAlertsAsRead.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Semua Aman!</h3>
            <p className="text-muted-foreground">
              Tidak ada peringatan HPP yang perlu diperhatikan saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAlerts.map((alert: HppAlert) => (
              <Alert
                key={alert['id']}
                className={`relative ${!alert.is_read ? 'border-l-4 border-l-orange-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <Badge variant={getAlertVariant(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                        {!alert.is_read && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            Baru
                          </Badge>
                        )}
                      </div>
                      <AlertDescription className="text-sm mb-2">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert['recipe_name']}</span>
                        {alert.new_value && (
                          <span>Nilai: {formatCurrency(alert.new_value)}</span>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(alert.created_at), {
                            addSuffix: true,
                            locale: id
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!alert.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAlertAsRead.mutate(alert['id'])}
                      disabled={markAlertAsRead.isPending}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Alert>
            ))}
          </div>
        )}

        {recentAlerts.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Menampilkan {recentAlerts.length} peringatan terbaru
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

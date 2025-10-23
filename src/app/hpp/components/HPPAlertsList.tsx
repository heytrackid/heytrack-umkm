'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListSkeleton } from '@/components/ui'
import { toast } from '@/hooks/use-toast'
import { formatCurrentCurrency } from '@/lib/currency'
import { HPPAlert } from '@/types/hpp-tracking'
import {
    getSeverityColors,
    getSeverityLabel,
    getAlertTypeIcon as getUtilAlertTypeIcon,
    groupAlertsByDate as groupAlerts
} from '@/utils/hpp-alert-helpers'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, AlertTriangle, Check, Info, TrendingDown, TrendingUp, X } from 'lucide-react'
import * as React from 'react'
import { useState } from 'react'
import { HPPAlertDetail } from './HPPAlertDetail'

interface HPPAlertsListProps {
    recipeId?: string
    limit?: number
}

interface AlertsResponse {
    success: boolean
    data: (HPPAlert & { recipes?: { name: string } })[]
    meta: {
        total: number
        unread_count: number
        limit: number
        offset: number
    }
}

// Helper function to get severity config with badge variant
const getSeverityConfig = (severity: HPPAlert['severity']) => {
    const colors = getSeverityColors(severity)
    return {
        color: colors.badgeVariant,
        icon: severity === 'critical' ? AlertCircle : severity === 'high' ? AlertTriangle : Info,
        label: getSeverityLabel(severity)
    }
}

// Helper function to get alert type icon component
const getAlertTypeIconComponent = (alertType: HPPAlert['alert_type']) => {
    const iconConfig = getUtilAlertTypeIcon(alertType)
    switch (iconConfig.name) {
        case 'TrendingUp':
            return TrendingUp
        case 'TrendingDown':
            return TrendingDown
        case 'AlertTriangle':
            return AlertTriangle
        case 'ArrowUp':
            return TrendingUp
        default:
            return AlertCircle
    }
}

// Helper function to group alerts by date - using utility
const groupAlertsByDate = (alerts: (HPPAlert & { recipes?: { name: string } })[]) => {
    const grouped = groupAlerts(alerts)
    return {
        today: grouped['Hari Ini'] || [],
        yesterday: grouped['Kemarin'] || [],
        thisWeek: grouped['Minggu Ini'] || [],
        older: grouped['Lebih Lama'] || []
    }
}

export function HPPAlertsList({ recipeId, limit = 20 }: HPPAlertsListProps) {
    const [selectedAlert, setSelectedAlert] = useState<(HPPAlert & { recipes?: { name: string } }) | null>(null)
    const queryClient = useQueryClient()

    // Fetch alerts
    const { data, isLoading, error } = useQuery<AlertsResponse>({
        queryKey: ['hpp-alerts', recipeId, limit],
        queryFn: async () => {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: '0'
            })
            if (recipeId) {
                params.append('recipe_id', recipeId)
            }
            const response = await fetch(`/api/hpp/alerts?${params}`)
            if (!response.ok) {
                throw new Error('Failed to fetch alerts')
            }
            return response.json()
        },
        refetchInterval: 60000 // Refetch every minute
    })

    // Mark as read mutation
    const markAsReadMutation = useMutation({
        mutationFn: async (alertId: string) => {
            const response = await fetch(`/api/hpp/alerts/${alertId}/read`, {
                method: 'POST'
            })
            if (!response.ok) {
                throw new Error('Failed to mark alert as read')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Gagal menandai alert sebagai sudah dibaca',
                variant: 'destructive'
            })
        }
    })

    // Dismiss alert mutation
    const dismissAlertMutation = useMutation({
        mutationFn: async (alertId: string) => {
            const response = await fetch(`/api/hpp/alerts/${alertId}/dismiss`, {
                method: 'POST'
            })
            if (!response.ok) {
                throw new Error('Failed to dismiss alert')
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hpp-alerts'] })
            toast({
                title: 'Berhasil',
                description: 'Alert berhasil dihapus'
            })
        },
        onError: () => {
            toast({
                title: 'Error',
                description: 'Gagal menghapus alert',
                variant: 'destructive'
            })
        }
    })

    const handleAlertClick = (alert: HPPAlert & { recipes?: { name: string } }) => {
        setSelectedAlert(alert)
        if (!alert.is_read) {
            markAsReadMutation.mutate(alert.id)
        }
    }

    const handleDismiss = (alertId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        dismissAlertMutation.mutate(alertId)
    }

    const handleMarkAsRead = (alertId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        markAsReadMutation.mutate(alertId)
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alert HPP</CardTitle>
                </CardHeader>
                <CardContent>
                    <ListSkeleton items={3} />
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alert HPP</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Gagal memuat alert</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const alerts = data?.data || []
    const unreadCount = data?.meta.unread_count || 0
    const groupedAlerts = groupAlertsByDate(alerts)

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Alert HPP</span>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                                {unreadCount} Belum Dibaca
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {alerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada alert</p>
                            <p className="text-sm">Semua HPP produk dalam kondisi normal</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedAlerts.today.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Hari Ini</h4>
                                    <div className="space-y-2">
                                        {groupedAlerts.today.map(alert => (
                                            <AlertItem
                                                key={alert.id}
                                                alert={alert}
                                                onClick={() => handleAlertClick(alert)}
                                                onDismiss={(e) => handleDismiss(alert.id, e)}
                                                onMarkAsRead={(e) => handleMarkAsRead(alert.id, e)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedAlerts.yesterday.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Kemarin</h4>
                                    <div className="space-y-2">
                                        {groupedAlerts.yesterday.map(alert => (
                                            <AlertItem
                                                key={alert.id}
                                                alert={alert}
                                                onClick={() => handleAlertClick(alert)}
                                                onDismiss={(e) => handleDismiss(alert.id, e)}
                                                onMarkAsRead={(e) => handleMarkAsRead(alert.id, e)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedAlerts.thisWeek.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Minggu Ini</h4>
                                    <div className="space-y-2">
                                        {groupedAlerts.thisWeek.map(alert => (
                                            <AlertItem
                                                key={alert.id}
                                                alert={alert}
                                                onClick={() => handleAlertClick(alert)}
                                                onDismiss={(e) => handleDismiss(alert.id, e)}
                                                onMarkAsRead={(e) => handleMarkAsRead(alert.id, e)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {groupedAlerts.older.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Lebih Lama</h4>
                                    <div className="space-y-2">
                                        {groupedAlerts.older.map(alert => (
                                            <AlertItem
                                                key={alert.id}
                                                alert={alert}
                                                onClick={() => handleAlertClick(alert)}
                                                onDismiss={(e) => handleDismiss(alert.id, e)}
                                                onMarkAsRead={(e) => handleMarkAsRead(alert.id, e)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedAlert && (
                <HPPAlertDetail
                    alert={selectedAlert}
                    open={!!selectedAlert}
                    onOpenChange={(open) => !open && setSelectedAlert(null)}
                    onDismiss={() => {
                        dismissAlertMutation.mutate(selectedAlert.id)
                        setSelectedAlert(null)
                    }}
                />
            )}
        </>
    )
}

// Alert Item Component
interface AlertItemProps {
    alert: HPPAlert & { recipes?: { name: string } }
    onClick: () => void
    onDismiss: (e: React.MouseEvent) => void
    onMarkAsRead: (e: React.MouseEvent) => void
}

function AlertItem({ alert, onClick, onDismiss, onMarkAsRead }: AlertItemProps) {
    const severityConfig = getSeverityConfig(alert.severity)
    const TypeIcon = getAlertTypeIconComponent(alert.alert_type)
    const SeverityIcon = severityConfig.icon

    return (
        <div
            className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${!alert.is_read ? 'bg-accent/20 border-primary/30' : ''
                }`}
            onClick={onClick}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">
                        <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            {!alert.is_read && (
                                <Badge variant="default" className="text-xs">Baru</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                            {alert.message}
                        </p>
                        {alert.recipes?.name && (
                            <p className="text-xs text-muted-foreground">
                                Produk: {alert.recipes.name}
                            </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                                {formatCurrentCurrency(alert.old_value)} → {formatCurrentCurrency(alert.new_value)}
                            </span>
                            <span className={alert.change_percentage > 0 ? 'text-destructive' : 'text-green-600'}>
                                ({alert.change_percentage > 0 ? '+' : ''}{alert.change_percentage.toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Badge variant={severityConfig.color} className="shrink-0">
                        <SeverityIcon className="h-3 w-3 mr-1" />
                        {severityConfig.label}
                    </Badge>
                    <div className="flex gap-1">
                        {!alert.is_read && (
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={onMarkAsRead}
                                title="Tandai sudah dibaca"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={onDismiss}
                            title="Hapus alert"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrentCurrency } from '@/lib/currency'
import { HPPAlert } from '@/types/hpp-tracking'
import { formatChangePercentage, getSeverityColors } from '@/utils/hpp-alert-helpers'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowRight, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AlertsResponse {
    success: boolean
    data: (HPPAlert & { recipes?: { name: string } })[]
    meta: {
        total: number
        unread_count: number
    }
}

// Helper function to get severity color - using utility
const getSeverityColor = (severity: HPPAlert['severity']) => {
    return getSeverityColors(severity).badgeVariant
}

export default function HPPAlertsWidget() {
    const router = useRouter()

    const { data, isLoading, error } = useQuery<AlertsResponse>({
        queryKey: ['hpp-alerts-dashboard'],
        queryFn: async () => {
            const response = await fetch('/api/hpp/alerts?limit=3&unread_only=true')
            if (!response.ok) {
                throw new Error('Failed to fetch alerts')
            }
            return response.json()
        },
        refetchInterval: 60000 // Refetch every minute
    })

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Alert HPP
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="p-3 border rounded-lg space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return null // Don't show widget if there's an error
    }

    const alerts = data?.data || []
    const unreadCount = data?.meta.unread_count || 0

    if (alerts.length === 0) {
        return null // Don't show widget if no alerts
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Alert HPP
                    </div>
                    {unreadCount > 0 && (
                        <Badge variant="destructive">
                            {unreadCount} Baru
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => router.push('/hpp-enhanced')}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp className="h-4 w-4 text-destructive shrink-0" />
                                    <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {alert.message}
                                </p>
                                {alert.recipes?.name && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {alert.recipes.name}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 mt-2 text-xs">
                                    <span className="text-muted-foreground">
                                        {formatCurrentCurrency(alert.old_value)} → {formatCurrentCurrency(alert.new_value)}
                                    </span>
                                    <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                                        {formatChangePercentage(alert.change_percentage)}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {unreadCount > 3 && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push('/hpp-enhanced')}
                    >
                        Lihat Semua Alert ({unreadCount})
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

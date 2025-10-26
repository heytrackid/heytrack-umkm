'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAlertsData } from './useAlertsData'
import { useSelectedAlert } from './useSelectedAlert'
import { groupAlertsByDate } from './alertUtils'
import { LoadingState, ErrorState, EmptyState } from './AlertStates'
import { AlertGroups } from './AlertGroups'
import { HPPAlertDetail } from '../HPPAlertDetail'

interface HPPAlertsListProps {
    recipeId?: string
    limit?: number
    isMobile?: boolean
}

export function HPPAlertsList({ recipeId, limit = 20, isMobile }: HPPAlertsListProps) {
    const { alerts, unreadCount, isLoading, error, markAsReadMutation, dismissAlertMutation } = useAlertsData({
        recipeId,
        limit
    })
    const { selectedAlert, setSelectedAlert } = useSelectedAlert()

    const handleAlertClick = (alert: typeof selectedAlert) => {
        setSelectedAlert(alert)
        if (alert && !alert.is_read) {
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
        return <LoadingState />
    }

    if (error) {
        return <ErrorState />
    }

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
                        <EmptyState />
                    ) : (
                        <AlertGroups
                            alertGroups={groupedAlerts}
                            onAlertClick={handleAlertClick}
                            onDismiss={handleDismiss}
                            onMarkAsRead={handleMarkAsRead}
                        />
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

export default HPPAlertsList

'use client'

import { AlertItem } from './AlertItem'
import type { HPPAlert } from '@/types/hpp-tracking'

type AlertWithRecipe = HPPAlert & { recipes?: { name: string } }

interface AlertGroupsProps {
    alertGroups: {
        today: AlertWithRecipe[]
        yesterday: AlertWithRecipe[]
        thisWeek: AlertWithRecipe[]
        older: AlertWithRecipe[]
    }
    onAlertClick: (alert: AlertWithRecipe) => void
    onDismiss: (alertId: string, e: React.MouseEvent) => void
    onMarkAsRead: (alertId: string, e: React.MouseEvent) => void
}

export function AlertGroups({ alertGroups, onAlertClick, onDismiss, onMarkAsRead }: AlertGroupsProps) {
    const renderGroup = (title: string, alerts: AlertWithRecipe[]) => {
        if (alerts.length === 0) return null

        return (
            <div key={title}>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
                <div className="space-y-2">
                    {alerts.map(alert => (
                        <AlertItem
                            key={alert.id}
                            alert={alert}
                            onClick={() => onAlertClick(alert)}
                            onDismiss={(e) => onDismiss(alert.id, e)}
                            onMarkAsRead={(e) => onMarkAsRead(alert.id, e)}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {renderGroup('Hari Ini', alertGroups.today)}
            {renderGroup('Kemarin', alertGroups.yesterday)}
            {renderGroup('Minggu Ini', alertGroups.thisWeek)}
            {renderGroup('Lebih Lama', alertGroups.older)}
        </div>
    )
}

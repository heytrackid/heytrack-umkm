'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrentCurrency } from '@/lib/currency'
import { getSeverityConfig, getAlertTypeIconComponent } from './alertUtils'
import type { HPPAlert } from '@/types/hpp-tracking'
import { AlertCircle, AlertTriangle, Check, Info, TrendingDown, TrendingUp, X } from 'lucide-react'

interface AlertItemProps {
    alert: HPPAlert & { recipes?: { name: string } }
    onClick: () => void
    onDismiss: (e: React.MouseEvent) => void
    onMarkAsRead: (e: React.MouseEvent) => void
}

export function AlertItem({ alert, onClick, onDismiss, onMarkAsRead }: AlertItemProps) {
    const severityConfig = getSeverityConfig(alert.severity)
    const TypeIcon = getTypeIconComponent(alert.alert_type)
    const SeverityIcon = getSeverityIconComponent(severityConfig.icon)

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

// Helper functions to get icon components
function getTypeIconComponent(iconName: string) {
    switch (iconName) {
        case 'TrendingUp':
            return TrendingUp
        case 'TrendingDown':
            return TrendingDown
        case 'AlertTriangle':
            return AlertTriangle
        default:
            return AlertCircle
    }
}

function getSeverityIconComponent(iconName: string) {
    switch (iconName) {
        case 'AlertCircle':
            return AlertCircle
        case 'AlertTriangle':
            return AlertTriangle
        case 'Info':
            return Info
        default:
            return AlertCircle
    }
}

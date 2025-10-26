import type { HPPAlert } from '@/types/hpp-tracking'
import { HPPUtils } from '@/lib/hpp'

// Helper function to get severity config with badge variant
export const getSeverityConfig = (severity: HPPAlert['severity']) => {
    const colors = HPPUtils.getSeverityColors(severity)
    const icon = severity === 'critical' ? 'AlertCircle' : severity === 'high' ? 'AlertTriangle' : 'Info'

    return {
        color: colors.badgeVariant,
        icon,
        label: HPPUtils.getSeverityLabel(severity),
        bgColor: severity === 'critical' || severity === 'high' ? 'bg-destructive/10' :
            severity === 'medium' ? 'bg-primary/10' : 'bg-secondary/10'
    }
}

// Helper function to get alert type icon component
export const getAlertTypeIconComponent = (alertType: HPPAlert['alert_type']) => {
    const iconConfig = getAlertTypeIcon(alertType)
    return iconConfig.name
}

// Helper function to get alert type icon
const getAlertTypeIcon = (alertType: HPPAlert['alert_type']) => {
    const iconMap = {
        hpp_increase: { name: 'TrendingUp' },
        hpp_decrease: { name: 'TrendingDown' },
        margin_low: { name: 'AlertTriangle' },
        cost_spike: { name: 'AlertCircle' }
    }
    return iconMap[alertType] || { name: 'AlertCircle' }
}

// Helper function to group alerts by date
export const groupAlertsByDate = (alerts: (HPPAlert & { recipes?: { name: string } })[]) => {
    const grouped: Record<string, (HPPAlert & { recipes?: { name: string } })[]> = {}

    alerts.forEach(alert => {
        const dateKey = new Date(alert.created_at).toDateString()
        if (!grouped[dateKey]) {
            grouped[dateKey] = []
        }
        grouped[dateKey].push(alert)
    })

    return {
        today: grouped[new Date().toDateString()] || [],
        yesterday: grouped[new Date(Date.now() - 86400000).toDateString()] || [],
        thisWeek: grouped[new Date(Date.now() - 604800000).toDateString()] || [],
        older: [] // Simplified for now
    }
}

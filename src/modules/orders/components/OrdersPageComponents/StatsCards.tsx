'use client'

import { BarChart3, Clock, DollarSign, ShoppingCart } from '@/components/icons'

import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import { useCurrency } from '@/hooks/useCurrency'

/**
 * Stats Cards Component
 * Displays order statistics overview
 */

interface OrderStats {
    total_orders: number
    total_revenue: number
    average_order_value: number
    pending_revenue: number
    order_growth: number
    revenue_growth: number
}

interface StatsCardsProps {
    stats: OrderStats
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
    const { formatCurrency } = useCurrency()

    const revenueTrend = stats.revenue_growth
    const orderTrend = stats.order_growth

    const statsCards: StatCardData[] = [
        {
            title: 'Total Pesanan',
            value: stats.total_orders,
            description: 'dari periode lalu',
            trend: { value: orderTrend, isPositive: orderTrend >= 0 },
            icon: ShoppingCart,
            iconWrapperClassName: 'shrink-0 p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20',
            iconClassName: 'text-blue-600 dark:text-blue-400',
        },
        {
            title: 'Total Pendapatan',
            value: formatCurrency(stats.total_revenue),
            description: 'dari periode lalu',
            trend: { value: revenueTrend, isPositive: revenueTrend >= 0 },
            icon: DollarSign,
            iconWrapperClassName: 'shrink-0 p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20',
            iconClassName: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            title: 'Rata-rata Nilai',
            value: formatCurrency(stats.average_order_value),
            description: 'per pesanan',
            icon: BarChart3,
            iconWrapperClassName: 'shrink-0 p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-100/50 dark:border-violet-900/20',
            iconClassName: 'text-violet-600 dark:text-violet-400',
        },
        {
            title: 'Pendapatan Tertunda',
            value: formatCurrency(stats.pending_revenue),
            description: 'belum dibayar',
            icon: Clock,
            iconWrapperClassName: 'shrink-0 p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20',
            iconClassName: 'text-amber-600 dark:text-amber-400',
        },
    ]

    return (
        <UiStatsCards stats={statsCards} gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
    )
}

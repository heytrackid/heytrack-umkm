'use client'

import { AlertTriangle, Calendar, Package, TrendingDown } from '@/components/icons'
import { SummaryMetricsCard, type SummaryMetricItem } from '@/components/ui/summary-metrics-card'
import { useSettings } from '@/contexts/settings-context'
import { cn } from '@/lib/utils'
import type { Row } from '@/types/database'
import { memo, useMemo } from 'react'

type Ingredient = Row<'ingredients'>

interface InventorySummaryCardProps {
    ingredients: Ingredient[]
    className?: string
}

interface SummaryStats {
    totalItems: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
    expiringCount: number
    expiredCount: number
}

/**
 * Inventory Summary Card
 * Shows key metrics at a glance: total value, low stock alerts, expiring items
 */
export const InventorySummaryCard = memo(({ ingredients, className }: InventorySummaryCardProps) => {
    const { formatCurrency } = useSettings()

    const stats: SummaryStats = useMemo(() => {
        const today = new Date()
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

        return ingredients.reduce((acc, item) => {
            const currentStock = item.current_stock ?? 0
            const minStock = item.min_stock ?? 0
            const unitPrice = item.price_per_unit ?? item.weighted_average_cost ?? 0

            // Total value
            acc.totalValue += currentStock * unitPrice

            // Stock status
            if (currentStock <= 0) {
                acc.outOfStockCount++
            } else if (currentStock <= minStock) {
                acc.lowStockCount++
            }

            // Expiry check
            if (item.expiry_date) {
                const expiryDate = new Date(item.expiry_date)
                if (expiryDate <= today) {
                    acc.expiredCount++
                } else if (expiryDate <= sevenDaysFromNow) {
                    acc.expiringCount++
                }
            }

            return acc
        }, {
            totalItems: ingredients.length,
            totalValue: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            expiringCount: 0,
            expiredCount: 0
        } as SummaryStats)
    }, [ingredients])

    const hasAlerts = stats.lowStockCount > 0 || stats.outOfStockCount > 0 || stats.expiringCount > 0 || stats.expiredCount > 0

    const items: SummaryMetricItem[] = useMemo(() => {
        const stockContent = (
            <div className="flex items-center gap-3">
                {stats.outOfStockCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {stats.outOfStockCount} habis
                    </span>
                )}
                {stats.lowStockCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-600">
                        <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        {stats.lowStockCount} rendah
                    </span>
                )}
                {!hasAlerts && (
                    <span className="text-sm text-muted-foreground">Semua aman</span>
                )}
            </div>
        )

        const expiryContent = (
            <div className="flex items-center gap-3">
                {stats.expiredCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        {stats.expiredCount} expired
                    </span>
                )}
                {stats.expiringCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        {stats.expiringCount} segera
                    </span>
                )}
                {stats.expiredCount === 0 && stats.expiringCount === 0 && (
                    <span className="text-sm text-muted-foreground">Tidak ada</span>
                )}
            </div>
        )

        return [
            {
                key: 'total-items',
                label: 'Total Item',
                icon: Package,
                value: stats.totalItems,
            },
            {
                key: 'total-value',
                label: 'Nilai Inventori',
                icon: TrendingDown,
                value: formatCurrency(stats.totalValue),
                valueClassName: 'text-primary',
            },
            {
                key: 'stock-alert',
                label: 'Stok Alert',
                icon: AlertTriangle,
                content: stockContent,
            },
            {
                key: 'expiry',
                label: 'Kadaluarsa',
                icon: Calendar,
                content: expiryContent,
            },
        ]
    }, [formatCurrency, hasAlerts, stats.expiredCount, stats.expiringCount, stats.lowStockCount, stats.outOfStockCount, stats.totalItems, stats.totalValue])

    return (
        <SummaryMetricsCard
            items={items}
            cardClassName={cn('bg-gradient-to-br from-background to-muted/30', className)}
        />
    )
})

InventorySummaryCard.displayName = 'InventorySummaryCard'

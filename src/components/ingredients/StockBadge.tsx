'use client'

import { AlertTriangle, CheckCircle, XCircle } from '@/components/icons'
import { memo } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'




interface StockBadgeProps {
    currentStock: number
    minStock: number
    unit: string
    showIcon?: boolean
    compact?: boolean
    className?: string
}

type StockStatus = 'low' | 'normal' | 'out'

/**
  * Stock Badge Component
  *
  * Visual indicator for stock status with color coding:
  * - Red: Out of stock (0)
  * - Yellow: Low stock (<= min)
  * - Green: Normal stock (> min)
  */
export const StockBadge = memo(({
    currentStock,
    minStock,
    unit,
    showIcon = true,
    compact = false,
    className
}: StockBadgeProps) => {
    const getStockStatus = (): StockStatus => {
        if (currentStock <= 0) {return 'out'}
        if (currentStock <= minStock) {return 'low'}
        return 'normal'
    }

    const status = getStockStatus()

    const statusConfig = {
        out: {
            label: 'Habis',
            color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800',
            icon: XCircle,
            iconColor: 'text-rose-600 dark:text-rose-400'
        },
        low: {
            label: 'Menipis',
            color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
            icon: AlertTriangle,
            iconColor: 'text-amber-600 dark:text-amber-400'
        },
        normal: {
            label: 'Aman',
            color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
            icon: CheckCircle,
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    if (compact) {
        return (
            <Badge
                variant="outline"
                className={cn(config.color, 'font-medium', className)}
            >
                {showIcon && <Icon className={cn('w-3 h-3 mr-1', config.iconColor)} />}
                {currentStock} {unit}
            </Badge>
        )
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <Badge
                variant="outline"
                className={cn(config.color, 'font-medium')}
            >
                {showIcon && <Icon className={cn('w-3 h-3 mr-1', config.iconColor)} />}
                {config.label}
            </Badge>
             <span className="text-sm text-muted-foreground">
                 {currentStock} / {minStock} {unit}
             </span>
         </div>
     )
 })

StockBadge.displayName = 'StockBadge'

/**
 * Compact Stock Indicator for Mobile
 */
export const CompactStockIndicator = memo(({
    currentStock,
    minStock,
    unit
}: Omit<StockBadgeProps, 'className' | 'compact' | 'showIcon'>) => {
    const getStatus = () => {
        if (currentStock <= 0) {return 'out'}
        if (currentStock <= minStock) {return 'low'}
        return 'normal'
    }
    const status = getStatus()

    const colors = {
        out: 'bg-red-500',
        low: 'bg-yellow-500',
        normal: 'bg-muted0'
    }

    return (
        <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', colors[status])} />
            <span className="text-sm font-medium">
                {currentStock} {unit}
            </span>
        </div>
    )
})

CompactStockIndicator.displayName = 'CompactStockIndicator'


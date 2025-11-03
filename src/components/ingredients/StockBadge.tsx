'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'



interface StockBadgeProps {
    currentStock: number
    minStock: number
    unit: string
    showIcon?: boolean
    compact?: boolean
    className?: string
}

type StockStatus = 'out' | 'low' | 'normal'

/**
 * Stock Badge Component
 * 
 * Visual indicator for stock status with color coding:
 * - Red: Out of stock (0)
 * - Yellow: Low stock (<= min)
 * - Green: Normal stock (> min)
 */
export const StockBadge = ({
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
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: XCircle,
            iconColor: 'text-red-600'
        },
        low: {
            label: 'Stok Rendah',
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            icon: AlertTriangle,
            iconColor: 'text-yellow-600'
        },
        normal: {
            label: 'Normal',
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: CheckCircle,
            iconColor: 'text-green-600'
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
            <span className="text-sm text-gray-600">
                {currentStock} / {minStock} {unit}
            </span>
        </div>
    )
}

/**
 * Compact Stock Indicator for Mobile
 */
export const CompactStockIndicator = ({
    currentStock,
    minStock,
    unit
}: Omit<StockBadgeProps, 'showIcon' | 'compact' | 'className'>) => {
    const status = currentStock <= 0 ? 'out' : currentStock <= minStock ? 'low' : 'normal'

    const colors = {
        out: 'bg-red-500',
        low: 'bg-yellow-500',
        normal: 'bg-green-500'
    }

    return (
        <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', colors[status])} />
            <span className="text-sm font-medium">
                {currentStock} {unit}
            </span>
        </div>
    )
}

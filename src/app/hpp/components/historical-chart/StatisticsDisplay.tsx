'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'
import type { ChartStatistics } from './chartUtils'

interface StatisticsDisplayProps {
    stats: ChartStatistics
}

export function StatisticsDisplay({ stats }: StatisticsDisplayProps) {
    const { isMobile } = useResponsive()
    const { formatCurrency } = useCurrency()

    return (
        <div className={cn(
            "grid gap-3 grid-cols-3",
            isMobile && "gap-2"
        )}>
            <div className={cn(
                "space-y-1 text-center bg-muted/50 rounded-lg",
                isMobile ? "p-2" : "p-3"
            )}>
                <p className="text-xs text-muted-foreground">Minimum</p>
                <p className={cn(
                    "font-semibold",
                    isMobile ? "text-xs" : "text-sm"
                )}>{formatCurrency(stats.min)}</p>
            </div>
            <div className={cn(
                "space-y-1 text-center bg-muted/50 rounded-lg",
                isMobile ? "p-2" : "p-3"
            )}>
                <p className="text-xs text-muted-foreground">Rata-rata</p>
                <p className={cn(
                    "font-semibold",
                    isMobile ? "text-xs" : "text-sm"
                )}>{formatCurrency(stats.avg)}</p>
            </div>
            <div className={cn(
                "space-y-1 text-center bg-muted/50 rounded-lg",
                isMobile ? "p-2" : "p-3"
            )}>
                <p className="text-xs text-muted-foreground">Maksimum</p>
                <p className={cn(
                    "font-semibold",
                    isMobile ? "text-xs" : "text-sm"
                )}>{formatCurrency(stats.max)}</p>
            </div>
        </div>
    )
}

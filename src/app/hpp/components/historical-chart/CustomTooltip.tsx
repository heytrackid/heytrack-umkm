'use client'

import { useCurrency } from '@/hooks/useCurrency'
import { useResponsive } from '@/hooks/useResponsive'
import { cn } from '@/lib/utils'

interface CustomTooltipProps {
    active?: boolean
    payload?: Array<Record<string, any>>
    label?: string
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    const { isMobile } = useResponsive()
    const { formatCurrency } = useCurrency()

    if (active && payload && payload.length) {
        return (
            <div className={cn(
                "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
                isMobile ? "p-3 min-w-[180px]" : "p-3 min-w-[200px]"
            )}>
                <div className={cn(
                    "font-medium text-foreground mb-2 border-b pb-2",
                    isMobile ? "text-sm" : "text-base"
                )}>
                    {label}
                </div>
                <div className="space-y-1">
                    {payload.map((entry: Record<string, any>, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "rounded-full",
                                        isMobile ? "w-3 h-3" : "w-3 h-3"
                                    )}
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className={cn(
                                    "text-muted-foreground",
                                    isMobile ? "text-xs" : "text-sm"
                                )}>
                                    {entry.name}
                                </span>
                            </div>
                            <span className={cn(
                                "font-medium text-foreground",
                                isMobile ? "text-xs" : "text-sm"
                            )}>
                                {formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return null
}

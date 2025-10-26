'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useResponsive } from '@/hooks/useResponsive'
import type { TimePeriod } from '@/types/hpp-tracking'

interface PeriodFilterProps {
    selectedPeriod: TimePeriod
    onPeriodChange: (period: TimePeriod) => void
    options: Array<{ value: TimePeriod; label: string }>
}

export function PeriodFilter({ selectedPeriod, onPeriodChange, options }: PeriodFilterProps) {
    const { isMobile } = useResponsive()

    return (
        <div className={cn(
            "flex gap-2",
            isMobile && "overflow-x-auto pb-2"
        )}>
            {options.map(option => (
                <Button
                    key={option.value}
                    variant={selectedPeriod === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPeriodChange(option.value)}
                    className={cn(
                        "whitespace-nowrap",
                        isMobile && "flex-shrink-0"
                    )}
                >
                    {option.label}
                </Button>
            ))}
        </div>
    )
}

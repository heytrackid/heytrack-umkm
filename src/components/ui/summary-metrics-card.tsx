'use client'

import type { ComponentType, ReactNode } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SummaryMetricItem {
  key: string
  label: string
  icon?: ComponentType<{ className?: string }>
  value?: ReactNode
  content?: ReactNode
  valueClassName?: string
}

interface SummaryMetricsCardProps {
  items: SummaryMetricItem[]
  className?: string
  cardClassName?: string
  contentClassName?: string
  gridClassName?: string
}

export const SummaryMetricsCard = ({
  items,
  className,
  cardClassName,
  contentClassName,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3',
}: SummaryMetricsCardProps): JSX.Element => {
  return (
    <Card className={cn(cardClassName, className, 'w-full overflow-hidden')}>
      <CardContent className={cn('p-3 sm:p-4', contentClassName)}>
        <div className={cn(gridClassName, 'w-full')}>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.key} className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
                {item.content ?? (
                  <p
                    className={cn(
                      'text-lg sm:text-2xl font-bold leading-tight whitespace-normal break-words max-w-full',
                      item.valueClassName
                    )}
                  >
                    {item.value}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

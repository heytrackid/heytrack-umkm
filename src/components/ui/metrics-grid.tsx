'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface MetricsGridItem {
  key: string
  content: ReactNode
}

interface MetricsGridProps {
  items: MetricsGridItem[]
  className?: string
  gridClassName?: string
}

export const MetricsGrid = ({
  items,
  className,
  gridClassName = 'grid grid-cols-2 md:grid-cols-4 gap-4',
}: MetricsGridProps): JSX.Element => {
  return (
    <div className={cn(gridClassName, className)}>
      {items.map((item) => (
        <div key={item.key}>{item.content}</div>
      ))}
    </div>
  )
}

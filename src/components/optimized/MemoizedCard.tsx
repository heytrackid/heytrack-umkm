'use client'

import { type ReactNode, memo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Memoized Card Components
 * Prevents unnecessary re-renders of card components
 */



interface StatCardProps {
  title: string
  value: number | string
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

const MemoizedStatCard = memo(({
  title,
  value,
  description,
  icon,
  trend
}: StatCardProps) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div
            className={`text-xs ${trend.isPositive ? 'text-gray-600' : 'text-red-600'}`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  ))

MemoizedStatCard.displayName = 'MemoizedStatCard'

interface DataCardProps {
  title: string
  children: ReactNode
  actions?: ReactNode
  className?: string
}

const MemoizedDataCard = memo(({
  title,
  children,
  actions,
  className = ''
}: DataCardProps) => (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  ))

MemoizedDataCard.displayName = 'MemoizedDataCard'

interface ListCardProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export const MemoizedListCard = memo(<T,>({ 
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'Tidak ada data'
}: ListCardProps<T>) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

   return (
     <div className="space-y-2">
       {items.map((item, index) => (
         <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
       ))}
     </div>
   )
 })

MemoizedListCard.displayName = 'MemoizedListCard'

export { MemoizedStatCard, MemoizedDataCard }


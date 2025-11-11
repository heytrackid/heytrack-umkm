import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

import type { ReactNode } from 'react'

/**
 * Card List Component
 * Mobile-friendly alternative to tables
 */


interface CardListItem {
  id: string
  [key: string]: unknown
}

interface CardListProps<T extends CardListItem> {
  items: T[]
  renderCard: (item: T) => ReactNode
  onItemClick?: (item: T) => void
  className?: string
  emptyState?: ReactNode
}

export const CardList = <T extends CardListItem>({
  items,
  renderCard,
  onItemClick,
  className,
  emptyState
}: CardListProps<T>) => {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <Card
          key={item['id']}
          className={cn(
            "transition-all hover:",
            onItemClick && "cursor-pointer"
          )}
          onClick={() => onItemClick?.(item)}
        >
          <CardContent className="p-4">
            {renderCard(item)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Preset card layouts
interface DataCardProps {
  title: string
  subtitle?: string
  description?: string
  badge?: {
    label: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  }
  actions?: ReactNode
  metadata?: Array<{
    label: string
    value: number | string
  }>
}

export const DataCard = ({
  title,
  subtitle,
  description,
  badge,
  actions,
  metadata
}: DataCardProps) => (
  <div className="space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="font-semibold truncate-desktop-only">{title}</h3>
          {badge && (
            <Badge variant = {badge.variant ?? 'default'} className="text-xs flex-shrink-0">
              {badge.label}
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground text-wrap-mobile">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>

    {description && (
      <p className="text-sm text-muted-foreground text-wrap-mobile">
        {description}
      </p>
    )}

    {metadata && metadata.length > 0 && (
      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
        {metadata.map((item, index) => (
          <div key={index}>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm font-medium">{item.value}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)
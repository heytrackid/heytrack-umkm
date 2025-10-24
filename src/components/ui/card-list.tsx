/**
 * Card List Component
 * Mobile-friendly alternative to tables
 */

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { Badge } from './badge'
import { Card, CardContent } from './card'

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

export function CardList<T extends CardListItem>({
  items,
  renderCard,
  onItemClick,
  className,
  emptyState
}: CardListProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <Card
          key={item.id}
          className={cn(
            "transition-all hover:shadow-md",
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
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  actions?: ReactNode
  metadata?: Array<{
    label: string
    value: string | number
  }>
}

export function DataCard({
  title,
  subtitle,
  description,
  badge,
  actions,
  metadata
}: DataCardProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{title}</h3>
            {badge && (
              <Badge variant={badge.variant || 'default'} className="text-xs">
                {badge.label}
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-1 ml-2">
            {actions}
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
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
}

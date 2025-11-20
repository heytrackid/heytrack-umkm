'use client'

import { X } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface FilterBadge {
  id: string
  label: string
  value: string
  onRemove: () => void
}

interface FilterBadgesProps {
  filters: FilterBadge[]
  onClearAll?: () => void
  className?: string
}

export const FilterBadges = ({ filters, onClearAll, className }: FilterBadgesProps) => {
  if (filters.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Active filters:</span>
      
      {filters.map((filter) => (
        <Badge
          key={filter['id']}
          variant="secondary"
          className="gap-1 pr-1 animate-in fade-in zoom-in"
        >
          <span className="text-xs">
            {filter.label}: <strong>{filter.value}</strong>
          </span>
          <button
            onClick={filter.onRemove}
            className="ml-1 rounded-full hover:bg-muted p-0.5 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {filters.length > 1 && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  )
}

// Utility function to create filter badges from state
export function createFilterBadges<T extends Record<string, unknown>>(
  filters: T,
  labels: Record<keyof T, string>,
  setFilters: (filters: T) => void
): FilterBadge[] {
  const badges: FilterBadge[] = []

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) {return}

    // Handle array filters
    if (Array.isArray(value) && value.length > 0) {
      value.forEach((item, index) => {
        badges.push({
          id: `${key}-${index}`,
          label: labels[key as keyof T] || key,
          value: String(item),
          onRemove: () => {
            const newArray = value.filter((_, i) => i !== index)
            setFilters({ ...filters, [key]: newArray })
          }
        })
      })
    }
    // Handle string filters
    else if (typeof value === 'string' && value !== 'all') {
      badges.push({
        id: key,
        label: labels[key as keyof T] || key,
        value: String(value),
        onRemove: () => {
          setFilters({ ...filters, [key]: 'all' as T[keyof T] })
        }
      })
    }
  })

  return badges
}

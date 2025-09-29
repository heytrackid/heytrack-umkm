'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface InventoryFiltersProps {
  selectedStatus: 'all' | 'critical' | 'low' | 'adequate' | 'overstocked'
  onStatusChange: (status: 'all' | 'critical' | 'low' | 'adequate' | 'overstocked') => void
  stats: {
    total: number
    critical: number
    low: number
  }
}

/**
 * Inventory filter buttons component
 */
export function InventoryFilters({ selectedStatus, onStatusChange, stats }: InventoryFiltersProps) {
  const filters = [
    { key: 'all', label: 'Semua', count: stats.total },
    { key: 'critical', label: 'Kritis', count: stats.critical },
    { key: 'low', label: 'Rendah', count: stats.low },
    { key: 'adequate', label: 'Cukup', count: stats.total - stats.critical - stats.low },
  ] as const

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={selectedStatus === filter.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(filter.key)}
          className="flex items-center gap-1"
        >
          {filter.label}
          <Badge variant="secondary" className="text-xs">
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  )
}

import { CheckCircle, Clock, Play } from '@/components/icons'

import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'

import type { ProductionBatch } from '@/types/production'

// Production Overview Component - Lazy Loaded
// Displays production statistics and overview cards


interface ProductionOverviewProps {
  batches: ProductionBatch[]
}

// Production status constants (different from order status)
const PRODUCTION_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export const ProductionOverview = ({ batches }: ProductionOverviewProps) => {
  const completedBatches = batches.filter(b => b['status'] === PRODUCTION_STATUS.COMPLETED).slice(0, 5)

  const cards: StatCardData[] = [
    {
      title: 'Active Batches',
      value: batches.filter(b => b['status'] === PRODUCTION_STATUS.IN_PROGRESS).length,
      icon: Play,
    },
    {
      title: 'Scheduled',
      value: batches.filter(b => b['status'] === PRODUCTION_STATUS.PLANNED).length,
      icon: Clock,
    },
    {
      title: 'Completed Today',
      value: completedBatches.length,
      icon: CheckCircle,
    },
  ]

  return (
    <UiStatsCards stats={cards} gridClassName="grid grid-cols-1 gap-4 md:grid-cols-3" />
  )
}


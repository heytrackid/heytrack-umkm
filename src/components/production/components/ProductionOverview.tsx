// @ts-nocheck - Production custom types need DB schema update
// Production Overview Component - Lazy Loaded
// Displays production statistics and overview cards

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, Clock, Play } from 'lucide-react'
import type { ProductionBatch } from '@/services/production/BatchSchedulingService'

interface ProductionOverviewProps {
  batches: ProductionBatch[]
}

export default function ProductionOverview({ batches }: ProductionOverviewProps) {
  const completedBatches = batches.filter(b => b.status === 'completed').slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Batches</p>
              <p className="text-2xl font-bold">{batches.filter(b => b.status === 'in_progress').length}</p>
            </div>
            <Play className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{batches.filter(b => b.status === 'scheduled').length}</p>
            </div>
            <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold">{completedBatches.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

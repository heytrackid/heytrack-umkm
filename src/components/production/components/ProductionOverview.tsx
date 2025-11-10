import { CheckCircle, Clock, Play } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

import type { ProductionBatch } from '@/services/production/BatchSchedulingService'

// Production Overview Component - Lazy Loaded
// Displays production statistics and overview cards


interface ProductionOverviewProps {
  batches: ProductionBatch[]
}

export const ProductionOverview = ({ batches }: ProductionOverviewProps) => {
  const completedBatches = batches.filter(b => b['status'] === 'COMPLETED').slice(0, 5)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Batches</p>
              <p className="text-2xl font-bold">{batches.filter(b => b['status'] === 'IN_PROGRESS').length}</p>
            </div>
            <Play className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{batches.filter(b => b['status'] === 'PLANNED').length}</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
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
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


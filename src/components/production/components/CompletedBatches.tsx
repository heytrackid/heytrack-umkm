// Completed Batches Component - Lazy Loaded
// Displays recently completed production batches

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import type { ProductionBatch } from '@/services/production/BatchSchedulingService'

interface CompletedBatchesProps {
  batches: ProductionBatch[]
}

export default function CompletedBatches({ batches }: CompletedBatchesProps) {
  const completedBatches = batches.filter(b => b.status === 'completed').slice(0, 5)

  if (completedBatches.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Recently Completed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedBatches.map((batch) => (
            <div key={batch.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{batch.recipe_name}</h4>
                <Badge className="bg-gray-100 dark:bg-gray-8000 text-white">Completed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Quantity: {batch.quantity}
              </p>
              {batch.actual_end && (
                <p className="text-xs text-muted-foreground">
                  Completed: {format(new Date(batch.actual_end), 'MMM dd, HH:mm')}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

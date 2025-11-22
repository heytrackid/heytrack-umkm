import { CheckCircle } from '@/components/icons'
import { format } from 'date-fns'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { ProductionBatchWithDetails as ProductionBatch } from '@/types/production'

// Completed Batches Component - Lazy Loaded
// Displays recently completed production batches


interface CompletedBatchesProps {
  batches: ProductionBatch[]
}

export const CompletedBatches = ({ batches }: CompletedBatchesProps) => {
  const completedBatches = batches.filter(b => b['status'] === 'COMPLETED').slice(0, 5)

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
            <div key={batch['id']} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{batch['recipe_name']}</h4>
                <Badge className="bg-secondary0 text-white">Completed</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Quantity: {batch.quantity}
              </p>
              {batch.completed_at && (
                <p className="text-xs text-muted-foreground">
                  Completed: {format(new Date(batch.completed_at), 'MMM dd, HH:mm')}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


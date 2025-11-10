'use client'

import { format } from 'date-fns'
import { CheckCircle, ChefHat, Pause, Play, Timer } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'


import type { ProductionBatch } from '@/services/production/BatchSchedulingService'

import type { BatchExecutionState } from '@/components/production/components/types'

// Active Batches List Component - Lazy Loaded
// Displays the list of active and scheduled production batches


// Define the status type for production batches based on the enum
type ProductionStatus = 'CANCELLED' | 'COMPLETED' | 'IN_PROGRESS' | 'PLANNED'

interface ActiveBatchesListProps {
  batches: ProductionBatch[]
  executionStates: Map<string, BatchExecutionState>
  selectedBatch: string | null
  onBatchSelect: (batchId: string) => void
  onBatchUpdate?: (batchId: string, updates: Partial<ProductionBatch>) => void
  onStartBatch: (batch: ProductionBatch) => void
  onPauseBatch: (batchId: string) => void
  onCompleteBatch: (batchId: string) => void
}

export const ActiveBatchesList = ({
  batches,
  executionStates,
  selectedBatch,
  onBatchSelect,
  onBatchUpdate: _onBatchUpdate,
  onStartBatch,
  onPauseBatch,
  onCompleteBatch
}: ActiveBatchesListProps) => {
  const getStatusColor = (status: ProductionStatus) => {
    switch (status) {
      case 'PLANNED': return 'bg-muted0'
      case 'IN_PROGRESS': return 'bg-muted0'
      case 'COMPLETED': return 'bg-muted0'
      case 'CANCELLED': return 'bg-muted'
      default: return 'bg-muted0'
    }
  }

  const getCurrentStepName = (stepKey: string) => {
    // Import PRODUCTION_STEPS from types if needed
    const steps = [
      { key: 'prep', name: 'Preparation' },
      { key: 'mixing', name: 'Mixing' },
      { key: 'cooking', name: 'Cooking' },
      { key: 'cooling', name: 'Cooling' },
      { key: 'packaging', name: 'Packaging' }
    ]
    const step = steps.find((s: { key: string; name: string }) => s.key === stepKey)
    return step?.name ?? 'Unknown Step'
  }

  // Filter batches to show relevant ones
  const activeBatches = batches.filter(b =>
    (b['status'] === 'PLANNED' || b['status'] === 'IN_PROGRESS')
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Active Production
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {activeBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active production batches</p>
              </div>
            ) : (
              activeBatches.map((batch) => {
                const state = executionStates.get(batch['id'])

                return (
                  <div
                    key={batch['id']}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedBatch === batch['id'] ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                    onClick={() => onBatchSelect(batch['id'])}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {batch.recipe_id || 'Unknown Recipe'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {batch.quantity || 0} | Status: {batch['status']}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor((batch['status'] ?? 'PLANNED') as ProductionStatus)} text-white`}>
                        {batch['status'] ?? 'PLANNED'}
                      </Badge>
                    </div>

                    {state && batch['status'] && batch['status'] === 'IN_PROGRESS' && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{Math.round(state.actualProgress)}%</span>
                          </div>
                          <Progress value={state.actualProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            Current: {getCurrentStepName(state.currentStep)}
                          </p>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation()
      onPauseBatch(batch['id'])
                            }}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                              e.stopPropagation()
                              onCompleteBatch(batch['id'])
                            }}
                            disabled={state.actualProgress < 95}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </>
                    )}

                    {batch['status'] && batch['status'] === 'PLANNED' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation()
                            onStartBatch(batch)
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Production
                        </Button>
                      </div>
                    )}

                    {batch.created_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Created: {format(new Date(batch.created_at), 'MMM dd, HH:mm')}
                      </p>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}


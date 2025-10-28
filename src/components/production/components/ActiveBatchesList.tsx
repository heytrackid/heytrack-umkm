// @ts-nocheck
// Active Batches List Component - Lazy Loaded
// Displays the list of active and scheduled production batches
'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, ChefHat, Pause, Play, Timer } from 'lucide-react'
import { format } from 'date-fns'
import type { ProductionBatch } from '@/services/production/BatchSchedulingService'
import type { BatchExecutionState, PRODUCTION_STEPS } from './types'

interface ActiveBatchesListProps {
  batches: ProductionBatch[]
  executionStates: Map<string, BatchExecutionState>
  selectedBatch: string | null
  onBatchSelect: (batchId: string) => void
  onBatchUpdate?: (batchId: string, status: ProductionBatch['status'], notes?: string) => void
  onStartBatch: (batch: ProductionBatch) => void
  onPauseBatch: (batchId: string) => void
  onCompleteBatch: (batchId: string) => void
}

export default function ActiveBatchesList({
  batches,
  executionStates,
  selectedBatch,
  onBatchSelect,
  onBatchUpdate,
  onStartBatch,
  onPauseBatch,
  onCompleteBatch
}: ActiveBatchesListProps) {
  const getStatusColor = (status: ProductionBatch['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-gray-500'
      case 'in_progress': return 'bg-gray-100 dark:bg-gray-8000'
      case 'completed': return 'bg-gray-100 dark:bg-gray-8000'
      case 'blocked': return 'bg-gray-100 dark:bg-gray-8000'
      case 'cancelled': return 'bg-gray-400'
      default: return 'bg-gray-500'
    }
  }

  const getCurrentStepName = (stepKey: string) => {
    const step = PRODUCTION_STEPS.find(s => s.key === stepKey)
    return step?.name || 'Unknown Step'
  }

  // Filter batches to show relevant ones
  const activeBatches = batches.filter(b => ['scheduled', 'in_progress'].includes(b.status))

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
                const state = executionStates.get(batch.id)

                return (
                  <div
                    key={batch.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedBatch === batch.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                    onClick={() => onBatchSelect(batch.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{batch.recipe_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {batch.quantity} | Priority: {batch.priority}/10
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(batch.status)} text-white`}>
                        {batch.status}
                      </Badge>
                    </div>

                    {state && batch.status === 'in_progress' && (
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
                            onClick={(e) => {
                              e.stopPropagation()
                              onPauseBatch(batch.id)
                            }}
                          >
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onCompleteBatch(batch.id)
                            }}
                            disabled={state.actualProgress < 95}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </>
                    )}

                    {batch.status === 'scheduled' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onStartBatch(batch)
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Production
                        </Button>
                      </div>
                    )}

                    {batch.deadline && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Deadline: {format(new Date(batch.deadline), 'MMM dd, HH:mm')}
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

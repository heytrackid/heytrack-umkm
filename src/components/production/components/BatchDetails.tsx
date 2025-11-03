import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CheckSquare, Eye, MessageSquare, X } from 'lucide-react'
import type { ProductionBatchWithDetails as ProductionBatch } from '@/services/production/BatchSchedulingService'
import type { BatchExecutionState } from './types'

// Batch Details Component - Lazy Loaded
// Displays detailed view of selected batch with quality control and notes


interface BatchDetailsProps {
  selectedBatch: string | null
  batches: ProductionBatch[]
  executionStates: Map<string, BatchExecutionState>
  currentNotes: string
  onNotesChange: (notes: string) => void
  onAddNote: (batchId: string) => void
  onQualityCheck: (batchId: string, checkId: string, passed: boolean, notes?: string) => void
}

const BatchDetails = ({
  selectedBatch,
  batches,
  executionStates,
  currentNotes,
  onNotesChange,
  onAddNote,
  onQualityCheck
}: BatchDetailsProps) => {
  if (!selectedBatch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Batch Details & Quality Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Select a batch to view details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const state = executionStates.get(selectedBatch)
  const batch = batches.find(b => b.id === selectedBatch)

  if (!batch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Batch Details & Quality Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Batch not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Batch Details & Quality Control
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Batch Info */}
          <div>
            <h3 className="font-semibold text-lg">{batch.recipe_name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-1">
              <span>Quantity: {batch.quantity}</span>
              <span>Priority: {batch.priority}/10</span>
              <span>Duration: {batch.estimated_duration} min</span>
              {state?.assignedBaker && <span>Baker: {state.assignedBaker}</span>}
            </div>
          </div>

          <Separator />

          {/* Quality Checks */}
          {state && (
            <div className="space-y-3">
              <h4 className="font-medium">Quality Checks</h4>
              {state.qualityChecks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{check.name}</span>
                  <div className="flex gap-1">
                    {check.completed ? (
                      <Badge variant={check.passed ? "default" : "destructive"} className="text-xs">
                        {check.passed ? 'LULUS' : 'GAGAL'}
                      </Badge>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQualityCheck(selectedBatch, check.id, true)}
                        >
                          <CheckSquare className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onQualityCheck(selectedBatch, check.id, false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />

          {/* Production Notes */}
          <div className="space-y-2">
            <h4 className="font-medium">Production Notes</h4>

            <ScrollArea className="h-32 border rounded p-2">
              {state?.notes.length ? (
                <div className="space-y-1 text-sm">
                  {state.notes.map((note, index) => (
                    <p key={index} className="text-muted-foreground">
                      {note}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No notes yet</p>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                value={currentNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button
                onClick={() => onAddNote(selectedBatch)}
                disabled={!currentNotes.trim()}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default BatchDetails

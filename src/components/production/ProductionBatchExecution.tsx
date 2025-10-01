/**
 * ProductionBatchExecution
 * Interface for starting, monitoring, and completing production batches
 * Provides real-time status updates and batch control functionality
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  Oven,
  AlertTriangle,
  MessageSquare,
  Timer,
  ChefHat,
  Package,
  Eye,
  RefreshCw,
  CheckSquare,
  X
} from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'
import { toast } from 'react-hot-toast'

import { ProductionBatch } from '@/services/production/BatchSchedulingService'
import { productionDataIntegration } from '@/services/production/ProductionDataIntegration'

interface ProductionBatchExecutionProps {
  batches: ProductionBatch[]
  onBatchUpdate?: (batchId: string, status: ProductionBatch['status'], notes?: string) => void
  onBatchSelect?: (batch: ProductionBatch) => void
  className?: string
}

interface BatchExecutionState {
  batch: ProductionBatch
  startTime?: Date
  estimatedEndTime?: Date
  actualProgress: number
  currentStep: string
  notes: string[]
  qualityChecks: QualityCheck[]
  assignedBaker?: string
}

interface QualityCheck {
  id: string
  name: string
  completed: boolean
  timestamp?: string
  notes?: string
  passed?: boolean
}

const PRODUCTION_STEPS = [
  { key: 'prep', name: 'Ingredient Preparation', duration: 15 },
  { key: 'mixing', name: 'Mixing & Dough Preparation', duration: 30 },
  { key: 'resting', name: 'Resting/Proofing', duration: 45 },
  { key: 'baking', name: 'Baking', duration: 60 },
  { key: 'cooling', name: 'Cooling', duration: 30 },
  { key: 'decorating', name: 'Decorating/Finishing', duration: 45 },
  { key: 'packaging', name: 'Packaging', duration: 15 },
  { key: 'quality', name: 'Final Quality Check', duration: 10 }
]

const QUALITY_CHECKS = [
  { id: 'ingredients', name: 'Ingredients verified and measured' },
  { id: 'texture', name: 'Proper texture and consistency' },
  { id: 'baking', name: 'Proper baking temperature and time' },
  { id: 'appearance', name: 'Visual appearance meets standards' },
  { id: 'packaging', name: 'Correct packaging and labeling' }
]

export default function ProductionBatchExecution({
  batches,
  onBatchUpdate,
  onBatchSelect,
  className = ''
}: ProductionBatchExecutionProps) {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [executionStates, setExecutionStates] = useState<Map<string, BatchExecutionState>>(new Map())
  const [currentNotes, setCurrentNotes] = useState('')
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateBatchProgress()
    }, 30000)
    setRefreshInterval(interval)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [batches])

  // Initialize execution states for active batches
  useEffect(() => {
    const activeBatches = batches.filter(b => b.status === 'in_progress')
    const newStates = new Map(executionStates)

    for (const batch of activeBatches) {
      if (!newStates.has(batch.id)) {
        newStates.set(batch.id, {
          batch,
          actualProgress: 0,
          currentStep: 'prep',
          notes: [],
          qualityChecks: QUALITY_CHECKS.map(check => ({ ...check, completed: false }))
        })
      }
    }

    setExecutionStates(newStates)
  }, [batches])

  const updateBatchProgress = () => {
    const newStates = new Map(executionStates)
    let hasUpdates = false

    for (const [batchId, state] of newStates.entries()) {
      if (state.batch.status === 'in_progress' && state.startTime) {
        const elapsed = differenceInMinutes(new Date(), state.startTime)
        const estimatedDuration = state.batch.estimated_duration
        const newProgress = Math.min(100, (elapsed / estimatedDuration) * 100)
        
        if (Math.abs(newProgress - state.actualProgress) > 1) {
          state.actualProgress = newProgress
          
          // Update current step based on progress
          const stepIndex = Math.floor((newProgress / 100) * PRODUCTION_STEPS.length)
          const currentStep = PRODUCTION_STEPS[Math.min(stepIndex, PRODUCTION_STEPS.length - 1)]
          state.currentStep = currentStep.key
          
          hasUpdates = true
        }
      }
    }

    if (hasUpdates) {
      setExecutionStates(new Map(newStates))
    }
  }

  const handleStartBatch = (batch: ProductionBatch) => {
    const now = new Date()
    const estimatedEnd = new Date(now.getTime() + batch.estimated_duration * 60 * 1000)
    
    const newState: BatchExecutionState = {
      batch: { ...batch, status: 'in_progress' },
      startTime: now,
      estimatedEndTime: estimatedEnd,
      actualProgress: 0,
      currentStep: 'prep',
      notes: [`Batch started at ${format(now, 'HH:mm')}`],
      qualityChecks: QUALITY_CHECKS.map(check => ({ ...check, completed: false })),
      assignedBaker: 'Current User' // Would get from auth context
    }

    const newStates = new Map(executionStates)
    newStates.set(batch.id, newState)
    setExecutionStates(newStates)

    onBatchUpdate?.(batch.id, 'in_progress', `Batch started at ${format(now, 'HH:mm')}`)
    toast.success(`Started production of ${batch.recipe_name}`)
  }

  const handlePauseBatch = (batchId: string) => {
    const state = executionStates.get(batchId)
    if (!state) return

    const updatedBatch = { ...state.batch, status: 'scheduled' as const }
    const newState = { 
      ...state, 
      batch: updatedBatch,
      notes: [...state.notes, `Batch paused at ${format(new Date(), 'HH:mm')}`]
    }

    const newStates = new Map(executionStates)
    newStates.set(batchId, newState)
    setExecutionStates(newStates)

    onBatchUpdate?.(batchId, 'scheduled', `Batch paused at ${format(new Date(), 'HH:mm')}`)
    toast.info(`Paused production of ${state.batch.recipe_name}`)
  }

  const handleCompleteBatch = async (batchId: string) => {
    const state = executionStates.get(batchId)
    if (!state) return

    // Check if all quality checks are completed
    const allQualityChecksPassed = state.qualityChecks.every(check => check.completed && check.passed !== false)
    
    if (!allQualityChecksPassed) {
      toast.error('Please complete all quality checks before finishing the batch')
      return
    }

    try {
      const completedAt = new Date()
      const updatedBatch = { 
        ...state.batch, 
        status: 'completed' as const,
        actual_end: completedAt.toISOString()
      }
      
      const newState = { 
        ...state, 
        batch: updatedBatch,
        actualProgress: 100,
        notes: [...state.notes, `Batch completed at ${format(completedAt, 'HH:mm')}`]
      }

      const newStates = new Map(executionStates)
      newStates.set(batchId, newState)
      setExecutionStates(newStates)

      // Update production progress in the system
      await productionDataIntegration.updateProductionProgress(batchId, 'completed')

      onBatchUpdate?.(batchId, 'completed', `Batch completed at ${format(completedAt, 'HH:mm')}`)
      toast.success(`Completed production of ${state.batch.recipe_name}`)
    } catch (error: any) {
      console.error('Error completing batch:', error)
      toast.error('Failed to complete batch')
    }
  }

  const handleQualityCheck = (batchId: string, checkId: string, passed: boolean, notes?: string) => {
    const state = executionStates.get(batchId)
    if (!state) return

    const updatedChecks = state.qualityChecks.map(check => 
      check.id === checkId 
        ? { 
            ...check, 
            completed: true, 
            passed, 
            timestamp: new Date().toISOString(),
            notes 
          }
        : check
    )

    const newState = {
      ...state,
      qualityChecks: updatedChecks,
      notes: [
        ...state.notes, 
        `Quality check "${checkId}": ${passed ? 'PASSED' : 'FAILED'}${notes ? ` - ${notes}` : ''}`
      ]
    }

    const newStates = new Map(executionStates)
    newStates.set(batchId, newState)
    setExecutionStates(newStates)
  }

  const addNote = (batchId: string) => {
    if (!currentNotes.trim()) return

    const state = executionStates.get(batchId)
    if (!state) return

    const newState = {
      ...state,
      notes: [...state.notes, `${format(new Date(), 'HH:mm')} - ${currentNotes}`]
    }

    const newStates = new Map(executionStates)
    newStates.set(batchId, newState)
    setExecutionStates(newStates)
    
    setCurrentNotes('')
    toast.success('Note added')
  }

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
  const completedBatches = batches.filter(b => b.status === 'completed').slice(0, 5) // Show last 5 completed

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Production Overview */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Batches List */}
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
                    const state = executionStates.get(key)
                    
                    return (
                      <div 
                        key={batch.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedBatch === batch.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedBatch(batch.id)
                          onBatchSelect?.(batch)
                        }}
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
                                  handlePauseBatch(batch.id)
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
                                  handleCompleteBatch(batch.id)
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
                                handleStartBatch(batch)
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

        {/* Batch Details & Quality Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Batch Details & Quality Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBatch ? (
              <div>
                {(() => {
                  const state = executionStates.get(selectedBatch)
                  const batch = batches.find(b => b.id === selectedBatch)
                  
                  if (!batch) return <p>Batch not found</p>

                  return (
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
                                  <Badge variant={check.passed ?"default" :"destructive"} className="text-xs">
                                    {check.passed ? 'PASSED' : 'FAILED'}
                                  </Badge>
                                ) : (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQualityCheck(selectedBatch, check.id, true)}
                                    >
                                      <CheckSquare className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleQualityCheck(selectedBatch, check.id, false)}
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
                              {state.notes.map((note, index: number) => (
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
                            placeholder="Add production note..."
                            value={currentNotes}
                            onChange={(e) => setCurrentNotes(e.target.value)}
                            className="flex-1"
                            rows={2}
                          />
                          <Button
                            onClick={() => addNote(selectedBatch)}
                            disabled={!currentNotes.trim()}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a batch to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently Completed Batches */}
      {completedBatches.length > 0 && (
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
      )}
    </div>
  )
}
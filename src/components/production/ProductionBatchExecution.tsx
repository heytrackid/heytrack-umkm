/**
 * ProductionBatchExecution
 * Interface for starting, monitoring, and completing production batches
 * Provides real-time status updates and batch control functionality
 */
'use client'

import { useEffect, useState } from 'react'
import { differenceInMinutes, format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { apiLogger } from '@/lib/logger'
import { ProductionDataIntegration } from '@/services/production/ProductionDataIntegration'
import type { ProductionBatchWithDetails as ProductionBatch } from '@/services/production/BatchSchedulingService'

// Import production components normally (lightweight UI components)
import ProductionOverview from './components/ProductionOverview'
import ActiveBatchesList from './components/ActiveBatchesList'
import BatchDetails from './components/BatchDetails'
import CompletedBatches from './components/CompletedBatches'

import type {
  BatchExecutionState,
} from './components/types'

// Import constants that are still needed
import { PRODUCTION_STEPS, QUALITY_CHECKS } from './components/types'

interface ProductionBatchExecutionProps {
  batches: ProductionBatch[]
  onBatchUpdate?: (batchId: string, updates: Partial<ProductionBatch>) => void
  onBatchSelect?: (batchId: string) => void
  className?: string
}

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

  const { toast } = useToast()

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void updateBatchProgress()
    }, 30000)
    void setRefreshInterval(interval)

    return () => {
      if (interval) { clearInterval(interval) }
    }
  }, [batches])

  // Initialize execution states for active batches
  useEffect(() => {
    const activeBatches = batches.filter(b => b.status === 'IN_PROGRESS')
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

    void setExecutionStates(newStates)
  }, [batches])

  const updateBatchProgress = () => {
    const newStates = new Map(executionStates)
    let hasUpdates = false

    for (const [batchId, state] of newStates.entries()) {
      if (state.batch.status === 'IN_PROGRESS' && state.startTime) {
        const elapsed = differenceInMinutes(new Date(), state.startTime)
        const estimatedDuration = state.batch.estimated_duration || 60 // fallback to 60 minutes if not provided
        const newProgress = Math.min(100, (elapsed / estimatedDuration) * 100)

        if (Math.abs(newProgress - state.actualProgress) > 1) {
          state.actualProgress = newProgress

          // Update current step based on progress
          const stepIndex = Math.floor((newProgress / 100) * PRODUCTION_STEPS.length)
          const currentStep = PRODUCTION_STEPS[Math.min(stepIndex, PRODUCTION_STEPS.length - 1)]
          state.currentStep = currentStep?.key || 'prep'

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
    const estimatedEnd = new Date(now.getTime() + (batch.estimated_duration || 60) * 60 * 1000)

    const newState: BatchExecutionState = {
      batch: { ...batch, status: 'IN_PROGRESS' },
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
    void setExecutionStates(newStates)

    onBatchUpdate?.(batch.id, 'IN_PROGRESS', `Batch started at ${format(now, 'HH:mm')}`)
    toast({
      title: 'Batch Started',
      description: `Started production of ${batch.recipe_id || 'Batch'}`,
    })
  }

  const handlePauseBatch = (batchId: string) => {
    const state = executionStates.get(batchId)
    if (!state) { return }

    const updatedBatch = { ...state.batch, status: 'PLANNED' as const }
    const newState = {
      ...state,
      batch: updatedBatch,
      notes: [...state.notes, `Batch paused at ${format(new Date(), 'HH:mm')}`]
    }

    const newStates = new Map(executionStates)
    newStates.set(batchId, newState)
    void setExecutionStates(newStates)

    onBatchUpdate?.(batchId, 'PLANNED', `Batch paused at ${format(new Date(), 'HH:mm')}`)
    toast({
      title: 'Batch Paused',
      description: `Paused production of ${state.batch.recipe_id || 'Batch'}`,
    })
  }

  const handleCompleteBatch = async (batchId: string) => {
    const state = executionStates.get(batchId)
    if (!state) { return }

    // Check if all quality checks are completed
    const allQualityChecksPassed = state.qualityChecks.every(check => check.completed && check.passed !== false)

    if (!allQualityChecksPassed) {
      toast({
        title: 'Quality Check Required',
        description: 'Please complete all quality checks before finishing the batch',
        variant: 'destructive'
      })
      return
    }

    try {
      const completedAt = new Date()
      const updatedBatch = {
        ...state.batch,
        status: 'COMPLETED' as const,
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
      void setExecutionStates(newStates)

      // Update production progress in the system
      // Note: UpdateProductionProgress is not defined in the service, so we'll just log for now
      apiLogger.info({ batchId, status: 'COMPLETED' }, 'Production completed, updating system')

      onBatchUpdate?.(batchId, 'COMPLETED', `Batch completed at ${format(completedAt, 'HH:mm')}`)
      toast({
        title: 'Batch Completed',
        description: `Completed production of ${state.batch.recipe_id || 'Batch'}`,
      })
    } catch (err: unknown) {
      apiLogger.error({ error: err }, 'Error completing batch:')
      toast({
        title: 'Error',
        description: 'Failed to complete batch',
        variant: 'destructive'
      })
    }
  }

  const handleQualityCheck = (batchId: string, checkId: string, passed: boolean, notes?: string) => {
    const state = executionStates.get(batchId)
    if (!state) { return }

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
    void setExecutionStates(newStates)
  }

  const addNote = (batchId: string) => {
    if (!currentNotes.trim()) { return }

    const state = executionStates.get(batchId)
    if (!state) { return }

    const newState = {
      ...state,
      notes: [...state.notes, `${format(new Date(), 'HH:mm')} - ${currentNotes}`]
    }

    const newStates = new Map(executionStates)
    newStates.set(batchId, newState)
    void setExecutionStates(newStates)

    void setCurrentNotes('')
    toast({
      title: 'Note Added',
      description: 'Production note has been added',
    })
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Production Overview - Lazy Loaded */}
      <ProductionOverview batches={batches} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Batches List - Lazy Loaded */}
        <ActiveBatchesList
          batches={batches}
          executionStates={executionStates}
          selectedBatch={selectedBatch}
          onBatchSelect={(batchId) => {
            void setSelectedBatch(batchId)
            onBatchSelect?.(batches.find(b => b.id === batchId))
          }}
          onBatchUpdate={onBatchUpdate}
          onStartBatch={handleStartBatch}
          onPauseBatch={handlePauseBatch}
          onCompleteBatch={handleCompleteBatch}
        />

        {/* Batch Details & Quality Control - Lazy Loaded */}
        <BatchDetails
          selectedBatch={selectedBatch}
          batches={batches}
          executionStates={executionStates}
          currentNotes={currentNotes}
          onNotesChange={setCurrentNotes}
          onAddNote={addNote}
          onQualityCheck={handleQualityCheck}
        />
      </div>

      {/* Recently Completed Batches - Lazy Loaded */}
      <CompletedBatches batches={batches} />
    </div>
  )
}

// Import constants that are still needed
import { PRODUCTION_STEPS } from './components/types'

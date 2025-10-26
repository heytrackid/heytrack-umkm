// Production Components Types
// Type definitions for production batch execution components

import type { ProductionBatch } from '@/services/production/BatchSchedulingService'

export interface BatchExecutionState {
  batch: ProductionBatch
  startTime?: Date
  estimatedEndTime?: Date
  actualProgress: number
  currentStep: string
  notes: string[]
  qualityChecks: QualityCheck[]
  assignedBaker?: string
}

export interface QualityCheck {
  id: string
  name: string
  completed: boolean
  timestamp?: string
  notes?: string
  passed?: boolean
}

export interface ProductionStep {
  key: string
  name: string
  duration: number
}

export interface ProductionOverviewProps {
  batches: ProductionBatch[]
}

export interface ActiveBatchesListProps {
  batches: ProductionBatch[]
  executionStates: Map<string, BatchExecutionState>
  selectedBatch: string | null
  onBatchSelect: (batchId: string) => void
  onBatchUpdate?: (batchId: string, status: ProductionBatch['status'], notes?: string) => void
  onStartBatch: (batch: ProductionBatch) => void
  onPauseBatch: (batchId: string) => void
  onCompleteBatch: (batchId: string) => void
}

export interface BatchDetailsProps {
  selectedBatch: string | null
  batches: ProductionBatch[]
  executionStates: Map<string, BatchExecutionState>
  currentNotes: string
  onNotesChange: (notes: string) => void
  onAddNote: (batchId: string) => void
  onQualityCheck: (batchId: string, checkId: string, passed: boolean, notes?: string) => void
}

export interface CompletedBatchesProps {
  batches: ProductionBatch[]
}

export const PRODUCTION_STEPS: ProductionStep[] = [
  { key: 'prep', name: 'Ingredient Preparation', duration: 15 },
  { key: 'mixing', name: 'Mixing & Dough Preparation', duration: 30 },
  { key: 'resting', name: 'Resting/Proofing', duration: 45 },
  { key: 'baking', name: 'Baking', duration: 60 },
  { key: 'cooling', name: 'Cooling', duration: 30 },
  { key: 'decorating', name: 'Decorating/Finishing', duration: 45 },
  { key: 'packaging', name: 'Packaging', duration: 15 },
  { key: 'quality', name: 'Final Quality Check', duration: 10 }
]

export const QUALITY_CHECKS: QualityCheck[] = [
  { id: 'ingredients', name: 'Ingredients verified and measured', completed: false },
  { id: 'texture', name: 'Proper texture and consistency', completed: false },
  { id: 'baking', name: 'Proper baking temperature and time', completed: false },
  { id: 'appearance', name: 'Visual appearance meets standards', completed: false },
  { id: 'packaging', name: 'Correct packaging and labeling', completed: false }
]

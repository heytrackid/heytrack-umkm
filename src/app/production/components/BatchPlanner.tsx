'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  ChefHat,
  AlertCircle,
  CheckCircle2,
  Package,
  Play,
  Pause,
  MoreVertical
} from "lucide-react"
import { 
  useProductionBatches, 
  useBatchScheduling,
  useBatchStatus,
  useProductionCurrency 
} from '../hooks/use-production'
import { 
  PRODUCTION_STATUS_COLORS, 
  BATCH_PRIORITY_COLORS,
  DEFAULT_PRODUCTION_CONFIG 
} from '../config/production.config'
import type { CreateBatchData, ProductionStatus, BatchPriority } from '../types/production.types'

interface BatchPlannerProps {
  className?: string
}

export default function BatchPlanner({ className }: BatchPlannerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProductionStatus | 'all'>('all')
  const [priorityFilter, setPriorityFilter] = useState<BatchPriority | 'all'>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null)

  // Hooks
  const { batches, loading, error, createBatch, refreshBatches } = useProductionBatches({
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? [statusFilter] : undefined,
    priority: priorityFilter !== 'all' ? [priorityFilter] : undefined
  })
  const { generateSchedule, currentQueue } = useBatchScheduling()
  const { updateStatus, canTransitionTo } = useBatchStatus(selectedBatchId || '')
  const { formatCost } = useProductionCurrency()

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBatches()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [refreshBatches])

  const handleCreateBatch = async (batchData: CreateBatchData) => {
    try {
      const schedule = generateSchedule(batchData)
      const fullBatchData: CreateBatchData = {
        ...batchData,
        scheduled_start: schedule.scheduled_start.toISOString(),
        scheduled_completion: schedule.scheduled_completion.toISOString()
      }
      
      await createBatch(fullBatchData)
      setShowCreateDialog(false)
      refreshBatches()
    } catch (error) {
      console.error('Failed to create batch:', error)
    }
  }

  const handleStatusUpdate = async (batchId: string, newStatus: ProductionStatus) => {
    try {
      await updateStatus(newStatus, `Status updated to ${newStatus}`)
      refreshBatches()
    } catch (error) {
      console.error('Failed to update batch status:', error)
    }
  }

  const getStatusIcon = (status: ProductionStatus) => {
    switch (status) {
      case 'planned': return <Calendar className="h-4 w-4" />
      case 'ingredients_ready': return <Package className="h-4 w-4" />
      case 'in_progress': return <Play className="h-4 w-4" />
      case 'quality_check': return <CheckCircle2 className="h-4 w-4" />
      case 'completed': return <CheckCircle2 className="h-4 w-4" />
      case 'on_hold': return <Pause className="h-4 w-4" />
      case 'cancelled': return <AlertCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      default: return <Calendar className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: BatchPriority) => {
    return BATCH_PRIORITY_COLORS[priority] || 'gray'
  }

  const getStatusColor = (status: ProductionStatus) => {
    return PRODUCTION_STATUS_COLORS[status] || 'gray'
  }

  if (loading) {
    return <div>Loading batch data...</div>
  }

  if (error) {
    return <div>Error loading batches: {error.message}</div>
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Batch Planning & Scheduling
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and schedule production batches • {currentQueue} in queue
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Batch</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
            </DialogHeader>
            <CreateBatchForm 
              onSubmit={handleCreateBatch}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProductionStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="ingredients_ready">Ready</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="quality_check">Quality Check</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as BatchPriority | 'all')}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="rush">Rush</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Batch list */}
      <div className="space-y-4">
        {batches?.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No batches planned
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by creating your first production batch
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Batch
              </Button>
            </CardContent>
          </Card>
        ) : (
          batches?.map(batch => (
            <Card key={batch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full bg-${getStatusColor(batch.status)}-500`} />
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {batch.batch_number}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`bg-${getPriorityColor(batch.priority)}-100 text-${getPriorityColor(batch.priority)}-800`}
                        >
                          {batch.priority}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          {getStatusIcon(batch.status)}
                          <span>{batch.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {batch.recipe_name} • {batch.planned_quantity} units
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Scheduled Start
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(batch.scheduled_start).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Duration
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(batch.estimated_duration_minutes / 60)}h {batch.estimated_duration_minutes % 60}m
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Cost
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatCost(batch.planned_cost)}
                      </p>
                    </div>

                    <BatchActionsMenu 
                      batch={batch}
                      onStatusUpdate={handleStatusUpdate}
                      canTransitionTo={canTransitionTo}
                    />
                  </div>
                </div>

                {/* Progress indicator for active batches */}
                {batch.status === 'in_progress' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress
                      </span>
                      <span className="font-medium text-blue-600">
                        65% complete
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Create Batch Form Component
interface CreateBatchFormProps {
  onSubmit: (data: CreateBatchData) => void
  onCancel: () => void
}

function CreateBatchForm({ onSubmit, onCancel }: CreateBatchFormProps) {
  const [formData, setFormData] = useState<Partial<CreateBatchData>>({
    priority: 'normal',
    planned_quantity: 50,
    batch_size: 50
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.recipe_id && formData.planned_quantity) {
      onSubmit(formData as CreateBatchData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="recipe">Recipe</Label>
        <Select onValueChange={(value) => setFormData({ ...formData, recipe_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select recipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recipe-1">Roti Tawar</SelectItem>
            <SelectItem value="recipe-2">Croissant</SelectItem>
            <SelectItem value="recipe-3">Danish Pastry</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quantity">Planned Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={formData.planned_quantity || ''}
          onChange={(e) => setFormData({ ...formData, planned_quantity: parseInt(e.target.value) })}
          placeholder="50"
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value) => setFormData({ ...formData, priority: value as BatchPriority })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="rush">Rush</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Batch
        </Button>
      </div>
    </form>
  )
}

// Batch Actions Menu
interface BatchActionsMenuProps {
  batch: any
  onStatusUpdate: (batchId: string, status: ProductionStatus) => void
  canTransitionTo: (current: ProductionStatus, target: ProductionStatus) => boolean
}

function BatchActionsMenu({ batch, onStatusUpdate, canTransitionTo }: BatchActionsMenuProps) {
  const [showMenu, setShowMenu] = useState(false)

  const nextStatuses: ProductionStatus[] = [
    'ingredients_ready',
    'in_progress',
    'quality_check',
    'completed',
    'on_hold',
    'cancelled'
  ]

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-8 z-10 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <div className="py-1">
            {nextStatuses
              .filter(status => canTransitionTo(batch.status, status))
              .map(status => (
                <button
                  key={status}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    onStatusUpdate(batch.id, status)
                    setShowMenu(false)
                  }}
                >
                  Move to {status.replace('_', ' ')}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  Pause
} from "lucide-react"

interface BatchPlannerProps {
  className?: string
}

// Mock batch data
const mockBatches = [
  {
    id: '1',
    batch_number: 'BTH001',
    recipe_name: 'Roti Tawar Premium',
    quantity: 50,
    status: 'in_progress',
    priority: 'high',
    scheduled_start: new Date('2024-01-15T08:00:00'),
    scheduled_completion: new Date('2024-01-15T14:00:00'),
    actual_start: new Date('2024-01-15T08:15:00'),
    assigned_staff: ['Chef A', 'Assistant B'],
    progress: 65
  },
  {
    id: '2',
    batch_number: 'BTH002',
    recipe_name: 'Croissant Butter',
    quantity: 24,
    status: 'planned',
    priority: 'normal',
    scheduled_start: new Date('2024-01-15T10:00:00'),
    scheduled_completion: new Date('2024-01-15T16:00:00'),
    assigned_staff: ['Chef C'],
    progress: 0
  },
  {
    id: '3',
    batch_number: 'BTH003',
    recipe_name: 'Kue Coklat Fudge',
    quantity: 16,
    status: 'quality_check',
    priority: 'urgent',
    scheduled_start: new Date('2024-01-15T06:00:00'),
    scheduled_completion: new Date('2024-01-15T12:00:00'),
    actual_start: new Date('2024-01-15T06:00:00'),
    assigned_staff: ['Chef A', 'QC Manager'],
    progress: 95
  }
]

export default function BatchPlanner({ className }: BatchPlannerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [batches] = useState(mockBatches)

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'ingredients_ready': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'in_progress': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'quality_check': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'completed': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'failed': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'normal': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      case 'rush': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.recipe_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || batch.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || batch.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Batch Planning & Scheduling
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Plan and schedule production batches • {batches.length} total
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
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This feature will be fully implemented soon.
              </p>
              <Button onClick={() => setShowCreateDialog(false)} className="w-full">
                Close
              </Button>
            </div>
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
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

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
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

      {/* Batches Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBatches.map((batch) => (
          <Card key={batch.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-semibold">{batch.batch_number}</span>
                </div>
                <Badge className={getPriorityColor(batch.priority)}>
                  {batch.priority}
                </Badge>
              </div>
              <CardTitle className="text-lg">{batch.recipe_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Quantity:</span>
                <span className="font-medium">{batch.quantity} units</span>
              </div>
              
              <div className="flex items-center gap-2">
                {getStatusIcon(batch.status)}
                <Badge className={getStatusColor(batch.status)}>
                  {batch.status.replace('_', ' ')}
                </Badge>
              </div>

              {batch.status === 'in_progress' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress:</span>
                    <span>{batch.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${batch.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {batch.scheduled_start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {batch.scheduled_completion.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-xs text-muted-foreground">
                Staff: {batch.assigned_staff.join(', ')}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No batches found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by creating your first production batch'
              }
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/**
 * ProductionTimeline
 * Visual Gantt chart timeline for production batch scheduling
 * Shows production batches, resource allocation, and dependencies
 */

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Calendar,
  Clock, 
  ChefHat,
  Oven,
  Package,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  BarChart3,
  Settings
} from 'lucide-react'
import { format, addHours, startOfDay, endOfDay, differenceInMinutes } from 'date-fns'

import { 
  ProductionBatch, 
  TimelineSlot, 
  SchedulingResult,
  batchSchedulingService 
} from '@/services/production/BatchSchedulingService'

interface ProductionTimelineProps {
  schedulingResult?: SchedulingResult
  onBatchSelect?: (batch: ProductionBatch) => void
  onBatchStatusChange?: (batchId: string, status: ProductionBatch['status']) => void
  className?: string
}

interface TimelineGridConfig {
  startDate: Date
  endDate: Date
  hoursPerDay: number
  pixelsPerHour: number
  totalWidth: number
}

const RESOURCE_COLORS = {
  oven: 'bg-orange-500',
  mixer: 'bg-gray-100 dark:bg-gray-8000', 
  decorator: 'bg-gray-100 dark:bg-gray-8000',
  packaging: 'bg-gray-100 dark:bg-gray-8000'
}

const STATUS_COLORS = {
  scheduled: 'bg-gray-400',
  in_progress: 'bg-gray-100 dark:bg-gray-8000',
  completed: 'bg-gray-100 dark:bg-gray-8000',
  cancelled: 'bg-gray-100 dark:bg-gray-8000',
  blocked: 'bg-red-300'
}

export default function ProductionTimeline({
  schedulingResult,
  onBatchSelect,
  onBatchStatusChange,
  className = ''
}: ProductionTimelineProps) {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [zoomLevel, setZoomLevel] = useState(1)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Calculate timeline grid configuration
  const timelineGrid = useMemo((): TimelineGridConfig => {
    if (!schedulingResult?.schedule.length) {
      return {
        startDate: startOfDay(new Date()),
        endDate: endOfDay(new Date()),
        hoursPerDay: 12,
        pixelsPerHour: 60 * zoomLevel,
        totalWidth: 12 * 60 * zoomLevel
      }
    }

    const scheduledBatches = schedulingResult.schedule.filter(b => b.scheduled_start)
    const startTimes = scheduledBatches.map(b => new Date(b.scheduled_start!))
    const endTimes = scheduledBatches.map(b => new Date(b.scheduled_end!))

    const startDate = startOfDay(new Date(Math.min(...startTimes.map(d => d.getTime()))))
    const endDate = endOfDay(new Date(Math.max(...endTimes.map(d => d.getTime()))))
    
    const hoursPerDay = 12
    const pixelsPerHour = 60 * zoomLevel
    
    return {
      startDate,
      endDate,
      hoursPerDay,
      pixelsPerHour,
      totalWidth: differenceInMinutes(endDate, startDate) / 60 * pixelsPerHour
    }
  }, [schedulingResult, zoomLevel])

  // Calculate position of batch on timeline
  const calculateBatchPosition = (batch: ProductionBatch) => {
    if (!batch.scheduled_start || !batch.scheduled_end) return null

    const batchStart = new Date(batch.scheduled_start)
    const batchEnd = new Date(batch.scheduled_end)
    
    const startOffsetMinutes = differenceInMinutes(batchStart, timelineGrid.startDate)
    const durationMinutes = differenceInMinutes(batchEnd, batchStart)
    
    const left = (startOffsetMinutes / 60) * timelineGrid.pixelsPerHour
    const width = Math.max(40, (durationMinutes / 60) * timelineGrid.pixelsPerHour)
    
    return { left, width }
  }

  // Generate timeline hours grid
  const timelineHours = useMemo(() => {
    const hours = []
    let currentHour = new Date(timelineGrid.startDate)
    
    while (currentHour < timelineGrid.endDate) {
      hours.push(new Date(currentHour))
      currentHour = addHours(currentHour, 1)
    }
    
    return hours
  }, [timelineGrid])

  // Group timeline slots by resource
  const resourceGroups = useMemo(() => {
    if (!schedulingResult?.timeline) return []

    const groups: Record<string, TimelineSlot[]> = {}
    
    schedulingResult.timeline.forEach(slot => {
      const key = `${slot.resource_type}-${slot.resource_id}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(slot)
    })

    return Object.entries(groups).map(([resourceKey, slots]) => ({
      resourceKey,
      resourceType: slots[0]?.resource_type || 'oven',
      resourceId: slots[0]?.resource_id || '',
      slots: slots.sor"" => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    }))
  }, [schedulingResult])

  const handleBatchClick = (batch: ProductionBatch) => {
    setSelectedBatch(batch.id)
    onBatchSelect?.(batch)
  }

  const handleStatusToggle = (batch: ProductionBatch) => {
    const nextStatus = batch.status === 'scheduled' ? 'in_progress' : 
                      batch.status === 'in_progress' ? 'completed' : 'scheduled'
    onBatchStatusChange?.(batch.id, nextStatus)
  }

  return (
    <TooltipProvider>
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Production Timeline
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              >
                -
              </Button>
              <span className="text-sm text-muted-foreground">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
              >
               
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* View mode toggle */}
              <div className="flex rounded-lg bg-muted p-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
              </div>
            </div>
          </div>

          {/* Timeline stats */}
          {schedulingResult && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {schedulingResult.schedule.filter(b => b.status === 'scheduled').length} scheduled
              </div>
              <div className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                {schedulingResult.schedule.filter(b => b.status === 'in_progress').length} in progress
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {schedulingResult.schedule.filter(b => b.status === 'blocked').length} blocked
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {Math.round(schedulingResult.resource_utilization.oven_utilization)}% oven utilization
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {!schedulingResult ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Production Schedule</h3>
              <p className="text-muted-foreground max-w-md">
                Create a production schedule to see your timeline visualization here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline header with hours */}
              <div className="relative" style={{ height: '40px' }}>
                <div 
                  className="relative bg-muted/20 h-full rounded-t-lg border-b overflow-hidden"
                  style={{ width: Math.max(800, timelineGrid.totalWidth) }}
                >
                  {timelineHours.map((hour, index) => (
                    <div
                      key={hour.getTime()}
                      className="absolute top-0 h-full border-l border-border/20 flex items-center px-2 text-xs text-muted-foreground"
                      style={{ 
                        left: index * timelineGrid.pixelsPerHour,
                        width: timelineGrid.pixelsPerHour 
                      }}
                    >
                      {format}
                    </div>
                  ))}
                  
                  {/* Current time indicator */}
                  {(() => {
                    const currentOffsetMinutes = differenceInMinutes(currentTime, timelineGrid.startDate)
                    if (currentOffsetMinutes >= 0 && currentOffsetMinutes <= differenceInMinutes(timelineGrid.endDate, timelineGrid.startDate)) {
                      return (
                        <div
                          className="absolute top-0 h-full w-0.5 bg-gray-100 dark:bg-gray-8000 z-20"
                          style={{ 
                            left: (currentOffsetMinutes / 60) * timelineGrid.pixelsPerHour 
                          }}
                        >
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-gray-100 dark:bg-gray-8000 rounded-full" />
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              {/* Resource lanes */}
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {resourceGroups.map(({ resourceKey, resourceType, resourceId, slots }) => (
                    <div key={resourceKey} className="relative">
                      {/* Resource label */}
                      <div className="flex items-center gap-2 mb-1">
                        {resourceType === 'oven' && <Oven className="h-4 w-4" />}
                        {resourceType === 'mixer' && <ChefHat className="h-4 w-4" />}
                        {resourceType === 'decorator' && <Package className="h-4 w-4" />}
                        {resourceType === 'packaging' && <Package className="h-4 w-4" />}
                        
                        <span className="text-sm font-medium capitalize">
                          {resourceType} {resourceId.split('T')[1]}
                        </span>
                      </div>

                      {/* Resource timeline lane */}
                      <div 
                        className="relative bg-muted/10 h-12 rounded border"
                        style={{ width: Math.max(800, timelineGrid.totalWidth) }}
                      >
                        {/* Hour grid lines */}
                        {timelineHours.map((_, index) => (
                          <div
                            key={index}
                            className="absolute top-0 h-full border-l border-border/10"
                            style={{ left: index * timelineGrid.pixelsPerHour }}
                          />
                        ))}

                        {/* Production batches */}
                        {slots.map((slot) => {
                          const batch = schedulingResult.schedule.find(b => b.id === slot.batch_id)
                          if (!batch) return null

                          const position = calculateBatchPosition(batch)
                          if (!position) return null

                          return (
                            <Tooltip key={slot.batch_id}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`absolute top-1 h-10 rounded cursor-pointer border-2 transition-all duration-200 ${
                                    STATUS_COLORS[batch.status]
                                  } ${
                                    selectedBatch === batch.id 
                                      ? 'border-primary  scale-105' 
                                      : 'border-transparent hover:border-primary/50'
                                  }`}
                                  style={{
                                    left: position.left,
                                    width: position.width
                                  }}
                                  onClick={() => handleBatchClick(batch)}
                                >
                                  <div className="flex items-center justify-between h-full px-2 text-xs text-white font-medium">
                                    <span className="truncate">
                                      {batch.recipe_name}
                                    </span>
                                    <span className="ml-1">
                                      {batch.quantity}
                                    </span>
                                  </div>

                                  {/* Status indicator */}
                                  <div className="absolute -top-1 -right-1">
                                    {batch.status === 'completed' && (
                                      <CheckCircle className="h-3 w-3 text-gray-600 dark:text-gray-400 bg-white rounded-full" />
                                    )}
                                    {batch.status === 'in_progress' && (
                                      <Play className="h-3 w-3 text-gray-600 dark:text-gray-400 bg-white rounded-full" />
                                    )}
                                    {batch.status === 'blocked' && (
                                      <AlertTriangle className="h-3 w-3 text-gray-600 dark:text-gray-400 bg-white rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <div className="font-semibold">{batch.recipe_name}</div>
                                  <div className="text-xs space-y-1">
                                    <div>Quantity: {batch.quantity}</div>
                                    <div>Priority: {batch.priority}/10</div>
                                    <div>Duration: {batch.estimated_duration} min</div>
                                    <div>Status: <Badge variant="outline" className="text-xs">{batch.status}</Badge></div>
                                    <div>Start: {format, 'HH:mm')}</div>
                                    <div>End: {format, 'HH:mm')}</div>
                                  </div>
                                  
                                  {/* Quick actions */}
                                  <div className="flex gap-1 pt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleStatusToggle(batch)
                                      }}
                                    >
                                      {batch.status === 'scheduled' ? 'Start' : 
                                       batch.status === 'in_progress' ? 'Complete' : 'Reset'}
                                    </Button>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Timeline legend */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded" />
                  <span>Scheduled</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-8000 rounded" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 dark:bg-gray-8000 rounded" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-300 rounded" />
                  <span>Blocked</span>
                </div>
                
                <Separator orientation="vertical" className="h-4" />
                
                <div className="flex items-center gap-2">
                  <Oven className="h-4 w-4 text-orange-500" />
                  <span>Oven</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span>Mixer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span>Decorator</span>
                </div>
              </div>

              {/* Warnings and suggestions */}
              {schedulingResult.warnings.length > 0 && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Scheduling Warnings
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {schedulingResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
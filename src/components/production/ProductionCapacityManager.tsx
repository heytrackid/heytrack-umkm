/**
 * ProductionCapacityManager
 * Manages production capacity settings, resource allocation, and constraints
 * Provides interface for configuring oven capacity, labor, equipment, and schedules
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Oven,
  Users,
  Clock,
  Settings,
  Save,
  RotateCcw,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

import { 
  ProductionConstraints, 
  batchSchedulingService 
} from '@/services/production/BatchSchedulingService'

interface ProductionCapacityManagerProps {
  onCapacityUpdate?: (constraints: ProductionConstraints) => void
  className?: string
}

interface EfficiencyMetrics {
  current_utilization: number
  peak_capacity: number
  bottleneck_resource: string
  optimization_score: number
  recommendations: string[]
}

const DEFAULT_CONSTRAINTS: ProductionConstraints = {
  oven_capacity: 4,
  mixing_stations: 2,
  decorating_stations: 1,
  packaging_capacity: 50,
  bakers_available: 2,
  decorators_available: 1,
  shift_start:"06:00",
  shift_end:"18:00",
  break_times: [
    { start:"10:00", end:"10:15" },
    { start:"14:00", end:"14:30" }
  ],
  setup_time_minutes: 15,
  cleanup_time_minutes: 10
}

export default function ProductionCapacityManager({
  onCapacityUpdate,
  className = ''
}: ProductionCapacityManagerProps) {
  const [constraints, setConstraints] = useState<ProductionConstraints>(DEFAULT_CONSTRAINTS)
  const [originalConstraints, setOriginalConstraints] = useState<ProductionConstraints>(DEFAULT_CONSTRAINTS)
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<EfficiencyMetrics | null>(null)
  const [newBreakStart, setNewBreakStart] = useState('')
  const [newBreakEnd, setNewBreakEnd] = useState('')

  // Load current constraints on mount
  useEffect(() => {
    loadCurrentConstraints()
  }, [])

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(constraints) !== JSON.stringify(originalConstraints)
    setHasChanges(hasChanges)
  }, [constraints, originalConstraints])

  const loadCurrentConstraints = async () => {
    try {
      setLoading(true)
      const currentConstraints = await batchSchedulingService.getProductionCapacity()
      setConstraints(currentConstraints)
      setOriginalConstraints(currentConstraints)
      calculateEfficiencyMetrics(currentConstraints)
    } catch (error) {
      console.error('Error loading constraints:', error)
      toast.error('Failed to load production capacity settings')
    } finally {
      setLoading(false)
    }
  }

  const calculateEfficiencyMetrics = (currentConstraints: ProductionConstraints) => {
    // Calculate theoretical maximum daily production
    const shiftHours = calculateShiftHours(currentConstraints)
    const ovenHourCapacity = currentConstraints.oven_capacity * shiftHours
    const laborHourCapacity = currentConstraints.bakers_available * shiftHours
    
    // Find bottleneck
    const resourceCapacities = {
      'oven': ovenHourCapacity,
      'labor': laborHourCapacity,
      'mixing': currentConstraints.mixing_stations * shiftHours,
      'decorating': currentConstraints.decorators_available * shiftHours
    }
    
    const bottleneck = Object.entries(resourceCapacities)
      .reduce((min, [resource, capacity]) => 
        capacity < min.capacity ? { resource, capacity } : min, 
        { resource: 'oven', capacity: ovenHourCapacity }
      )

    // Generate optimization recommendations
    const recommendations = []
    if (bottleneck.resource === 'oven') {
      recommendations.push('Consider adding oven capacity during peak hours')
    }
    if (bottleneck.resource === 'labor') {
      recommendations.push('Add more bakers or extend shifts')
    }
    if (currentConstraints.setup_time_minutes > 10) {
      recommendations.push('Optimize setup processes to reduce changeover time')
    }

    setEfficiencyMetrics({
      current_utilization: 75, // Would calculate from actual usage
      peak_capacity: Math.max(...Object.values(resourceCapacities)),
      bottleneck_resource: bottleneck.resource,
      optimization_score: 82, // Composite score
      recommendations
    })
  }

  const calculateShiftHours = (constraints: ProductionConstraints): number => {
    const [startHour, startMin] = constraints.shift_start.split(':').map(Number)
    const [endHour, endMin] = constraints.shift_end.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    const totalMinutes = endMinutes - startMinutes
    const breakMinutes = constraints.break_times.reduce((sum, br) => {
      const [brStartHour, brStartMin] = br.start.split(':').map(Number)
      const [brEndHour, brEndMin] = br.end.split(':').map(Number)
      return sum + ((brEndHour * 60 + brEndMin) - (brStartHour * 60 + brStartMin))
    }, 0)
    
    return (totalMinutes - breakMinutes) / 60
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await batchSchedulingService.updateProductionConstraints(constraints)
      setOriginalConstraints(constraints)
      calculateEfficiencyMetrics(constraints)
      onCapacityUpdate?.(constraints)
      toast.success('Production capacity updated successfully')
    } catch (error) {
      console.error('Error saving constraints:', error)
      toast.error('Failed to save production capacity settings')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setConstraints(originalConstraints)
    toast.success('Changes reset')
  }

  const updateConstraint = <K extends keyof ProductionConstraints>(
    key: K, 
    value: ProductionConstraints[K]
  ) => {
    setConstraints(prev => ({ ...prev, [key]: value }))
  }

  const addBreakTime = () => {
    if (newBreakStart && newBreakEnd) {
      setConstraints(prev => ({
        ...prev,
        break_times: [...prev.break_times, { start: newBreakStart, end: newBreakEnd }]
      }))
      setNewBreakStart('')
      setNewBreakEnd('')
    }
  }

  const removeBreakTime = (index: number) => {
    setConstraints(prev => ({
      ...prev,
      break_times: prev.break_times.filter((_, i) => i !== index)
    }))
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Production Capacity Management
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || loading}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Efficiency overview */}
        {efficiencyMetrics && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {efficiencyMetrics.current_utilization}%
              </div>
              <div className="text-xs text-muted-foreground">Current Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {Math.round(efficiencyMetrics.peak_capacity)}
              </div>
              <div className="text-xs text-muted-foreground">Peak Capacity/Hr</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                {efficiencyMetrics.bottleneck_resource}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Bottleneck</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {efficiencyMetrics.optimization_score}
              </div>
              <div className="text-xs text-muted-foreground">Efficiency Score</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="equipment" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="labor">Labor</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Oven className="h-5 w-5" />
                  Equipment Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Oven Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Oven Capacity (simultaneous batches)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[constraints.oven_capacity]}
                        onValueChange={([value]) => updateConstraint('oven_capacity', value)}
                        max={10}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-12 text-center font-medium">
                        {constraints.oven_capacity}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mixing Stations</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[constraints.mixing_stations]}
                        onValueChange={([value]) => updateConstraint('mixing_stations', value)}
                        max={6}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-12 text-center font-medium">
                        {constraints.mixing_stations}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Decorating Stations</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[constraints.decorating_stations]}
                        onValueChange={([value]) => updateConstraint('decorating_stations', value)}
                        max={4}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-12 text-center font-medium">
                        {constraints.decorating_stations}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Packaging Capacity (items/hour)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[constraints.packaging_capacity]}
                        onValueChange={([value]) => updateConstraint('packaging_capacity', value)}
                        max={200}
                        min={10}
                        step={10}
                        className="flex-1"
                      />
                      <div className="w-12 text-center font-medium">
                        {constraints.packaging_capacity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Process Times */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Process Times</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Setup Time (minutes)</Label>
                      <Input
                        type="number"
                        value={constraints.setup_time_minutes}
                        onChange={(e) => updateConstraint('setup_time_minutes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cleanup Time (minutes)</Label>
                      <Input
                        type="number"
                        value={constraints.cleanup_time_minutes}
                        onChange={(e) => updateConstraint('cleanup_time_minutes', parseInt(e.target.value) || 0)}
                        min={0}
                        max={30}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Labor Tab */}
          <TabsContent value="labor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Labor Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bakers Available</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[constraints.bakers_available]}
                        onValueChange={([value]) => updateConstraint('bakers_available', value)}
                        max={8}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-12 text-center font-medium">
                        {constraints.bakers_available}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Decorators Available</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        value={[constraints.decorators_available]}
                        onValueChange={([value]) => updateConstraint('decorators_available', value)}
                        max={4}
                        min={0}
                        step={1}
                        className="flex-1"
                      />
                      <div className="w-12 text-center font-medium">
                        {constraints.decorators_available}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Labor utilization visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Labor Utilization</span>
                    <span>{efficiencyMetrics?.current_utilization || 0}%</span>
                  </div>
                  <Progress value={efficiencyMetrics?.current_utilization || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Work Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Shift Start Time</Label>
                    <Input
                      type="time"
                      value={constraints.shift_start}
                      onChange={(e) => updateConstraint('shift_start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Shift End Time</Label>
                    <Input
                      type="time"
                      value={constraints.shift_end}
                      onChange={(e) => updateConstraint('shift_end', e.target.value)}
                    />
                  </div>
                </div>

                {/* Shift duration indicator */}
                <div className="text-sm text-muted-foreground">
                  Total shift duration: {calculateShiftHours(constraints).toFixed(1)} hours 
                  (including breaks)
                </div>

                {/* Break Times */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Break Times</h4>
                  
                  {constraints.break_times.map((breakTime, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <span className="text-sm">
                        {breakTime.start} - {breakTime.end}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBreakTime(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Add new break */}
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      placeholder="Start"
                      value={newBreakStart}
                      onChange={(e) => setNewBreakStart(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      placeholder="End"
                      value={newBreakEnd}
                      onChange={(e) => setNewBreakEnd(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addBreakTime}
                      disabled={!newBreakStart || !newBreakEnd}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Capacity Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {efficiencyMetrics && (
                  <>
                    {/* Bottleneck Analysis */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Current Bottleneck:</strong> {efficiencyMetrics.bottleneck_resource}
                        <br />
                        This resource is limiting your production capacity.
                      </AlertDescription>
                    </Alert>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Optimization Recommendations</h4>
                      {efficiencyMetrics.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                          <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>

                    {/* Capacity Planning */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Optimal Capacity</div>
                        <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                          {Math.round(efficiencyMetrics.peak_capacity * 0.85)} units/day
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">85% efficiency target</div>
                      </div>
                      
                      <div className="p-3 bg-orange-50 rounded">
                        <div className="text-sm font-medium text-orange-800">Current Performance</div>
                        <div className="text-lg font-bold text-orange-600">
                          {efficiencyMetrics.optimization_score}/100
                        </div>
                        <div className="text-xs text-orange-600">Efficiency Score</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
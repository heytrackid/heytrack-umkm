/**
 * EnhancedProductionPlanningDashboard
 * Advanced production planning dashboard with batch scheduling, timeline visualization,
 * capacity management, real-time order integration, and batch execution control
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar,
  TrendingUp,
  Users,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Settings,
  Play,
  Zap
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import all our new production components
import ProductionTimeline from './ProductionTimeline'
import ProductionCapacityManager from './ProductionCapacityManager'
import ProductionBatchExecution from './ProductionBatchExecution'

// Import services
import { 
  ProductionBatch, 
  SchedulingResult,
  ProductionConstraints,
  batchSchedulingService 
} from '@/services/production/BatchSchedulingService'
import { 
  productionDataIntegration,
  ProductionDemand 
} from '@/services/production/ProductionDataIntegration'

interface EnhancedProductionPlanningDashboardProps {
  className?: string
}

export default function EnhancedProductionPlanningDashboard({
  className = ''
}: EnhancedProductionPlanningDashboardProps) {
  // Core state
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null)
  const [productionDemand, setProductionDemand] = useState<ProductionDemand | null>(null)
  const [constraints, setConstraints] = useState<ProductionConstraints | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Load initial data on mount
  useEffect(() => {
    loadProductionData()
  }, [])

  const loadProductionData = async () => {
    try {
      setLoading(true)
      
      // Load production demand from orders
      const demand = await productionDataIntegration.getCurrentProductionDemand(3)
      setProductionDemand(demand)

      // Load current constraints
      const currentConstraints = await batchSchedulingService.getProductionCapacity()
      setConstraints(currentConstraints)

      // Generate optimized schedule
      const schedule = await productionDataIntegration.generateProductionSchedule(3)
      setSchedulingResul""

      toast.success('Production data loaded successfully')
    } catch (error) {
      console.error('Error loading production data:', error)
      toast.error('Failed to load production data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshSchedule = async () => {
    await loadProductionData()
  }

  const handleCapacityUpdate = async (newConstraints: ProductionConstraints) => {
    setConstraints(newConstraints)
    
    // Regenerate schedule with new constraints
    if (productionDemand) {
      try {
        const batches = await productionDataIntegration.convertOrdersToBatches(productionDemand.orders)
        const newSchedule = await batchSchedulingService.scheduleProductionBatches(batches, newConstraints)
        setSchedulingResul""
      } catch (error) {
        console.error('Error updating schedule:', error)
      }
    }
  }

  const handleBatchStatusUpdate = async (batchId: string, status: ProductionBatch['status'], notes?: string) => {
    if (!schedulingResult) return

    try {
      // Update batch status in scheduling result
      const updatedSchedule = {
        ...schedulingResult,
        schedule: schedulingResult.schedule.map(batch => 
          batch.id === batchId ? { ...batch, status } : batch
        )
      }
      setSchedulingResul""

      // Update in data integration service
      await productionDataIntegration.updateProductionProgress(batchId, status)

      toast.success(`Batch status updated to ${status}`)
    } catch (error) {
      console.error('Error updating batch status:', error)
      toast.error('Failed to update batch status')
    }
  }

  // Calculate dashboard metrics
  const dashboardMetrics = {
    totalOrders: productionDemand?.orders.length || 0,
    urgentOrders: productionDemand?.urgentOrders.length || 0,
    totalBatches: schedulingResult?.schedule.length || 0,
    activeBatches: schedulingResult?.schedule.filter(b => b.status === 'in_progress').length || 0,
    completedBatches: schedulingResult?.schedule.filter(b => b.status === 'completed').length || 0,
    ovenUtilization: Math.round(schedulingResult?.resource_utilization.oven_utilization || 0),
    onTimeDelivery: Math.round(schedulingResult?.optimization_metrics.on_time_delivery_rate || 0)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Planning</h1>
          <p className="text-muted-foreground">
            Advanced production scheduling with batch optimization and real-time monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefreshSchedule}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            onClick={() => setActiveTab('capacity')}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{dashboardMetrics.totalOrders}</div>
            <div className="text-xs text-muted-foreground">Active Orders</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{dashboardMetrics.urgentOrders}</div>
            <div className="text-xs text-muted-foreground">Urgent Orders</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{dashboardMetrics.totalBatches}</div>
            <div className="text-xs text-muted-foreground">Scheduled Batches</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{dashboardMetrics.activeBatches}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{dashboardMetrics.completedBatches}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{dashboardMetrics.ovenUtilization}%</div>
            <div className="text-xs text-muted-foreground">Oven Utilization</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{dashboardMetrics.onTimeDelivery}%</div>
            <div className="text-xs text-muted-foreground">On-Time Delivery</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Warnings */}
      {(schedulingResult?.warnings.length || 0) > 0 && (
        <Alert className="border-yellow-200 bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Production Alerts</div>
            <ul className="text-sm space-y-1">
              {schedulingResult?.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Resource Constraints Warnings */}
      {productionDemand?.resourceConstraints.ingredient_shortfalls.length ? (
        <Alert className="border-red-200 bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">Inventory Shortfalls</div>
            <ul className="text-sm space-y-1">
              {productionDemand.resourceConstraints.ingredient_shortfalls.map((shortfall, index) => (
                <li key={index}>
                  • {shortfall.ingredient_name}: {shortfall.shortage} units short
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="execution">Batch Control</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Production Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Production Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {schedulingResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="text-lg font-bold text-blue-700">
                          {schedulingResult.optimization_metrics.total_profit.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Profit Score</div>
                      </div>
                      <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="text-lg font-bold text-green-700">
                          {schedulingResult.optimization_metrics.resource_efficiency}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Resource Efficiency</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Schedule Optimization</span>
                        <span>{schedulingResult.constraints_satisfied ? 'Optimized' : 'Constrained'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Setup Time Waste</span>
                        <span>{schedulingResult.optimization_metrics.setup_time_waste} minutes</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Generate schedule to see summary</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demand Forecast */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Demand Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productionDemand ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <div className="text-lg font-bold text-orange-700">
                          {productionDemand.forecastedDemand.next_24h}
                        </div>
                        <div className="text-xs text-orange-600">Next 24 Hours</div>
                      </div>
                      <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded">
                        <div className="text-lg font-bold text-purple-700">
                          {productionDemand.forecastedDemand.next_week}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Next Week</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Total Active Orders:</span>
                        <span>{productionDemand.orders.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority Orders:</span>
                        <span>{productionDemand.urgentOrders.length}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Loading demand forecast...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Optimization Suggestions */}
          {schedulingResult?.suggestions.length ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Optimization Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {schedulingResult.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                      <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <ProductionTimeline
            schedulingResult={schedulingResult}
            onBatchSelect={setSelectedBatch}
            onBatchStatusChange={handleBatchStatusUpdate}
          />
        </TabsContent>

        {/* Batch Execution Tab */}
        <TabsContent value="execution">
          {schedulingResult && (
            <ProductionBatchExecution
              batches={schedulingResult.schedule}
              onBatchUpdate={handleBatchStatusUpdate}
              onBatchSelect={setSelectedBatch}
            />
          )}
        </TabsContent>

        {/* Capacity Management Tab */}
        <TabsContent value="capacity">
          <ProductionCapacityManager
            onCapacityUpdate={handleCapacityUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
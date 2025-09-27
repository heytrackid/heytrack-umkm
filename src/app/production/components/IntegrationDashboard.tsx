// Production-Orders Integration Dashboard Component
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Play, 
  Pause, 
  Calendar, 
  Clock, 
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Settings,
  RefreshCw,
  ShoppingCart,
  Factory
} from 'lucide-react'

import { useProductionOrdersIntegration } from '../hooks/use-production-orders-integration'
import { formatCurrency } from '@/lib/utils'

interface IntegrationDashboardProps {
  className?: string
}

export function IntegrationDashboard({ className }: IntegrationDashboardProps) {
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

  const {
    isLoading,
    isScheduling,
    schedulingResult,
    error,
    pendingOrders,
    availableIngredients,
    orders,
    batches,
    deliveryTimelines,
    integrationStats,
    isAutoScheduleDue,
    config,
    scheduleProduction,
    clearSchedulingResult,
    updateConfig
  } = useProductionOrdersIntegration()

  const handleScheduleProduction = async () => {
    const orderIds = selectedOrders.length > 0 ? selectedOrders : undefined
    await scheduleProduction(orderIds)
  }

  const handleToggleAutoSchedule = (enabled: boolean) => {
    updateConfig({ auto_schedule_enabled: enabled })
  }

  const handleConfigUpdate = (newConfig: any) => {
    updateConfig(newConfig)
    setConfigDialogOpen(false)
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production-Orders Integration</h2>
          <p className="text-muted-foreground">
            Automated production scheduling based on customer orders
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <ConfigurationDialog 
                config={config} 
                onUpdate={handleConfigUpdate}
                onClose={() => setConfigDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleScheduleProduction}
            disabled={isScheduling || pendingOrders.length === 0}
            className="min-w-32"
          >
            {isScheduling ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Schedule Production
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auto-Schedule Status */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Auto-Scheduling Status</CardTitle>
          <Switch 
            checked={config.auto_schedule_enabled} 
            onCheckedChange={handleToggleAutoSchedule}
          />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {config.auto_schedule_enabled ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Auto-scheduling is enabled</span>
                {isAutoScheduleDue && (
                  <Badge variant="secondary">Scheduling due</Badge>
                )}
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Auto-scheduling is disabled</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.totalPendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Ready for production scheduling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.totalActiveBatches}</div>
            <p className="text-xs text-muted-foreground">
              Currently in production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Deliveries</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrationStats.onTimeDeliveries}
            </div>
            <p className="text-xs text-muted-foreground">
              Expected to deliver on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At-Risk Deliveries</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {integrationStats.atRiskDeliveries}
            </div>
            <p className="text-xs text-muted-foreground">
              May miss delivery deadline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Pending Orders</TabsTrigger>
          <TabsTrigger value="batches">Production Batches</TabsTrigger>
          <TabsTrigger value="ingredients">Ingredient Status</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling Results</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <PendingOrdersList 
            orders={pendingOrders}
            selectedOrders={selectedOrders}
            onSelectionChange={setSelectedOrders}
            deliveryTimelines={deliveryTimelines}
          />
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <ProductionBatchesList batches={batches} />
        </TabsContent>

        <TabsContent value="ingredients" className="space-y-4">
          <IngredientStatusList ingredients={availableIngredients} />
        </TabsContent>

        <TabsContent value="scheduling" className="space-y-4">
          <SchedulingResultsView 
            result={schedulingResult}
            onClear={clearSchedulingResult}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Configuration Dialog Component
interface ConfigurationDialogProps {
  config: any
  onUpdate: (config: any) => void
  onClose: () => void
}

function ConfigurationDialog({ config, onUpdate, onClose }: ConfigurationDialogProps) {
  const [localConfig, setLocalConfig] = useState(config)

  const handleSave = () => {
    onUpdate(localConfig)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Integration Configuration</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-schedule">Auto-scheduling</Label>
          <Switch
            id="auto-schedule"
            checked={localConfig.auto_schedule_enabled}
            onCheckedChange={(checked) =>
              setLocalConfig({ ...localConfig, auto_schedule_enabled: checked })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="buffer-hours">Schedule Buffer (Hours)</Label>
          <Input
            id="buffer-hours"
            type="number"
            value={localConfig.schedule_buffer_hours}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, schedule_buffer_hours: parseInt(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-batches">Max Batches per Day</Label>
          <Input
            id="max-batches"
            type="number"
            value={localConfig.max_batches_per_day}
            onChange={(e) =>
              setLocalConfig({ ...localConfig, max_batches_per_day: parseInt(e.target.value) })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch-strategy">Batch Size Strategy</Label>
          <Select
            value={localConfig.batch_size_strategy}
            onValueChange={(value) =>
              setLocalConfig({ ...localConfig, batch_size_strategy: value })
            }
          >
            <SelectTrigger id="batch-strategy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Size</SelectItem>
              <SelectItem value="optimal">Optimal Size</SelectItem>
              <SelectItem value="order_based">Order Based</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </>
  )
}

// Pending Orders List Component
interface PendingOrdersListProps {
  orders: any[]
  selectedOrders: string[]
  onSelectionChange: (orderIds: string[]) => void
  deliveryTimelines: any[]
}

function PendingOrdersList({ 
  orders, 
  selectedOrders, 
  onSelectionChange,
  deliveryTimelines 
}: PendingOrdersListProps) {
  const toggleOrderSelection = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      onSelectionChange(selectedOrders.filter(id => id !== orderId))
    } else {
      onSelectionChange([...selectedOrders, orderId])
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'rush': return 'destructive'
      case 'urgent': return 'secondary' 
      case 'high': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Orders ({orders.length})</CardTitle>
        <CardDescription>
          Orders ready for production scheduling
        </CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No pending orders for production
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map(order => {
              const timeline = deliveryTimelines.find(t => t.order_id === order.id)
              const isSelected = selectedOrders.includes(order.id)
              
              return (
                <div
                  key={order.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleOrderSelection(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">#{order.order_number}</span>
                        <Badge variant={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Customer: {order.customer?.name || 'Unknown'}
                      </div>
                      <div className="text-sm">
                        Items: {order.items?.length || 0} | 
                        Total: {formatCurrency(order.total_amount, order.currency)}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'No date'}
                      </div>
                      {timeline && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className={
                            timeline.on_time_probability > 0.8 
                              ? 'text-green-600' 
                              : timeline.on_time_probability < 0.5 
                                ? 'text-red-600' 
                                : 'text-orange-600'
                          }>
                            {Math.round(timeline.on_time_probability * 100)}% on-time
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Production Batches List Component
function ProductionBatchesList({ batches }: { batches: any[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'secondary'
      case 'ingredients_ready': return 'outline'
      case 'in_progress': return 'default'
      case 'completed': return 'default'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Production Batches ({batches.length})</CardTitle>
        <CardDescription>
          Currently scheduled and in-progress batches
        </CardDescription>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No active production batches
          </p>
        ) : (
          <div className="space-y-2">
            {batches.map(batch => (
              <div key={batch.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{batch.batch_number}</span>
                      <Badge variant={getStatusColor(batch.status)}>
                        {batch.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Recipe: {batch.recipe_name}
                    </div>
                    <div className="text-sm">
                      Quantity: {batch.batch_size} | 
                      Cost: {formatCurrency(batch.planned_cost, batch.currency)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">
                      Start: {new Date(batch.scheduled_start).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Complete: {new Date(batch.scheduled_completion).toLocaleDateString()}
                    </div>
                    {batch.order_ids && batch.order_ids.length > 0 && (
                      <div className="text-sm">
                        Orders: {batch.order_ids.length}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Ingredient Status List Component
function IngredientStatusList({ ingredients }: { ingredients: any[] }) {
  const criticalIngredients = ingredients.filter(ing => 
    ing.available_stock <= ing.reorder_point
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ingredient Availability</CardTitle>
        <CardDescription>
          Current stock levels and availability for production
        </CardDescription>
      </CardHeader>
      <CardContent>
        {criticalIngredients.length > 0 && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {criticalIngredients.length} ingredient(s) need restocking
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          {ingredients.slice(0, 10).map(ingredient => {
            const stockPercentage = Math.min(100, 
              (ingredient.available_stock / Math.max(ingredient.reorder_point * 2, 1)) * 100
            )
            const isLow = ingredient.available_stock <= ingredient.reorder_point
            
            return (
              <div key={ingredient.ingredient_id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{ingredient.ingredient_name}</span>
                  <div className="text-sm text-muted-foreground">
                    {ingredient.available_stock} {ingredient.unit} available
                  </div>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={stockPercentage}
                    className={`h-2 ${isLow ? 'text-red-500' : ''}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Reorder at: {ingredient.reorder_point} {ingredient.unit}</span>
                    {isLow && <span className="text-red-500">LOW STOCK</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Scheduling Results View Component
function SchedulingResultsView({ 
  result, 
  onClear 
}: { 
  result: any | null
  onClear: () => void 
}) {
  if (!result) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No scheduling results available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Latest Scheduling Results</CardTitle>
            <CardDescription>
              {result.success ? 'Successful' : 'Failed'} scheduling run
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClear}>
            Clear Results
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result.created_batches.length}
              </div>
              <p className="text-sm text-muted-foreground">Batches Created</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {result.skipped_orders.length}
              </div>
              <p className="text-sm text-muted-foreground">Orders Skipped</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatCurrency(result.total_cost, 'IDR')}
              </div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
            </div>
          </div>

          {result.capacity_warnings.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Capacity Warnings:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {result.capacity_warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {result.ingredient_issues.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Ingredient Issues:</strong>
                <ul className="mt-1 list-disc list-inside">
                  {result.ingredient_issues.map((issue: any, index: number) => (
                    <li key={index}>
                      {issue.ingredient_name}: Short by {issue.shortage} {issue.unit || 'units'}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default IntegrationDashboard
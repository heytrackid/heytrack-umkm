'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Factory,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Zap,
  Target,
  BarChart3,
  Package,
  Users,
  Timer,
  PlayCircle,
  PauseCircle,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import { automationEngine } from '@/lib/automation-engine'
import { RecipeWithIngredients, Ingredient } from '@/types/database'

interface ProductionOrder {
  id: string
  recipe_id: string
  quantity: number
  delivery_date: string
  customer_name?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed'
}

interface SmartProductionPlannerProps {
  orders: ProductionOrder[]
  recipes: RecipeWithIngredients[]
  inventory: Ingredient[]
  onScheduleProduction?: (plan: any) => void
  onStartProduction?: (orderId: string) => void
}

export default function SmartProductionPlanner({ 
  orders, 
  recipes, 
  inventory,
  onScheduleProduction,
  onStartProduction
}: SmartProductionPlannerProps) {
  const [productionPlan, setProductionPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [autoOptimize, setAutoOptimize] = useState(true)

  useEffect(() => {
    if (orders.length > 0 && recipes.length > 0 && inventory.length > 0) {
      generateProductionPlan()
    }
  }, [orders, recipes, inventory, selectedDate])

  const generateProductionPlan = async () => {
    setLoading(true)
    try {
      const orderData = orders.map(order => ({
        recipe_id: order.recipe_id,
        quantity: order.quantity,
        delivery_date: order.delivery_date
      }))

      const plan = automationEngine.generateProductionPlan(orderData, recipes, inventory)
      setProductionPlan(plan)
    } catch (error) {
      console.error('Error generating production plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'secondary'
      case 'normal': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'in_progress': return <PlayCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'scheduled': return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default: return <PauseCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short' 
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Menyusun rencana produksi...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!productionPlan) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada data untuk perencanaan produksi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { plan, summary, optimizations } = productionPlan

  return (
    <div className="space-y-6">
      {/* Production Summary */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Factory className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="text-2xl font-bold">{summary.totalOrders}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.canProduceCount}</div>
            </div>
            <p className="text-xs text-muted-foreground">Ready to Produce</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.blockedCount}</div>
            </div>
            <p className="text-xs text-muted-foreground">Blocked</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{summary.totalBatches}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{summary.efficiency.toFixed(0)}%</div>
            </div>
            <p className="text-xs text-muted-foreground">Efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {optimizations && optimizations.alerts && optimizations.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Critical Production Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {optimizations.alerts.map((alert: any, index: number) => (
                <Alert key={index} className="border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription>
                    <div className="font-medium">{alert.title}</div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    {alert.suggestion && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                        <Lightbulb className="h-4 w-4 inline mr-1" />
                        <strong>Suggestion:</strong> {alert.suggestion}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Smart Production Timeline
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Optimized production schedule based on delivery dates and resource availability
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline">
            <TabsList>
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="orders">Orders View</TabsTrigger>
              <TabsTrigger value="resources">Resource View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="space-y-4">
              {plan && plan.schedule && Object.entries(plan.schedule).map(([date, dayPlan]: [string, any]) => (
                <div key={date} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{formatDate(new Date(date))}</h4>
                    <Badge variant="outline">
                      {dayPlan.batches?.length || 0} batches
                    </Badge>
                  </div>
                  
                  {dayPlan.batches && dayPlan.batches.length > 0 ? (
                    <div className="space-y-2">
                      {dayPlan.batches.map((batch: any, batchIndex: number) => {
                        const recipe = recipes.find(r => r.id === batch.recipe_id)
                        return (
                          <div key={batchIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(batch.status)}
                              <div>
                                <p className="font-medium">{recipe?.name || 'Unknown Recipe'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {batch.quantity} portions • {formatTime(new Date(batch.startTime))} - {formatTime(new Date(batch.endTime))}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getPriorityColor(batch.priority)}>
                                {batch.priority}
                              </Badge>
                              {batch.status === 'scheduled' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => onStartProduction && onStartProduction(batch.orderId)}
                                >
                                  <PlayCircle className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No production scheduled</p>
                  )}
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              {orders.map(order => {
                const recipe = recipes.find(r => r.id === order.recipe_id)
                const orderPlan = plan.orderStatus?.[order.id]
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{recipe?.name}</h4>
                          <Badge variant={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.quantity} portions • Delivery: {formatDate(new Date(order.delivery_date))}
                          {order.customer_name && ` • ${order.customer_name}`}
                        </p>
                        {orderPlan?.canProduce === false && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            ⚠️ {orderPlan.reason}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {orderPlan?.scheduledDate && (
                        <p className="text-sm font-medium">
                          Scheduled: {formatDate(new Date(orderPlan.scheduledDate))}
                        </p>
                      )}
                      {orderPlan?.estimatedTime && (
                        <p className="text-sm text-muted-foreground">
                          Est. {orderPlan.estimatedTime} hours
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </TabsContent>
            
            <TabsContent value="resources">
              <div className="space-y-4">
                {optimizations?.resourceUtilization && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ingredient Usage</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {Object.entries(optimizations.resourceUtilization.ingredients || {}).map(([ingredientId, usage]: [string, any]) => {
                          const ingredient = inventory.find(i => i.id === ingredientId)
                          const utilizationPercent = ((usage.needed / usage.available) * 100)
                          
                          return (
                            <div key={ingredientId} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{ingredient?.name || 'Unknown'}</span>
                                <span className="text-sm text-muted-foreground">
                                  {usage.needed.toFixed(1)} / {usage.available.toFixed(1)} {ingredient?.unit}
                                </span>
                              </div>
                              <Progress 
                                value={Math.min(utilizationPercent, 100)}
                                className={`h-2 ${utilizationPercent > 90 ? 'bg-gray-100 dark:bg-gray-800' : utilizationPercent > 70 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800'}`}
                              />
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Production Capacity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Daily Capacity Utilization</span>
                            <span className="font-bold">
                              {optimizations.capacityUtilization?.toFixed(1) || 0}%
                            </span>
                          </div>
                          <Progress 
                            value={optimizations.capacityUtilization || 0}
                            className="h-3"
                          />
                          <div className="text-sm text-muted-foreground">
                            Peak hours: {optimizations.peakHours || 'N/A'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={generateProductionPlan} disabled={loading}>
          <Zap className="h-4 w-4 mr-2" />
          Regenerate Plan
        </Button>
        <Button 
          variant="outline"
          onClick={() => onScheduleProduction && onScheduleProduction(productionPlan)}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Production
        </Button>
      </div>
    </div>
  )
}
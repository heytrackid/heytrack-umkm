'use client'
import * as React from 'react'

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
import { RecipeWithIngredients, Ingredient } from '@/types'

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
  onScheduleProduction?: (plan: unknown) => void
  onStartProduction?: (orderId: string) => void
}

export function SmartProductionPlanner({ 
  orders, 
  recipes, 
  inventory,
  onScheduleProduction,
  onStartProduction
}: SmartProductionPlannerProps) {
  const [productionPlan, setProductionPlan] = useState<unknown>(null)
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
    } catch (error: unknown) {
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
      {summary.blockedCount > 0 && (
        <Alert className="border-red-200 bg-gray-100 dark:bg-gray-800">
          <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <AlertDescription className="text-red-700">
            <strong>ATTENTION!</strong> {summary.blockedCount} pesanan tidak bisa diproduksi karena kekurangan bahan. 
            Segera lakukan restock atau ubah jadwal.
          </AlertDescription>
        </Alert>
      )}

      {/* Optimizations Alert */}
      {optimizations.length > 0 && (
        <Alert className="border-blue-200 bg-gray-100 dark:bg-gray-800">
          <Lightbulb className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <AlertDescription className="text-blue-700">
            <strong>OPTIMIZATION AVAILABLE!</strong> Ditemukan {optimizations.length} peluang optimasi yang bisa menghemat waktu dan cost produksi.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="schedule">📅 Schedule</TabsTrigger>
          <TabsTrigger value="timeline">⏰ Timeline</TabsTrigger>
          <TabsTrigger value="optimization">⚡ Optimization</TabsTrigger>
          <TabsTrigger value="resources">📦 Resources</TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant={autoOptimize ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAutoOptimize(!autoOptimize)}
              >
                <Zap className="h-4 w-4 mr-1" />
                Auto Optimize
              </Button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
              />
            </div>
            <Button onClick={() => onScheduleProduction?.(productionPlan)}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Apply Schedule
            </Button>
          </div>

          {/* Production Schedule */}
          <div className="space-y-4">
            {plan.map((item: unknown, index: number) => {
              const order = orders.find(o => o.recipe_id === item.recipe.id)
              return (
                <Card key={index} className={`${
                  !item.production.canProduce ? 'border-red-200 bg-gray-100 dark:bg-gray-800' : 
                  new Date(item.deliveryDate) <= new Date(Date.now() + 24*60*60*1000) ? 'border-yellow-200 bg-gray-100 dark:bg-gray-800' : ''
                }`}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(order?.status || 'pending')}
                          <h3 className="font-semibold text-lg">{item.recipe.name}</h3>
                          <Badge variant={getPriorityColor(order?.priority || 'normal')}>
                            {order?.priority || 'normal'}
                          </Badge>
                          {!item.production.canProduce && (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Blocked
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Quantity:</span>
                            <div className="font-medium">{item.quantity} pcs ({item.production.batchCount} batch)</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Delivery:</span>
                            <div className="font-medium">{formatDate(item.deliveryDate)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Start Time:</span>
                            <div className="font-medium">
                              {item.production.canProduce ? formatTime(item.production.startTime) : 'TBD'}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <div className="font-medium">{item.production.estimatedDuration.toFixed(1)} jam</div>
                          </div>
                        </div>

                        {order?.customer_name && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="ml-1 font-medium">{order.customer_name}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {item.production.canProduce ? (
                          <Button 
                            size="sm"
                            onClick={() => onStartProduction?.(order?.id || item.orderId)}
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" disabled>
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Blocked
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Ingredient Status */}
                    {!item.production.canProduce && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-red-200">
                        <div className="font-medium text-red-700 mb-2">Missing Ingredients:</div>
                        <div className="space-y-1">
                          {item.ingredients.requirements
                            .filter((req: unknown) => !req.sufficient)
                            .map((req: unknown, idx: number) => (
                              <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                                • {req.ingredient.name}: Need {req.needed} {req.ingredient.unit}, 
                                have {req.available} {req.ingredient.unit} 
                                (short {req.shortage} {req.ingredient.unit})
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {item.recommendations.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-blue-200">
                        <div className="font-medium text-blue-700 mb-2">Recommendations:</div>
                        <div className="space-y-1">
                          {item.recommendations.map((rec: string, idx: number) => (
                            <div key={idx} className="text-sm text-gray-600 dark:text-gray-400">• {rec}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Production Timeline - {formatDate(new Date(selectedDate))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan
                  .filter((item: unknown) => item.production.canProduce)
                  .sort((a, b) => new Date(a.production.startTime).getTime() - new Date(b.production.startTime).getTime())
                  .map((item: unknown, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="text-center min-w-[80px]">
                        <div className="font-medium">{formatTime(item.production.startTime)}</div>
                        <div className="text-xs text-muted-foreground">Start</div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium">{item.recipe.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} pcs • {item.production.estimatedDuration.toFixed(1)} jam
                        </div>
                        <Progress 
                          value={index === 0 ? 100 : 0} 
                          className="h-2 mt-1" 
                        />
                      </div>

                      <div className="text-center min-w-[80px]">
                        <div className="font-medium">
                          {formatTime(new Date(item.production.startTime.getTime() + item.production.estimatedDuration * 60 * 60 * 1000))}
                        </div>
                        <div className="text-xs text-muted-foreground">Finish</div>
                      </div>

                      <Badge variant={index === 0 ? 'default' : 'outline'}>
                        {index === 0 ? 'Next' : `Queue ${index}`}
                      </Badge>
                    </div>
                  ))}
                
                {plan.filter((item: unknown) => item.production.canProduce).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Timer className="h-12 w-12 mx-auto mb-4" />
                    <p>Tidak ada produksi yang dapat dijadwalkan untuk hari ini</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          {optimizations.map((opt: unknown, index: number) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg mb-2">{opt.suggestion}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{opt.savings}</p>
                    <Badge variant="outline">{opt.type.replace('_', ' ')}</Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {optimizations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-green-700">
                  Production Already Optimized! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Tidak ada saran optimasi untuk jadwal produksi saat ini.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🧑‍🍳 Staff Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Peak Hours (9-12)</span>
                    <Badge variant="secondary">3 staff</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Regular Hours</span>
                    <Badge variant="outline">2 staff</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Hours</span>
                    <span className="font-medium">
                      {plan.reduce((sum: number, item: unknown) => sum + item.production.estimatedDuration, 0).toFixed(1)} jam
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🔥 Equipment Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Oven Utilization</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mixer Usage</span>
                    <div className="flex items-center gap-2">
                      <Progress value={65} className="w-20 h-2" />
                      <span className="text-sm">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Prep Station</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-20 h-2" />
                      <span className="text-sm">90%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📊 Resource Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {plan.filter((item: unknown) => item.production.canProduce).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Orders Ready</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {plan.reduce((sum: number, item: unknown) => sum + item.production.batchCount, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Batches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {plan.reduce((sum: number, item: unknown) => sum + item.production.estimatedDuration, 0).toFixed(1)}h
                  </div>
                  <div className="text-xs text-muted-foreground">Production Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {summary.efficiency.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
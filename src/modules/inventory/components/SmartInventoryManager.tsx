'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  ShoppingCart,
  Bell,
  Zap,
  Target,
  BarChart3,
  CheckCircle,
  Calendar
} from 'lucide-react'
import { StockCalculationService } from '../services/StockCalculationService'
import type { Ingredient, IngredientWithStats } from '../types'

interface SmartInventoryManagerProps {
  ingredients: Ingredient[]
  usageData?: Record<string, number> // ingredient_id -> monthly usage
  onReorderTriggered?: (ingredient: Ingredient, quantity: number) => void
}

export function SmartInventoryManager({ 
  ingredients, 
  usageData = {},
  onReorderTriggered 
}: SmartInventoryManagerProps) {
  const [analysis, setAnalysis] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'critical' | 'low' | 'adequate' | 'overstocked'>('all')

  useEffect(() => {
    if (ingredients.length > 0) {
      analyzeInventory()
    }
  }, [ingredients, usageData])

  const analyzeInventory = async () => {
    setLoading(true)
    try {
      // Use new modular service instead of automation engine
      const inventoryAnalysis = StockCalculationService.analyzeStockLevels(ingredients, [])
      
      // Transform data for existing UI
      const transformedAnalysis = inventoryAnalysis.map(item => ({
        ingredient: item.ingredient,
        status: item.alertLevel,
        daysRemaining: item.daysUntilReorder,
        reorderRecommendation: {
          shouldReorder: item.alertLevel !== 'safe',
          quantity: item.reorderPoint.recommended_order_quantity,
          estimatedCost: item.reorderPoint.recommended_order_quantity * item.ingredient.price_per_unit,
          urgency: item.alertLevel === 'critical' ? 'urgent' : 'soon'
        },
        insights: item.recommendations
      }))
      
      setAnalysis(transformedAnalysis)
    } catch (error) {
      console.error('Error analyzing inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'destructive'
      case 'warning': return 'secondary' 
      case 'overstocked': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />
      case 'warning': return <TrendingDown className="h-4 w-4" />
      case 'overstocked': return <TrendingUp className="h-4 w-4" />
      default: return <CheckCircle className="h-4 w-4" />
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500'
      case 'soon': return 'bg-yellow-500'
      default: return 'bg-green-500'
    }
  }

  const filteredAnalysis = analysis.filter(item => 
    selectedStatus === 'all' || item.status === selectedStatus
  )

  const stats = {
    total: analysis.length,
    critical: analysis.filter(a => a.status === 'critical').length,
    low: analysis.filter(a => a.status === 'warning').length,
    needReorder: analysis.filter(a => a.reorderRecommendation.shouldReorder).length,
    totalValue: analysis.reduce((sum, a) => sum + (a.ingredient.current_stock * a.ingredient.price_per_unit), 0)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Menganalisis inventory...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{stats.total}</div>
            </div>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            </div>
            <p className="text-xs text-muted-foreground">Critical Stock</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">{stats.low}</div>
            </div>
            <p className="text-xs text-muted-foreground">Low Stock</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">{stats.needReorder}</div>
            </div>
            <p className="text-xs text-muted-foreground">Need Reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="text-lg font-bold">Rp {(stats.totalValue / 1000000).toFixed(1)}M</div>
            </div>
            <p className="text-xs text-muted-foreground">Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {stats.critical > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            <strong>URGENT!</strong> {stats.critical} bahan dalam kondisi stok kritis. 
            Segera lakukan reorder untuk menghindari gangguan produksi.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="alerts">🚨 Alerts</TabsTrigger>
          <TabsTrigger value="reorder">🛒 Reorder</TabsTrigger>
          <TabsTrigger value="insights">💡 Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'Semua', count: stats.total },
              { key: 'critical', label: 'Kritis', count: stats.critical },
              { key: 'low', label: 'Rendah', count: stats.low },
              { key: 'adequate', label: 'Cukup', count: stats.total - stats.critical - stats.low },
            ].map((filter) => (
              <Button
                key={filter.key}
                variant={selectedStatus === filter.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(filter.key as any)}
                className="flex items-center gap-1"
              >
                {filter.label}
                <Badge variant="secondary" className="text-xs">
                  {filter.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Inventory Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnalysis.map((item, index) => (
              <Card key={index} className={`relative ${
                item.status === 'critical' ? 'border-red-200 bg-red-50' : 
                item.status === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.ingredient.name}</CardTitle>
                    <Badge variant={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1 capitalize">{item.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stock Level */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Stok Saat Ini</span>
                      <span className="font-medium">
                        {item.ingredient.current_stock} {item.ingredient.unit}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((item.ingredient.current_stock / (item.ingredient.min_stock * 2)) * 100, 100)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min: {item.ingredient.min_stock}</span>
                      <span>Optimal: {item.ingredient.min_stock * 2}</span>
                    </div>
                  </div>

                  {/* Days Remaining */}
                  {item.daysRemaining !== Infinity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Tersisa
                      </span>
                      <span className={`font-medium ${
                        item.daysRemaining <= 3 ? 'text-red-600' :
                        item.daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.daysRemaining} hari
                      </span>
                    </div>
                  )}

                  {/* Value */}
                  <div className="flex justify-between text-sm">
                    <span>Nilai Stok</span>
                    <span className="font-medium">
                      Rp {(item.ingredient.current_stock * item.ingredient.price_per_unit).toLocaleString()}
                    </span>
                  </div>

                  {/* Reorder Recommendation */}
                  {item.reorderRecommendation.shouldReorder && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                        <ShoppingCart className="h-3 w-3" />
                        Rekomendasi Order
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Quantity:</span>
                          <span className="font-medium">{Math.ceil(item.reorderRecommendation.quantity)} {item.ingredient.unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimasi:</span>
                          <span className="font-medium">Rp {item.reorderRecommendation.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Urgency:</span>
                          <span className={`inline-block w-2 h-2 rounded-full ${getUrgencyColor(item.reorderRecommendation.urgency)} mr-1`}></span>
                          <span className="capitalize font-medium">{item.reorderRecommendation.urgency}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => onReorderTriggered?.(item.ingredient, Math.ceil(item.reorderRecommendation.quantity))}
                      >
                        Order Sekarang
                      </Button>
                    </div>
                  )}

                  {/* Insights */}
                  {item.insights.length > 0 && (
                    <div className="space-y-1">
                      {item.insights.map((insight: string, idx: number) => (
                        <div key={idx} className="text-xs text-muted-foreground">
                          {insight}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAnalysis.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Tidak ada item dalam kategori {selectedStatus}
                </h3>
                <p className="text-muted-foreground">
                  Pilih filter lain atau tambah ingredient baru
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {analysis.filter(item => item.status === 'critical' || item.status === 'warning').map((item, index) => (
            <Alert key={index} className={item.status === 'critical' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}>
              {item.status === 'critical' ? (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              ) : (
                <Bell className="h-4 w-4 text-yellow-500" />
              )}
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <strong>{item.ingredient.name}</strong> - Status: {item.status}
                    <br />
                    <span className="text-sm">
                      Stok: {item.ingredient.current_stock} {item.ingredient.unit}
                      {item.daysRemaining !== Infinity && ` (${item.daysRemaining} hari lagi)`}
                    </span>
                  </div>
                  {item.reorderRecommendation.shouldReorder && (
                    <Button 
                      size="sm" 
                      variant={item.status === 'critical' ? 'destructive' : 'secondary'}
                      onClick={() => onReorderTriggered?.(item.ingredient, Math.ceil(item.reorderRecommendation.quantity))}
                    >
                      Order {Math.ceil(item.reorderRecommendation.quantity)} {item.ingredient.unit}
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ))}

          {analysis.filter(item => item.status === 'critical' || item.status === 'warning').length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2 text-green-700">
                  Semua Stock Aman! 🎉
                </h3>
                <p className="text-muted-foreground">
                  Tidak ada alert inventory saat ini. Semua bahan dalam kondisi stock yang cukup.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reorder Tab */}
        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                Rekomendasi Reorder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.filter(item => item.reorderRecommendation.shouldReorder).map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.ingredient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Current: {item.ingredient.current_stock} {item.ingredient.unit} | 
                        Min: {item.ingredient.min_stock} {item.ingredient.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Supplier: {item.ingredient.supplier || 'Not specified'}
                      </div>
                    </div>
                    <div className="text-center mx-4">
                      <div className="text-lg font-bold">
                        {Math.ceil(item.reorderRecommendation.quantity)} {item.ingredient.unit}
                      </div>
                      <div className="text-xs text-muted-foreground">Recommended</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        Rp {item.reorderRecommendation.estimatedCost.toLocaleString()}
                      </div>
                      <Button 
                        size="sm" 
                        variant={item.reorderRecommendation.urgency === 'urgent' ? 'destructive' : 'default'}
                        onClick={() => onReorderTriggered?.(item.ingredient, Math.ceil(item.reorderRecommendation.quantity))}
                      >
                        Order Now
                      </Button>
                    </div>
                  </div>
                ))}

                {analysis.filter(item => item.reorderRecommendation.shouldReorder).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Tidak ada rekomendasi reorder saat ini. Semua stock dalam kondisi cukup.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💡 Smart Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-700 mb-1">Inventory Turnover</div>
                  <div className="text-sm text-blue-600">
                    Rata-rata inventory berputar setiap {Math.ceil(stats.totalValue / (Object.values(usageData).reduce((a, b) => a + b, 0) * 30 || 1))} hari
                  </div>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-700 mb-1">Optimization Potential</div>
                  <div className="text-sm text-green-600">
                    {analysis.filter(a => a.status === 'overstocked').length} item overstocked, 
                    bisa hemat Rp {(analysis.filter(a => a.status === 'overstocked').reduce((sum, a) => sum + ((a.ingredient.current_stock - a.ingredient.min_stock * 2) * a.ingredient.price_per_unit), 0)).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="font-medium text-yellow-700 mb-1">Cash Flow Impact</div>
                  <div className="text-sm text-yellow-600">
                    Inventory mengikat Rp {(stats.totalValue / 1000000).toFixed(1)}M modal kerja
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 Trends & Patterns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(usageData).length > 0 ? (
                  Object.entries(usageData).map(([ingredientId, usage]) => {
                    const ingredient = ingredients.find(i => i.id === ingredientId)
                    if (!ingredient) return null
                    
                    const dailyUsage = usage / 30
                    const daysLeft = ingredient.current_stock / dailyUsage
                    
                    return (
                      <div key={ingredientId} className="flex justify-between items-center text-sm">
                        <span>{ingredient.name}</span>
                        <div className="text-right">
                          <div className="font-medium">{usage.toFixed(1)} {ingredient.unit}/bulan</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.floor(daysLeft)} hari lagi
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Belum ada data usage pattern</p>
                    <p className="text-xs">Data akan tersedia setelah tracking produksi</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SmartInventoryManager
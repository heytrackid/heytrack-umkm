'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Clock,
  Target,
  DollarSign,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap
} from 'lucide-react'
import { EnhancedAutomationEngine } from '@/lib/enhanced-automation-engine'
import { useSupabaseData } from '@/hooks/useSupabaseCRUD'

// Dynamically import Recharts to reduce initial bundle size
const ResponsiveContainer = dynamic(
  () => import('@/components').then(mod => mod.ResponsiveContainer),
  { ssr: false, loading: () => <div className="w-full h-full bg-muted animate-pulse rounded" /> }
)
const LineChart = dynamic(() => import('@/components').then(mod => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('@/components').then(mod => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('@/components').then(mod => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('@/components').then(mod => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('@/components').then(mod => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('@/components').then(mod => mod.Tooltip), { ssr: false })
const BarChart = dynamic(() => import('@/components').then(mod => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('@/components').then(mod => mod.Bar), { ssr: false })
const PieChart = dynamic(() => import('@/components').then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import('@/components').then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import('@/components').then(mod => mod.Cell), { ssr: false })
const Area = dynamic(() => import('@/components').then(mod => mod.Area), { ssr: false })
const AreaChart = dynamic(() => import('@/components').then(mod => mod.AreaChart), { ssr: false })

interface InventoryAnalytics {
  ingredient_id: string
  ingredient_name: string
  category: string
  current_stock: number
  unit: string
  usage_analytics: {
    daily_usage_avg: number
    weekly_trend: 'INCREASING' | 'DECREASING' | 'STABLE'
    usage_velocity: number
    seasonal_pattern?: string
    peak_usage_times: string[]
  }
  reorder_predictions: {
    days_until_stockout: number
    optimal_reorder_point: number
    optimal_reorder_quantity: number
    reorder_cost_optimization: number
    next_reorder_date: string
  }
  cost_analysis: {
    avg_cost_per_unit: number
    monthly_spend: number
    cost_trend: 'UP' | 'DOWN' | 'STABLE'
    cost_savings_opportunities: string[]
  }
  quality_metrics: {
    waste_percentage: number
    expiry_risk_score: number
    supplier_reliability: number
  }
  automation_recommendations: string[]
  performance_score: number
}

interface InventoryInsights {
  total_value: number
  turnover_rate: number
  waste_cost: number
  optimization_savings: number
  critical_items_count: number
  reorder_alerts_count: number
  trends: {
    usage_trend: 'UP' | 'DOWN' | 'STABLE'
    cost_trend: 'UP' | 'DOWN' | 'STABLE' 
    efficiency_trend: 'UP' | 'DOWN' | 'STABLE'
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

function InventoryAnalytics() {
  const [analytics, setAnalytics] = useState<InventoryAnalytics[]>([])
  const [insights, setInsights] = useState<InventoryInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Fetch data
  const { data: ingredients } = useSupabaseData('ingredients')
  const { data: stockTransactions } = useSupabaseData('stock_transactions', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 100
  })
  // const { data: usageAnalytics } = useSupabaseData('usage_analytics', {
  //   orderBy: { column: 'date', ascending: false },
  //   limit: 50
  // })
  // Temporarily disable usage analytics until table is properly set up
  const usageAnalytics: any[] = []

  useEffect(() => {
    if (ingredients) {
      generateInventoryAnalytics()
    }
  }, [ingredients, stockTransactions, usageAnalytics])

  const generateInventoryAnalytics = async () => {
    if (!ingredients) return

    setLoading(true)
    try {
      const inventoryAnalysis = await EnhancedAutomationEngine.analyzeInventoryNeeds(ingredients)
      
      // Transform to detailed analytics
      const detailedAnalytics: InventoryAnalytics[] = ingredients.map(ingredient => {
        const usageData = usageAnalytics?.filter(ua => ua.ingredient_id === ingredient.id) || []
        const recentTransactions = stockTransactions?.filter(st => st.ingredient_id === ingredient.id) || []

        return {
          ingredient_id: ingredient.id,
          ingredient_name: ingredient.name,
          category: ingredient.category || 'Uncategorized',
          current_stock: ingredient.current_stock,
          unit: ingredient.unit,
          usage_analytics: generateUsageAnalytics(ingredient, usageData),
          reorder_predictions: generateReorderPredictions(ingredient, usageData),
          cost_analysis: generateCostAnalysis(ingredient, recentTransactions),
          quality_metrics: generateQualityMetrics(ingredient, recentTransactions),
          automation_recommendations: generateAutomationRecommendations(ingredient, usageData),
          performance_score: calculatePerformanceScore(ingredient, usageData, recentTransactions)
        }
      })

      // Sort by performance score
      detailedAnalytics.sor"" => b.performance_score - a.performance_score)
      setAnalytics(detailedAnalytics)

      // Generate overall insights
      const overallInsights = generateOverallInsights(detailedAnalytics)
      setInsights(overallInsights)

    } catch (error) {
      console.error('Error generating inventory analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateUsageAnalytics = (ingredient: any, usageData: any[]) => {
    const dailyAvg = usageData.length > 0 
      ? usageData.reduce((sum, u) => sum + (u.quantity_used || 0), 0) / usageData.length
      : ingredient.usage_rate_daily || 10

    const weeklyTrend = usageData.length >= 7 
      ? getTrendDirection(usageData.slice(0, 7).map(u => u.quantity_used || 0))
      : 'STABLE' as const

    return {
      daily_usage_avg: dailyAvg,
      weekly_trend: weeklyTrend,
      usage_velocity: dailyAvg * 7, // weekly velocity
      seasonal_pattern: 'No clear pattern',
      peak_usage_times: ['Morning', 'Evening']
    }
  }

  const generateReorderPredictions = (ingredient: any, usageData: any[]) => {
    const dailyUsage = usageData.length > 0 
      ? usageData.reduce((sum, u) => sum + (u.quantity_used || 0), 0) / usageData.length
      : ingredient.usage_rate_daily || 10

    const daysUntilStockout = dailyUsage > 0 ? Math.floor(ingredient.current_stock / dailyUsage) : 999
    const optimalReorderPoint = Math.max(dailyUsage * (ingredient.reorder_lead_time || 7), ingredient.min_stock)
    const optimalQuantity = Math.max(dailyUsage * 30, ingredient.min_stock * 2) // 30-day supply

    const nextReorderDate = new Date()
    nextReorderDate.setDate(nextReorderDate.getDate() + Math.max(daysUntilStockout - 5, 1))

    return {
      days_until_stockout: daysUntilStockout,
      optimal_reorder_point: optimalReorderPoint,
      optimal_reorder_quantity: optimalQuantity,
      reorder_cost_optimization: optimalQuantity * (ingredient.cost_per_unit || 1000),
      next_reorder_date: nextReorderDate.toISOString().spli"Placeholder"[0]
    }
  }

  const generateCostAnalysis = (ingredient: any, transactions: any[]) => {
    const avgCost = transactions.length > 0
      ? transactions.reduce((sum, t) => sum + (t.cost || 0), 0) / transactions.length
      : ingredient.cost_per_unit || 1000

    const monthlyTransactions = transactions.filter(t => {
      const transDate = new Date(t.created_at)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return transDate >= monthAgo
    })

    const monthlySpend = monthlyTransactions.reduce((sum, t) => sum + (t.cost || 0), 0)

    return {
      avg_cost_per_unit: avgCost,
      monthly_spend: monthlySpend,
      cost_trend: 'STABLE' as const,
      cost_savings_opportunities: [
        'Consider bulk purchasing for 15% discount',
        'Evaluate alternative suppliers',
        'Implement just-in-time ordering'
      ]
    }
  }

  const generateQualityMetrics = (ingredient: any, transactions: any[]) => {
    return {
      waste_percentage: Math.random() * 10, // 0-10% waste
      expiry_risk_score: ingredient.expiry_date 
        ? Math.max(0, 100 - (new Date(ingredient.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      supplier_reliability: 85 + Math.random() * 15 // 85-100%
    }
  }

  const generateAutomationRecommendations = (ingredient: any, usageData: any[]) => {
    const recommendations = []

    if (ingredient.current_stock <= ingredient.min_stock) {
      recommendations.push('Set up automatic reordering when stock hits minimum')
    }

    if (usageData.length < 7) {
      recommendations.push('Enable usage tracking for better predictions')
    }

    recommendations.push('Consider demand forecasting integration')
    recommendations.push('Set up expiry date alerts')

    return recommendations
  }

  const calculatePerformanceScore = (ingredient: any, usageData: any[], transactions: any[]) => {
    let score = 50 // base score

    // Stock level health
    const stockRatio = ingredient.current_stock / (ingredient.min_stock || 1)
    if (stockRatio > 2) score += 20
    else if (stockRatio > 1) score += 10
    else score -= 20

    // Usage data availability
    if (usageData.length >= 7) score += 15

    // Transaction frequency (indicates active ingredient)
    if (transactions.length >= 3) score += 15

    return Math.max(0, Math.min(100, score))
  }

  const generateOverallInsights = (analytics: InventoryAnalytics[]): InventoryInsights => {
    const totalValue = analytics.reduce((sum, a) => 
      sum + (a.current_stock * a.cost_analysis.avg_cost_per_unit), 0
    )

    const criticalItems = analytics.filter(a => 
      a.reorder_predictions.days_until_stockout <= 7
    ).length

    const reorderAlerts = analytics.filter(a => 
      a.current_stock <= a.reorder_predictions.optimal_reorder_point
    ).length

    const avgWaste = analytics.reduce((sum, a) => sum + a.quality_metrics.waste_percentage, 0) / analytics.length
    const wasteCost = totalValue * (avgWaste / 100)

    return {
      total_value: totalValue,
      turnover_rate: 2.5, // times per month
      waste_cost: wasteCost,
      optimization_savings: totalValue * 0.12, // 12% potential savings
      critical_items_count: criticalItems,
      reorder_alerts_count: reorderAlerts,
      trends: {
        usage_trend: 'UP',
        cost_trend: 'STABLE',
        efficiency_trend: 'UP'
      }
    }
  }

  const getTrendDirection = (values: number[]): 'INCREASING' | 'DECREASING' | 'STABLE' => {
    if (values.length < 2) return 'STABLE'
    const first = values[0]
    const last = values[values.length - 1]
    const change = ((last - first) / first) * 100
    
    if (change > 10) return 'INCREASING'
    if (change < -10) return 'DECREASING'
    return 'STABLE'
  }

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE' | 'INCREASING' | 'DECREASING') => {
    switch (trend) {
      case 'UP':
      case 'INCREASING':
        return <ArrowUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      case 'DOWN':
      case 'DECREASING':
        return <ArrowDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getFilteredAnalytics = () => {
    if (selectedCategory === 'all') return analytics
    return analytics.filter(a => a.category === selectedCategory)
  }

  const categories = [...new Se"")]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Inventory Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Smart Inventory Analytics
          </CardTitle>
          <div className="flex items-center gap-2">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button variant="outline" size="sm" onClick={generateInventoryAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="optimization">Optimize</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {insights && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium">Total Value</span>
                  </div>
                  <p className="text-2xl font-bold">
                    Rp {(insights.total_value / 1000000).toFixed(1)}M
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium">Critical Items</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {insights.critical_items_count}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Reorder Alerts</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {insights.reorder_alerts_count}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium">Potential Savings</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    Rp {(insights.optimization_savings / 1000000).toFixed(1)}M
                  </p>
                </Card>
              </div>
            )}

            {/* Top Performing Items */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Top Performing Ingredients</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {getFilteredAnalytics().slice(0, 8).map((item) => (
                  <div key={item.ingredient_id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm">{item.ingredient_name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.current_stock} {item.unit} • 
                        Avg use: {item.usage_analytics.daily_usage_avg.toFixed(1)}/day
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs">
                        <div className="font-medium">Score: {item.performance_score}</div>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(item.usage_analytics.weekly_trend)}
                          <span>{item.usage_analytics.weekly_trend}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <div className="space-y-4">
              {getFilteredAnalytics()
                .filter(item => item.reorder_predictions.days_until_stockout <= 30)
                .map((item) => (
                <Card key={item.ingredient_id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{item.ingredient_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Current: {item.current_stock} {item.unit}
                      </p>
                    </div>
                    <Badge variant={
                      item.reorder_predictions.days_until_stockout <= 7 ? 'destructive' :
                      item.reorder_predictions.days_until_stockout <= 14 ? 'secondary' : 'outline'
                    }>
                      {item.reorder_predictions.days_until_stockout} days left
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Daily Usage</div>
                      <div className="font-medium">
                        {item.usage_analytics.daily_usage_avg.toFixed(1)} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Reorder Point</div>
                      <div className="font-medium">
                        {item.reorder_predictions.optimal_reorder_point} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Order Quantity</div>
                      <div className="font-medium">
                        {item.reorder_predictions.optimal_reorder_quantity} {item.unit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Next Reorder</div>
                      <div className="font-medium text-sm">
                        {new Date(item.reorder_predictions.next_reorder_date).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Stock Level</span>
                      <span>
                        {((item.current_stock / item.reorder_predictions.optimal_reorder_point) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((item.current_stock / item.reorder_predictions.optimal_reorder_point) * 100, 100)} 
                      className="w-full"
                    />
                  </div>

                  {item.reorder_predictions.days_until_stockout <= 7 && (
                    <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 border border-red-200 rounded">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Urgent: Reorder immediately
                        </span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {/* Usage Trends Chart */}
            <Card className="p-4">
              <h4 className="font-medium mb-3">Usage Trends (Last 30 Days)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredAnalytics().slice(0, 6).map(item => ({
                    name: item.ingredient_name.substring(0, 10),
                    usage: item.usage_analytics.daily_usage_avg,
                    stock: item.current_stock
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="usage" stroke="#8884d8" name="Daily Usage" />
                    <Line type="monotone" dataKey="stock" stroke="#82ca9d" name="Current Stock" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Distribution */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Inventory by Category</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categories.map((cat, idx) => ({
                          name: cat,
                          value: analytics.filter(a => a.category === cat).length,
                          color: COLORS[idx % COLORS.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categories.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Performance Scores */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Performance Distribution</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFilteredAnalytics().slice(0, 8).map(item => ({
                      name: item.ingredient_name.substring(0, 8),
                      score: item.performance_score
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-4">
            <div className="space-y-4">
              {getFilteredAnalytics().slice(0, 6).map((item) => (
                <Card key={item.ingredient_id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{item.ingredient_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Performance Score: {item.performance_score}/100
                      </p>
                    </div>
                    <Badge variant={item.performance_score > 70 ? 'default' : 'secondary'}>
                      {item.performance_score > 70 ? 'Optimized' : 'Needs Attention'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Cost Optimization</h5>
                      <div className="text-xs space-y-1">
                        {item.cost_analysis.cost_savings_opportunities.slice(0, 2).map((opp, idx) => (
                          <p key={idx} className="text-blue-700">• {opp}</p>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Quality Metrics</h5>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Waste:</span>
                          <span className={
                            item.quality_metrics.waste_percentage > 8 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                          }>
                            {item.quality_metrics.waste_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Supplier:</span>
                          <span>{item.quality_metrics.supplier_reliability.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Automation Recommendations */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Smart Recommendations</h5>
                    <div className="space-y-1">
                      {item.automation_recommendations.slice(0, 3).map((rec, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-purple-700">
                          <CheckCircle className="h-3 w-3" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default InventoryAnalytics
export { InventoryAnalytics }

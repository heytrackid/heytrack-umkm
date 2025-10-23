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
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  Zap,
  Lightbulb,
  Package,
  Factory,
  Users,
  CreditCard,
  Wallet
} from 'lucide-react'
import { automationEngine } from '@/lib/automation-engine'
import { Ingredient } from '@/types'
import { useCurrency } from '@/hooks/useCurrency'

interface FinancialData {
  sales: Array<{ amount: number; cost: number; date: string; product?: string }>
  expenses: Array<{ amount: number; category: string; date: string; description?: string }>
  inventory: Ingredient[]
}

interface SmartFinancialDashboardProps {
  data: FinancialData
  targetRevenue?: number
  targetMargin?: number
  onFinancialAction?: (action: string, data?: any) => void
}

export function SmartFinancialDashboard({ 
  data, 
  targetRevenue = 50000000, // Default 50M per month
  targetMargin = 60, // Default 60% gross margin
  onFinancialAction 
}: SmartFinancialDashboardProps) {
  const { formatCurrency: formatCurrencyDynamic } = useCurrency()
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (data.sales.length > 0 || data.expenses.length > 0) {
      analyzeFinancialHealth()
    }
  }, [data, selectedPeriod])

  const analyzeFinancialHealth = async () => {
    setLoading(true)
    try {
      const financialAnalysis = automationEngine.analyzeFinancialHealth(
        data.sales,
        data.expenses,
        data.inventory
      )
      setAnalysis(financialAnalysis)
    } catch (error: any) {
      console.error('Error analyzing financial health:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return formatCurrencyDynamic(amount)
  }

  const formatPercentage = (value: number, decimals = 1) => {
    return `${value.toFixed(decimals)}%`
  }

  const getHealthColor = (value: number, good: number, bad: number) => {
    if (value >= good) return 'text-gray-600 dark:text-gray-400'
    if (value <= bad) return 'text-gray-600 dark:text-gray-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    return <DollarSign className="h-4 w-4 text-gray-500" />
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Menganalisis kesehatan finansial...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada data untuk analisis finansial</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { metrics, trends, alerts, recommendations } = analysis

  // Calculate progress towards targets
  const revenueProgress = (metrics.revenue / targetRevenue) * 100
  const marginProgress = (metrics.grossMargin / targetMargin) * 100

  return (
    <div className="space-y-6">
      {/* Financial Health Overview */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-2 border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(metrics.revenue)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Revenue (30 hari)</p>
            <Progress value={revenueProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercentage(revenueProgress, 0)} dari target
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className={`text-2xl font-bold ${getHealthColor(metrics.grossMargin, 50, 30)}`}>
                {formatPercentage(metrics.grossMargin)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Gross Margin</p>
            <Progress value={marginProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <div className={`text-2xl font-bold ${getHealthColor(metrics.netMargin, 15, 5)}`}>
                {formatPercentage(metrics.netMargin)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Net Margin</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-orange-500" />
              <div className={`text-2xl font-bold ${
                metrics.netProfit >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {formatCurrency(metrics.netProfit)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Net Profit</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-gray-500" />
              <div className="text-2xl font-bold text-gray-600">
                {formatCurrency(metrics.inventoryValue)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Inventory Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, index: number) => (
            <Alert key={index} className={`${
              alert.type === 'danger' ? 'border-red-200 bg-gray-100 dark:bg-gray-800' : 'border-yellow-200 bg-gray-100 dark:bg-gray-800'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                alert.type === 'danger' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
              }`} />
              <AlertDescription className={
                alert.type === 'danger' ? 'text-red-700' : 'text-yellow-700'
              }>
                <strong>{alert.message}</strong><br />
                {alert.action}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="trends">📈 Trends</TabsTrigger>
          <TabsTrigger value="insights">💡 Insights</TabsTrigger>
          <TabsTrigger value="actions">🎯 Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">💰 Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Gross Revenue</span>
                    <span className="font-medium">{formatCurrency(metrics.revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Cost of Goods Sold</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      -{formatCurrency(metrics.revenue - metrics.grossProfit)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center font-bold">
                    <span>Gross Profit</span>
                    <span className="text-gray-600 dark:text-gray-400">{formatCurrency(metrics.grossProfit)}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Target Progress</span>
                    <span>{formatPercentage(revenueProgress, 0)}</span>
                  </div>
                  <Progress value={Math.min(revenueProgress, 100)} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-1">
                    Target: {formatCurrency(targetRevenue)} / bulan
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profitability Health */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 Profitability Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {formatPercentage(metrics.grossMargin)}
                    </div>
                    <div className="text-xs text-green-700">Gross Margin</div>
                    <div className="text-xs text-muted-foreground">
                      Target: {formatPercentage(targetMargin)}
                    </div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {formatPercentage(metrics.netMargin)}
                    </div>
                    <div className="text-xs text-blue-700">Net Margin</div>
                    <div className="text-xs text-muted-foreground">
                      Industry: 15-25%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Health Indicators:</div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span>Revenue Growth</span>
                      <Badge variant={metrics.revenue > 0 ? 'default' : 'secondary'}>
                        {metrics.revenue > 0 ? 'Growing' : 'Stable'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Margin Health</span>
                      <Badge variant={metrics.grossMargin > 50 ? 'default' : metrics.grossMargin > 30 ? 'secondary' : 'destructive'}>
                        {metrics.grossMargin > 50 ? 'Excellent' : metrics.grossMargin > 30 ? 'Good' : 'Poor'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>Cash Flow</span>
                      <Badge variant={metrics.netProfit > 0 ? 'default' : 'destructive'}>
                        {metrics.netProfit > 0 ? 'Positive' : 'Negative'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📋 Key Financial Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {Math.round(metrics.inventoryValue / metrics.revenue * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Inventory Ratio</div>
                  <div className="text-xs text-muted-foreground">
                    Modal kerja vs Revenue
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {Math.round((metrics.revenue / 30))}
                  </div>
                  <div className="text-sm text-muted-foreground">Daily Revenue</div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(metrics.revenue / 30)} / hari
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {Math.round(metrics.inventoryValue / (metrics.revenue / 30))}
                  </div>
                  <div className="text-sm text-muted-foreground">Days of Inventory</div>
                  <div className="text-xs text-muted-foreground">
                    Berapa hari inventory bertahan
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {metrics.grossMargin > 0 ? Math.round(100 / metrics.grossMargin) : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Break-even Multiple</div>
                  <div className="text-xs text-muted-foreground">
                    Revenue multiplier untuk BEP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">📈 Weekly Financial Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((week: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{week.week}</div>
                      {index < trends.length - 1 && getTrendIcon(week.revenue, trends[index + 1]?.revenue || 0)}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(week.revenue)}</div>
                        <div className="text-muted-foreground">Revenue</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-600 dark:text-gray-400">{formatCurrency(week.expenses)}</div>
                        <div className="text-muted-foreground">Expenses</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${week.revenue - week.expenses >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          {formatCurrency(week.revenue - week.expenses)}
                        </div>
                        <div className="text-muted-foreground">Net</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Smart Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.map((rec: string, index: number) => (
                  <Alert key={index}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Business Health Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🏆 Business Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Revenue Growth', 
                    score: Math.min((metrics.revenue / targetRevenue) * 100, 100),
                    color: 'bg-gray-100 dark:bg-gray-8000'
                  },
                  { 
                    name: 'Profitability', 
                    score: Math.min((metrics.grossMargin / targetMargin) * 100, 100),
                    color: 'bg-gray-100 dark:bg-gray-8000'
                  },
                  { 
                    name: 'Cash Flow', 
                    score: metrics.netProfit > 0 ? 100 : 20,
                    color: 'bg-gray-100 dark:bg-gray-8000'
                  },
                  { 
                    name: 'Efficiency', 
                    score: Math.min(metrics.netMargin * 5, 100),
                    color: 'bg-orange-500'
                  }
                ].map((item, _index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm font-bold">{Math.round(item.score)}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${item.color}`}
                        style={{ width: `${Math.min(item.score, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                      {Math.round((
                        Math.min((metrics.revenue / targetRevenue) * 100, 100) +
                        Math.min((metrics.grossMargin / targetMargin) * 100, 100) +
                        (metrics.netProfit > 0 ? 100 : 20) +
                        Math.min(metrics.netMargin * 5, 100)
                      ) / 4)}
                    </div>
                    <div className="text-sm text-blue-700 font-medium">Overall Health Score</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.round((
                        Math.min((metrics.revenue / targetRevenue) * 100, 100) +
                        Math.min((metrics.grossMargin / targetMargin) * 100, 100) +
                        (metrics.netProfit > 0 ? 100 : 20) +
                        Math.min(metrics.netMargin * 5, 100)
                      ) / 4) > 80 ? 'Excellent Business Health!' :
                      Math.round((
                        Math.min((metrics.revenue / targetRevenue) * 100, 100) +
                        Math.min((metrics.grossMargin / targetMargin) * 100, 100) +
                        (metrics.netProfit > 0 ? 100 : 20) +
                        Math.min(metrics.netMargin * 5, 100)
                      ) / 4) > 60 ? 'Good Business Health' :
                      'Needs Improvement'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Priority Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: 'Optimize Product Mix',
                    description: 'Focus pada produk dengan margin tertinggi',
                    priority: 'high',
                    action: 'review_products'
                  },
                  {
                    title: 'Reduce COGS',
                    description: 'Negosiasi supplier atau ganti supplier',
                    priority: metrics.grossMargin < 50 ? 'high' : 'medium',
                    action: 'optimize_costs'
                  },
                  {
                    title: 'Inventory Optimization',
                    description: 'Kurangi inventory untuk improve cash flow',
                    priority: metrics.inventoryValue > metrics.revenue * 0.3 ? 'high' : 'low',
                    action: 'optimize_inventory'
                  },
                  {
                    title: 'Revenue Growth',
                    description: 'Marketing campaign atau expand product line',
                    priority: revenueProgress < 80 ? 'high' : 'medium',
                    action: 'grow_revenue'
                  }
                ].map((action, _index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{action.title}</div>
                      <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                        {action.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onFinancialAction?.(action.action)}
                    >
                      <Target className="h-3 w-3 mr-1" />
                      Take Action
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {Math.round(metrics.revenue / 1000000)}M
                    </div>
                    <div className="text-xs text-green-700">Monthly Revenue</div>
                  </div>
                  <div className="text-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {Math.round(metrics.netProfit / 1000000)}M
                    </div>
                    <div className="text-xs text-blue-700">Monthly Profit</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Performance vs Targets:</div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Revenue Target</span>
                        <span>{formatPercentage(revenueProgress, 0)}</span>
                      </div>
                      <Progress value={Math.min(revenueProgress, 100)} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Margin Target</span>
                        <span>{formatPercentage(marginProgress, 0)}</span>
                      </div>
                      <Progress value={Math.min(marginProgress, 100)} className="h-2" />
                    </div>
                  </div>
                </div>

                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Next Milestone:</strong> {
                      revenueProgress < 100 
                        ? `Capai target revenue ${formatCurrency(targetRevenue)}`
                        : marginProgress < 100
                        ? `Improve margin to ${formatPercentage(targetMargin)}`
                        : 'Set new growth targets!'
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
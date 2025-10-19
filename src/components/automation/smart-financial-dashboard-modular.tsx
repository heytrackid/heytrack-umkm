'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'
import { automationEngine } from '@/lib/automation-engine'
import { useCurrency } from '@/hooks/useCurrency'

// Import Ingredient from the correct location
interface Ingredient {
  id: string
  name: string
  currentStock?: number
  costPrice?: number
  unit: string
  category?: string
}

// Lazy load tab components
const FinancialAlerts = dynamic(() => import('./financial-alerts').then(mod => ({ default: mod.FinancialAlerts })), {
  loading: () => <div className="animate-pulse h-20 bg-muted rounded-lg" />
})

const OverviewTab = dynamic(() => import('./overview-tab').then(mod => ({ default: mod.OverviewTab })), {
  loading: () => <div className="animate-pulse h-96 bg-muted rounded-lg" />
})

const ActionsTab = dynamic(() => import('./actions-tab').then(mod => ({ default: mod.ActionsTab })), {
  loading: () => <div className="animate-pulse h-96 bg-muted rounded-lg" />
})

// Trends and Insights tabs - can be created later
const TrendsTab = dynamic(() => import('./trends-tab').then(mod => ({ default: mod.TrendsTab })), {
  loading: () => <div className="animate-pulse h-96 bg-muted rounded-lg" />
})

const InsightsTab = dynamic(() => import('./insights-tab').then(mod => ({ default: mod.InsightsTab })), {
  loading: () => <div className="animate-pulse h-96 bg-muted rounded-lg" />
})

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
  const [alerts, setAlerts] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const { formatCurrency } = useCurrency()
  const formatPercentage = (value: number) => `${(value).toFixed(1)}%`

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = data.sales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalCost = data.sales.reduce((sum, sale) => sum + (sale.cost || 0), 0)
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0)
    const inventoryValue = data.inventory.reduce((sum, item) => sum + (item.currentStock || 0) * (item.costPrice || 0), 0)

    const grossProfit = totalRevenue - totalCost
    const netProfit = grossProfit - totalExpenses

    return {
      revenue: totalRevenue,
      grossProfit,
      netProfit,
      grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      inventoryValue,
      totalExpenses
    }
  }, [data])

  const revenueProgress = useMemo(() => (metrics.revenue / targetRevenue) * 100, [metrics.revenue, targetRevenue])
  const marginProgress = useMemo(() => (metrics.grossMargin / targetMargin) * 100, [metrics.grossMargin, targetMargin])

  // Generate alerts and recommendations
  useEffect(() => {
    const newAlerts: any[] = []
    const newRecommendations: string[] = []

    if (metrics.revenue < targetRevenue * 0.8) {
      newAlerts.push({
        type: 'danger',
        message: 'Revenue target tidak tercapai!',
        action: 'Perlu strategi marketing agresif atau optimasi harga'
      })
    }

    if (metrics.grossMargin < 40) {
      newAlerts.push({
        type: 'warning',
        message: 'Margin gross terlalu rendah',
        action: 'Tinjau harga jual atau kurangi biaya bahan baku'
      })
    }

    if (metrics.netProfit < 0) {
      newAlerts.push({
        type: 'danger',
        message: 'Operasi mengalami kerugian!',
        action: 'Segera review biaya operasional dan optimasi penjualan'
      })
    }

    // Generate recommendations
    if (metrics.grossMargin > 60) {
      newRecommendations.push('Margin sangat baik! Pertimbangkan ekspansi produk baru')
    }

    if (metrics.revenue > targetRevenue) {
      newRecommendations.push('Target revenue tercapai! Fokus pada profitabilitas')
    }

    if (metrics.inventoryValue > metrics.revenue * 0.5) {
      newRecommendations.push('Inventory terlalu tinggi, optimalkan cash flow dengan mengurangi stock')
    }

    setAlerts(newAlerts)
    setRecommendations(newRecommendations)

    // Generate mock trends data
    const mockTrends = Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      revenue: metrics.revenue * (0.8 + Math.random() * 0.4),
      expenses: metrics.totalExpenses * (0.7 + Math.random() * 0.6)
    }))
    setTrends(mockTrends)
  }, [metrics, targetRevenue])

  return (
    <div className="space-y-6">
      {/* Header with key metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.revenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Profit</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.grossProfit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                <p className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netProfit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gross Margin</p>
                <p className="text-2xl font-bold text-orange-600">{formatPercentage(metrics.grossMargin)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Alerts */}
      <FinancialAlerts alerts={alerts} />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="trends">📈 Trends</TabsTrigger>
          <TabsTrigger value="insights">💡 Insights</TabsTrigger>
          <TabsTrigger value="actions">🎯 Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            metrics={metrics}
            targetRevenue={targetRevenue}
            targetMargin={targetMargin}
            revenueProgress={revenueProgress}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <TrendsTab trends={trends} formatCurrency={formatCurrency} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <InsightsTab
            recommendations={recommendations}
            metrics={metrics}
            targetRevenue={targetRevenue}
            targetMargin={targetMargin}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <ActionsTab
            metrics={metrics}
            targetRevenue={targetRevenue}
            targetMargin={targetMargin}
            revenueProgress={revenueProgress}
            marginProgress={marginProgress}
            onFinancialAction={onFinancialAction}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

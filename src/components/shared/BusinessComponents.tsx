 
'use client'

import {
    AlertTriangle,
    BarChart3,
    CheckCircle,
    DollarSign,
    Info,
    LineChart,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react'
import { type ReactNode, useMemo } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatNumber } from '@/lib/shared/utilities'
import { cn } from '@/lib/utils'

import type { InventoryAlert as DatabaseInventoryAlert } from '@/modules/inventory/types'

// Shared business logic components and utilities

// Inventory Status Components

// Define a UI-specific type that extends the database type with UI-specific fields
interface BaseInventoryAlert extends DatabaseInventoryAlert {
  // Additional UI fields that are not in the database schema
  ingredient_name?: string
  current_stock?: number
  reorder_point?: number
  min_stock?: number
  max_stock?: number
  unit?: string
}

interface InventoryAlert extends BaseInventoryAlert {
  // Additional UI fields that are not in the database schema
  item?: {
    id: string
    name: string
    currentStock: number
    minStock: number
    maxStock?: number
    unit: string
  }
  suggestedAction?: string
  // Map the database alert_type to the UI type field
  type?: 'expiring' | 'low_stock' | 'out_of_stock' | 'over_stock'
}

interface InventoryAlertsProps {
  alerts: InventoryAlert[]
  onResolve?: (alertId: string) => void
  onViewItem?: (itemId: string) => void
  className?: string
}

export const InventoryAlerts = ({
  alerts,
  onResolve,
  onViewItem,
  className = ""
}: InventoryAlertsProps) => {
  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900'
  }

  if (alerts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">All Good!</h3>
          <p className="text-muted-foreground">
            No inventory alerts at this time.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {alerts.map((alert) => {
        // Map alert_type from database to UI type
        const alertType = alert.alert_type as 'expiring' | 'low_stock' | 'out_of_stock' | 'over_stock' | undefined;
        const Icon = alertType === 'low_stock' || alertType === 'out_of_stock' || alertType === 'expiring'
          ? AlertTriangle
          : Info

        // Determine item details - prefer the item object if available, otherwise extract from alert
        const itemName = alert.item?.name ?? alert['ingredient_name'] ?? 'Unknown Item';
        const itemId = alert.item?.id ?? alert.ingredient_id ?? '';

        return (
          <Alert key={alert['id']} className={`border-l-4 ${alert.severity === 'critical' ? 'border-red-500' :
            alert.severity === 'high' ? 'border-orange-500' :
              'border-yellow-500'
            }`}>
            <Icon className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={severityColors[(alert.severity as keyof typeof severityColors) || 'low']}>
                      {(alert.severity ?? 'low').toUpperCase()}
                    </Badge>
                    <span className="font-medium">{itemName}</span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                  {alert.suggestedAction && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Suggested: {alert.suggestedAction}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  {onViewItem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewItem(itemId)}
                    >
                      View
                    </Button>
                  )}
                  {onResolve && (
                    <Button
                      size="sm"
                      onClick={() => onResolve(alert['id'])}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}

// Stock Level Indicator
interface StockLevelIndicatorProps {
  currentStock: number
  minStock: number
  maxStock?: number
  unit: string
  showProgress?: boolean
  className?: string
}

export const StockLevelIndicator = ({
  currentStock,
  minStock,
  maxStock,
  unit,
  showProgress = true,
  className = ""
}: StockLevelIndicatorProps) => {
  const percentage = maxStock ? (currentStock / maxStock) * 100 : (currentStock / (minStock * 2)) * 100
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

  const getStatusColor = () => {
    if (currentStock <= 0) { return 'bg-red-500' }
    if (currentStock <= minStock) { return 'bg-orange-500' }
    if (maxStock && currentStock >= maxStock) { return 'bg-muted0' }
    return 'bg-muted0'
  }

  const getStatusText = () => {
    if (currentStock <= 0) { return 'Out of Stock' }
    if (currentStock <= minStock) { return 'Low Stock' }
    if (maxStock && currentStock >= maxStock) { return 'Over Stock' }
    return 'In Stock'
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span>Stock Level</span>
        <span className="font-medium">
          {formatNumber(currentStock)} {unit}
        </span>
      </div>

      {showProgress && (
        <div className="space-y-1">
          <Progress
            value={clampedPercentage}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {formatNumber(minStock)}</span>
            {maxStock && <span>Max: {formatNumber(maxStock)}</span>}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-sm">{getStatusText()}</span>
      </div>
    </div>
  )
}

// Financial Metrics Components
interface MetricCardProps {
  title: string
  value: number | string
  change?: {
    value: number
    label: string
    trend: 'down' | 'neutral' | 'up'
  }
  icon?: ReactNode
  className?: string
}

export const MetricCard = ({
  title,
  value,
  change,
  icon,
  className = ""
}: MetricCardProps) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold">
            {value}
          </p>
           {change && (
             <div className="flex items-center mt-2 text-sm">
               {change.trend === 'up' && <TrendingUp className="h-4 w-4 text-muted-foreground mr-1" />}
               {change.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
               <span className={`${change.trend === 'up' ? 'text-muted-foreground' :
                 change.trend === 'down' ? 'text-red-600' :
                   'text-muted-foreground'
                 }`}>
                {change.value > 0 && '+'}{change.value}% {change.label}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="h-8 w-8 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

// Profitability Calculator Component
interface ProfitabilityData {
  revenue: number
  costOfGoodsSold: number
  operatingExpenses: number
  otherIncome?: number
  otherExpenses?: number
}

interface ProfitabilityCalculatorProps {
  data: ProfitabilityData
  showBreakdown?: boolean
  className?: string
}

export const ProfitabilityCalculator = ({
  data,
  showBreakdown = true,
  className = ""
}: ProfitabilityCalculatorProps) => {
  const calculations = useMemo(() => {
    const grossProfit = data.revenue - data.costOfGoodsSold
    const grossMargin = data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0

    const totalExpenses = data.operatingExpenses + (data.otherExpenses ?? 0)
    const netIncome = grossProfit - totalExpenses + (data.otherIncome ?? 0)
    const netMargin = data.revenue > 0 ? (netIncome / data.revenue) * 100 : 0

    return {
      grossProfit,
      grossMargin,
      totalExpenses,
      netIncome,
      netMargin
    }
  }, [data])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Profitability Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="text-lg font-semibold text-muted-foreground">
              {formatCurrency(data.revenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">COGS</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(data.costOfGoodsSold)}
            </p>
          </div>
        </div>

        {showBreakdown && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex justify-between">
              <span>Gross Profit</span>
              <span className="font-medium">
                {formatCurrency(calculations.grossProfit)}
                <span className="text-sm text-muted-foreground ml-2">
                  ({calculations.grossMargin.toFixed(1)}%)
                </span>
              </span>
            </div>

            <div className="flex justify-between">
              <span>Operating Expenses</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(data.operatingExpenses)}
              </span>
            </div>

            {data.otherIncome && (
              <div className="flex justify-between">
                <span>Other Income</span>
                <span className="font-medium text-muted-foreground">
                  +{formatCurrency(data.otherIncome)}
                </span>
              </div>
            )}

            {data.otherExpenses && (
              <div className="flex justify-between">
                <span>Other Expenses</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(data.otherExpenses)}
                </span>
              </div>
            )}

            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold">
                <span>Net Income</span>
                <span className={calculations.netIncome >= 0 ? 'text-foreground' : 'text-red-600'}>
                  {formatCurrency(calculations.netIncome)}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({calculations.netMargin.toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Sales Performance Chart Component
interface SalesData {
  period: string
  sales: number
  target?: number
  orders: number
}

interface SalesPerformanceChartProps {
  data: SalesData[]
  period: 'daily' | 'monthly' | 'weekly' | 'yearly'
  showTargets?: boolean
  className?: string
}

export const SalesPerformanceChart = ({
  data,
  period,
  showTargets = false,
  className = ""
}: SalesPerformanceChartProps) => {
  const maxSales = Math.max(...data.map(d => d.sales))
  const maxTarget = showTargets && data.some(d => d.target)
    ? Math.max(...data.map(d => d.target ?? 0))
    : maxSales

  const chartHeight = 200
  const getBarHeight = (value: number) => (value / maxTarget) * chartHeight

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          Sales Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex items-end gap-2 h-48">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-1 w-full">
                  {/* Target bar (if shown) */}
                  {showTargets && item.target && (
                    <div
                      className="w-2 bg-blue-200 rounded-t"
                      style={{ height: getBarHeight(item.target) }}
                    />
                  )}

                  {/* Sales bar */}
                  <div
                    className="w-6 bg-primary rounded-t transition-all duration-300 hover:opacity-80"
                    style={{ height: getBarHeight(item.sales) }}
                  />
                </div>

                <span className="text-xs text-muted-foreground text-center">
                  {item.period}
                </span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded" />
              <span>Sales</span>
            </div>
            {showTargets && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span>Target</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(data.reduce((sum, d) => sum + d.sales, 0))}
              </p>
              <p className="text-sm text-muted-foreground">Total Sales</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {data.reduce((sum, d) => sum + d.orders, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Orders</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">
                {data.length > 0 ? formatCurrency(
                  data.reduce((sum, d) => sum + d.sales, 0) / data.length
                ) : '0'}
              </p>
              <p className="text-sm text-muted-foreground">Avg per {period.slice(0, -2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Customer Insights Component
interface CustomerInsight {
  id: string
  type: 'churn_risk' | 'frequent' | 'high_value' | 'loyal' | 'new'
  customer: {
    id: string
    name: string
    avatar?: string
  }
  metric: string
  change?: number
  priority: 'high' | 'low' | 'medium'
}

interface CustomerInsightsProps {
  insights: CustomerInsight[]
  onViewCustomer?: (customerId: string) => void
  className?: string
}

export const CustomerInsights = ({
  insights,
  onViewCustomer,
  className = ""
}: CustomerInsightsProps) => {
  const typeConfig = {
    high_value: { icon: DollarSign, color: 'text-muted-foreground', bgColor: 'bg-muted' },
    frequent: { icon: ShoppingCart, color: 'text-muted-foreground', bgColor: 'bg-muted' },
    new: { icon: Users, color: 'text-muted-foreground', bgColor: 'bg-muted' },
    churn_risk: { icon: AlertTriangle, color: 'text-red-600', bgColor: 'bg-red-100' },
    loyal: { icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-muted' }
  }

  const priorityColors = {
    low: 'border-border/20 bg-muted',
    medium: 'border-yellow-200 bg-yellow-50',
    high: 'border-red-200 bg-red-50'
  }

  return (
    <div className={cn("space-y-3", className)}>
      {insights.map((insight) => {
        const config = typeConfig[insight['type']]
        const Icon = config.icon

        return (
          <Card key={insight['id']} className={priorityColors[insight.priority]}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", config.bgColor)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{insight.customer.name}</h4>
                    {insight.change && (
                      <Badge variant={insight.change > 0 ? 'default' : 'secondary'}>
                        {insight.change > 0 ? '+' : ''}{insight.change}%
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.metric}
                  </p>

                  {onViewCustomer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCustomer(insight.customer['id'])}
                    >
                      View Customer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
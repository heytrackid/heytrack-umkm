import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCurrency } from '@/hooks/useCurrency'

const formatPercentage = (value: number, decimals: number = 1) => `${(value).toFixed(decimals)}%`

interface FinancialMetrics {
  revenue: number
  grossProfit: number
  grossMargin: number
  netMargin: number
  netProfit: number
  inventoryValue: number
}

interface OverviewTabProps {
  metrics: FinancialMetrics
  targetRevenue: number
  targetMargin: number
  revenueProgress: number
}

export function OverviewTab({ metrics, targetRevenue, targetMargin, revenueProgress }: OverviewTabProps) {
  const { formatCurrency } = useCurrency()

  return (
    <div className="space-y-4">
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
                <span>{((revenueProgress * 100) | 0)}%</span>
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
    </div>
  )
}

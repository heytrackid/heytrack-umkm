import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Target, Zap } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

const formatPercentage = (value: number, decimals: number = 1) => `${(value).toFixed(decimals)}%`

interface FinancialMetrics {
  revenue: number
  grossMargin: number
  netProfit: number
  inventoryValue: number
}

interface ActionsTabProps {
  metrics: FinancialMetrics
  targetRevenue: number
  targetMargin: number
  revenueProgress: number
  marginProgress: number
  onFinancialAction?: (action: string, data?: any) => void
}

export function ActionsTab({
  metrics,
  targetRevenue,
  targetMargin,
  revenueProgress,
  marginProgress,
  onFinancialAction
}: ActionsTabProps) {
  const { formatCurrency } = useCurrency()

  const priorityActions = [
    {
      title: 'Optimize Product Mix',
      description: 'Focus pada produk dengan margin tertinggi',
      priority: 'high' as const,
      action: 'review_products'
    },
    {
      title: 'Reduce COGS',
      description: 'Negosiasi supplier atau ganti supplier',
      priority: metrics.grossMargin < 50 ? 'high' as const : 'medium' as const,
      action: 'optimize_costs'
    },
    {
      title: 'Inventory Optimization',
      description: 'Kurangi inventory untuk improve cash flow',
      priority: metrics.inventoryValue > metrics.revenue * 0.3 ? 'high' as const : 'low' as const,
      action: 'optimize_inventory'
    },
    {
      title: 'Revenue Growth',
      description: 'Marketing campaign atau expand product line',
      priority: revenueProgress < 80 ? 'high' as const : 'medium' as const,
      action: 'grow_revenue'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Priority Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityActions.map((action, index) => (
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
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Lightbulb } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

const formatPercentage = (value: number, decimals: number = 1) => `${(value).toFixed(decimals)}%`

interface FinancialMetrics {
  revenue: number
  grossMargin: number
  netProfit: number
  inventoryValue: number
}

interface InsightsTabProps {
  recommendations: string[]
  metrics: FinancialMetrics
  targetRevenue: number
  targetMargin: number
}

export function InsightsTab({ recommendations, metrics, targetRevenue, targetMargin }: InsightsTabProps) {
  const { formatPercentage } = { formatPercentage: (value: number) => `${(value).toFixed(1)}%` }

  const businessHealthItems = [
    {
      name: 'Revenue Growth',
      score: Math.min((metrics.revenue / targetRevenue) * 100, 100),
      color: 'bg-green-500'
    },
    {
      name: 'Profitability',
      score: Math.min((metrics.grossMargin / targetMargin) * 100, 100),
      color: 'bg-blue-500'
    },
    {
      name: 'Cash Flow',
      score: metrics.netProfit > 0 ? 100 : 20,
      color: 'bg-yellow-500'
    },
    {
      name: 'Efficiency',
      score: Math.min(metrics.netProfit * 5, 100),
      color: 'bg-orange-500'
    }
  ]

  const overallScore = Math.round(businessHealthItems.reduce((sum, item) => sum + item.score, 0) / businessHealthItems.length)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Smart Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
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
            {businessHealthItems.map((item, index) => (
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
                  {overallScore}
                </div>
                <div className="text-sm text-blue-700 font-medium">Overall Health Score</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {overallScore > 80 ? 'Excellent Business Health!' :
                   overallScore > 60 ? 'Good Business Health' :
                   'Needs Improvement'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

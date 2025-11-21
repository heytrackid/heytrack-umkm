'use client'

import { LineChart } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState } from '@/components/ui/loading-state'
import { Separator } from '@/components/ui/separator'

interface HppAnalytics {
  totalRecipes: number
  totalCalculations: number
  averageHpp: number
  hppRange: {
    min: number
    max: number
  }
  marginAnalysis: {
    high: number
    medium: number
    low: number
  }
  costTrends: Array<{
    date: string
    averageHpp: number
    totalRecipes: number
  }>
  topCostDrivers: Array<{
    ingredient: string
    totalCost: number
    percentage: number
  }>
}

interface AnalyticsTabContentProps {
  analytics: HppAnalytics | null
  loading: boolean
  formatCurrency: (value: number) => string
}

const AnalyticsTabContent = ({ analytics, loading, formatCurrency }: AnalyticsTabContentProps): React.ReactNode => {
  if (loading) {
    return <LoadingState size="md" />
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {analytics.totalRecipes}
              </div>
              <div className="text-sm text-muted-foreground">Total Recipes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-muted-foreground">
                {analytics.totalCalculations}
              </div>
              <div className="text-sm text-muted-foreground">Calculations</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Average HPP</span>
              <span className="font-semibold">{formatCurrency(analytics.averageHpp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">HPP Range</span>
              <span className="text-sm">
                {formatCurrency(analytics.hppRange.min)} - {formatCurrency(analytics.hppRange.max)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Margin Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Margin Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
              <span className="text-sm font-medium">High Margin (30%+)</span>
              <Badge variant="secondary">{analytics.marginAnalysis.high} recipes</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-sm font-medium">Medium Margin (15-30%)</span>
              <Badge variant="outline">{analytics.marginAnalysis.medium} recipes</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-sm font-medium">Low Margin (&lt;15%)</span>
              <Badge variant="destructive">{analytics.marginAnalysis.low} recipes</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Trends Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            HPP Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Chart visualization removed
          </div>
        </CardContent>
      </Card>

      {/* Top Cost Drivers */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Top Cost Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topCostDrivers?.map((driver, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{driver.ingredient}</div>
                    <div className="text-sm text-muted-foreground">
                      {driver.percentage}% of total costs
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(driver.totalCost)}</div>
                  <div className="text-sm text-muted-foreground">{driver.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AnalyticsTabContent }

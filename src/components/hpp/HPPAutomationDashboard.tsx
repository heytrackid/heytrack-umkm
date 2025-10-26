'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, Calculator, RefreshCw, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useHPPAutomation } from '@/hooks'
import { useSettings } from '@/contexts/settings-context'

export function HPPAutomationDashboard() {
  const { formatCurrency } = useSettings()
  const { hppAnalysis, loading, refetch } = useHPPAutomation()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">HPP Automation Dashboard</h2>
            <p className="text-muted-foreground">Automated cost analysis and profitability monitoring</p>
          </div>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'profitable': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'break_even': return <Minus className="h-4 w-4 text-yellow-600" />
      case 'loss': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Calculator className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'profitable': return 'text-green-600'
      case 'break_even': return 'text-yellow-600'
      case 'loss': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HPP Automation Dashboard</h2>
          <p className="text-muted-foreground">Automated cost analysis and profitability monitoring</p>
        </div>
        <Button onClick={() => refetch()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${(loading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipes</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hppAnalysis.analyses.length}</div>
            <p className="text-xs text-muted-foreground">
              {hppAnalysis.recipes_with_data} with data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitability Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hppAnalysis.profitability_score.toFixed(1)}%</div>
            <Progress value={hppAnalysis.profitability_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{hppAnalysis.total_alerts}</div>
            <p className="text-xs text-muted-foreground">
              {hppAnalysis.critical_alerts} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipes Needing Data</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hppAnalysis.recipes_without_data}</div>
            <p className="text-xs text-muted-foreground">
              No HPP calculations yet
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Recipe Profitability Overview</CardTitle>
            <CardDescription>
              Current profitability status for all recipes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hppAnalysis.analyses.slice(0, 8).map((analysis) => (
                <div key={analysis.recipe_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(analysis.profitability_status)}
                    <div>
                      <p className="font-medium text-sm">{analysis.recipe_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {analysis.hasData ? `${analysis.margin_percentage.toFixed(1)}% margin` : 'No data'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        analysis.profitability_status === 'profitable' ? 'default' :
                        analysis.profitability_status === 'break_even' ? 'secondary' :
                        analysis.profitability_status === 'loss' ? 'destructive' : 'outline'
                      }
                      className="text-xs"
                    >
                      {analysis.profitability_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {analysis.hasData && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(analysis.selling_price)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {hppAnalysis.analyses.length > 8 && (
                <div className="text-center py-2">
                  <p className="text-sm text-muted-foreground">
                    +{hppAnalysis.analyses.length - 8} more recipes
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Recommendations</CardTitle>
            <CardDescription>
              Automated insights and action items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Critical Alerts */}
              {hppAnalysis.critical_alerts > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Critical Issues ({hppAnalysis.critical_alerts})
                  </h4>
                  {hppAnalysis.analyses
                    .flatMap(analysis => analysis.alerts)
                    .filter(alert => alert.severity === 'critical')
                    .slice(0, 3)
                    .map((alert) => (
                      <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-sm text-red-800">{alert.message}</p>
                        <p className="text-xs text-red-600 mt-1">{alert.recommendation}</p>
                      </div>
                    ))}
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommendations
                </h4>
                {hppAnalysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Summary by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Summary by Type</CardTitle>
          <CardDescription>
            Breakdown of alerts requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'no_data', label: 'No Data', color: 'bg-gray-100 text-gray-800' },
              { type: 'margin_decline', label: 'Low Margin', color: 'bg-yellow-100 text-yellow-800' },
              { type: 'unprofitable', label: 'Loss Making', color: 'bg-red-100 text-red-800' },
              { type: 'high_overhead', label: 'High Overhead', color: 'bg-orange-100 text-orange-800' }
            ].map(({ type, label, color }) => {
              const count = hppAnalysis.analyses
                .flatMap(analysis => analysis.alerts)
                .filter(alert => alert.type === type)
                .length

              return (
                <div key={type} className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color}`}>
                    {count}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

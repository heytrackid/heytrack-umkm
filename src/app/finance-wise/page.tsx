'use client'

import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import {
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    CheckCircle2,
    DollarSign,
    Download,
    RefreshCw,
    Sparkles,
    TrendingDown,
    TrendingUp
} from '@/components/icons';
import { PageHeader } from '@/components/layout';
import { AppLayout } from '@/components/layout/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards';
import { useFinanceWiseDashboard } from '@/hooks/api/useFinanceWise';
import { formatCurrentCurrency } from '@/lib/currency';
import type { FinancialHealth } from '@/services/ai';
import { useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';

export default function FinanceWisePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const { 
    summary, 
    health, 
    forecast, 
    profitAnalysis,
    aiInsights,
    isLoading,
    isError,
    error,
    refresh: refreshMutation,
    isRefreshing
  } = useFinanceWiseDashboard(
    dateRange?.from && dateRange?.to ? { 
      startDate: dateRange.from.toISOString().split('T')[0]!, 
      endDate: dateRange.to.toISOString().split('T')[0]!
    } : undefined
  )

  // Prepare chart data
  const forecastChartData = useMemo(() => {
    if (!forecast) return []
    return forecast.map(item => ({
      month: item.month,
      revenue: Number(item.projectedRevenue),
      expenses: Number(item.projectedExpenses),
      profit: Number(item.projectedProfit),
      confidence: item.confidence
    }))
  }, [forecast])

  const profitChartData = useMemo(() => {
    if (!profitAnalysis) return []
    return profitAnalysis.productProfitability.slice(0, 8).map(item => ({
      name: item.name,
      profit: Number(item.profit),
      revenue: Number(item.revenue),
      margin: item.margin
    }))
  }, [profitAnalysis])

  // Calculate average margin from product profitability
  const averageMargin = useMemo(() => {
    if (!profitAnalysis?.productProfitability.length) return 0
    const totalMargin = profitAnalysis.productProfitability.reduce((sum, p) => sum + p.margin, 0)
    return totalMargin / profitAnalysis.productProfitability.length
  }, [profitAnalysis])

  const pieChartData = useMemo(() => {
    if (!summary) return []
    return [
      { name: 'Revenue', value: Number(summary.revenue), color: '#10b981' },
      { name: 'Expenses', value: Number(summary.expenses), color: '#ef4444' },
      { name: 'Profit', value: Number(summary.profit), color: '#3b82f6' }
    ].filter(item => item.value > 0)
  }, [summary])

  if (isError) {
    return (
      <AppLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Gagal memuat data FinanceWise AI'}
            </AlertDescription>
          </Alert>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <PageHeader
          title="FinanceWise AI"
          description="Cash Flow Intelligence & Financial Insights powered by AI"
          actions={
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="Pilih rentang tanggal"
              />
              <Button 
                onClick={() => {
                  // TODO: Implement export functionality
                  // Export to PDF/Excel will be implemented here
                }}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button 
                onClick={refreshMutation} 
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          }
        />

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Financial Health Score */}
            {health && <FinancialHealthCard health={health} />}

            {/* Summary Stats */}
            {summary && (
              <UiStatsCards
                stats={([
                  {
                    title: 'Revenue',
                    value: formatCurrentCurrency(summary.revenue),
                    icon: DollarSign,
                    footer: (
                      <p className={`text-xs flex items-center gap-1 mt-1 ${
                        (summary.revenueGrowth ?? 0) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(summary.revenueGrowth ?? 0) >= 0
                          ? <ArrowUpRight className="h-3 w-3" />
                          : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(summary.revenueGrowth ?? 0).toFixed(1)}%
                      </p>
                    ),
                  },
                  {
                    title: 'Expenses',
                    value: formatCurrentCurrency(summary.expenses),
                    icon: TrendingDown,
                    footer: (
                      <p className={`text-xs flex items-center gap-1 mt-1 ${
                        (summary.expenseGrowth ?? 0) <= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(summary.expenseGrowth ?? 0) <= 0
                          ? <ArrowUpRight className="h-3 w-3" />
                          : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(summary.expenseGrowth ?? 0).toFixed(1)}%
                      </p>
                    ),
                  },
                  {
                    title: 'Profit',
                    value: formatCurrentCurrency(summary.profit),
                    icon: TrendingUp,
                    footer: (
                      <p className={`text-xs flex items-center gap-1 mt-1 ${
                        (summary.profitMargin ?? 0) >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {(summary.profitMargin ?? 0) >= 0
                          ? <ArrowUpRight className="h-3 w-3" />
                          : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(summary.profitMargin ?? 0).toFixed(1)}% margin
                      </p>
                    ),
                  },
                  {
                    title: 'Runway',
                    value: health ? `${health.runway.toFixed(1)} bulan` : '-',
                    icon: Calendar,
                  },
                ] satisfies StatCardData[])}
                gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4"
              />
            )}

            {/* Financial Overview Pie Chart */}
            {summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>
                    Revenue, Expenses, and Profit breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry: { name: string; value: number; color: string }, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [formatCurrentCurrency(value), '']}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Legend Cards */}
                  <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-3 mt-6">
                    {pieChartData.map((item: { name: string; value: number; color: string }, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div 
                            className="w-4 h-4 rounded mr-3"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold">
                          {formatCurrentCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            {aiInsights && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>AI Insights & Recommendations</CardTitle>
                  </div>
                  <CardDescription>
                    Analisis cerdas berdasarkan data keuangan Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br />') }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Cash Flow Forecast */}
            {forecast && forecast.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Forecast</CardTitle>
                  <CardDescription>
                    Proyeksi 3 bulan ke depan berdasarkan trend historis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Interactive Chart */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forecastChartData}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#888' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#888' }}
                            tickFormatter={(value: number) => `Rp${(value / 1000000).toFixed(0)}jt`}
                          />
                          <Tooltip 
                            formatter={(value: number) => [formatCurrentCurrency(value), '']}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ fill: '#10b981', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Revenue"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="expenses" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            dot={{ fill: '#ef4444', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Expenses"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="profit" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Profit"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Detailed Forecast Cards */}
                    <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-3">
                      {forecast.map((forecastItem, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{forecastItem.month}</h4>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {forecastItem.confidence}%
                              </p>
                            </div>
                            <Badge variant="outline">
                              {forecastItem.projectedProfit >= 0 ? 'Profit' : 'Loss'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Revenue</p>
                              <p className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrentCurrency(forecastItem.projectedRevenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Expenses</p>
                              <p className="font-semibold text-red-600 dark:text-red-400">
                                {formatCurrentCurrency(forecastItem.projectedExpenses)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Profit</p>
                              <p className={`font-semibold ${
                                forecastItem.projectedProfit >= 0 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {formatCurrentCurrency(forecastItem.projectedProfit)}
                              </p>
                            </div>
                          </div>

                          {forecastItem.factors.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {forecastItem.factors.map((factor, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {factor}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Profit Analysis */}
            {profitAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Profit Analysis by Product</CardTitle>
                  <CardDescription>
                    Analisis profitabilitas per produk dengan margin dan volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Interactive Bar Chart */}
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={profitChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11 }}
                            tickLine={{ stroke: '#888' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={{ stroke: '#888' }}
                            tickFormatter={(value: number) => `Rp${(value / 1000000).toFixed(0)}jt`}
                          />
                          <Tooltip 
                            formatter={(value: number, name: string) => [
                              formatCurrentCurrency(value), 
                              name === 'profit' ? 'Profit' : 'Revenue'
                            ]}
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="revenue" 
                            fill="#10b981" 
                            name="Revenue"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            dataKey="profit" 
                            fill="#3b82f6" 
                            name="Profit"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-3">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Most Profitable</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          {profitAnalysis.productProfitability[0]?.name || 'N/A'}
                        </p>
                        <p className="text-lg font-bold">
                          {formatCurrentCurrency(profitAnalysis.productProfitability[0]?.profit || 0)}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Average Margin</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {averageMargin.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {profitAnalysis.productProfitability.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Alerts */}
            {health && health.alerts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Alerts & Warnings</h3>
                {health.alerts.map((alert: { title: string; message: string; severity: 'critical' | 'warning' | 'info' }, index: number) => (
                  <Alert 
                    key={index}
                    variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                    className={alert.severity === 'warning' ? 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20' : ''}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.message}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}

// Components
function FinancialHealthCard({ health }: { health: FinancialHealth }) {
  const statusConfig = {
    excellent: { color: 'bg-green-500', text: 'Excellent', icon: CheckCircle2 },
    good: { color: 'bg-blue-500', text: 'Good', icon: CheckCircle2 },
    warning: { color: 'bg-yellow-500', text: 'Warning', icon: AlertTriangle },
    critical: { color: 'bg-red-500', text: 'Critical', icon: AlertTriangle },
  }

  const config = statusConfig[health.status]
  const Icon = config.icon

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <CardTitle>Financial Health Score</CardTitle>
            <CardDescription>Overall business financial status</CardDescription>
          </div>
          <Badge variant="outline" className={`${config.color} text-white border-0`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{health.score}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${config.color} transition-all duration-500`}
                  style={{ width: `${health.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {health.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Recommendations</h4>
              <ul className="space-y-1.5">
                {health.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5" />
                    <span className="text-muted-foreground">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

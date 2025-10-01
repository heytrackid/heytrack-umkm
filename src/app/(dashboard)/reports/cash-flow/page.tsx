'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, TrendingUp, TrendingDown, Minus, Download, RefreshCw } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type CashFlowData = {
  summary: {
    period: {
      start: string
      end: string
      type: string
    }
    total_income: number
    total_expenses: number
    net_cash_flow: number
    transaction_count: {
      income: number
      expenses: number
      total: number
    }
  }
  cash_flow_by_period: Array<{
    period: string
    income: number
    expenses: number
    net_cash_flow: number
    transaction_count: number
  }>
  category_breakdown: Array<{
    category: string
    total: number
    count: number
    percentage: number
    subcategories: Array<{
      name: string
      total: number
      count: number
    }>
  }>
  trend: {
    direction: 'increasing' | 'decreasing' | 'stable'
    change_amount: number
    change_percentage: number
    average_cash_flow: number
    highest_period: any
    lowest_period: any
  }
  comparison?: {
    previous_period: {
      start: string
      end: string
      total_income: number
      total_expenses: number
      net_cash_flow: number
    }
  }
  top_income_sources: Array<{
    description: string
    amount: number
    date: string
  }>
  top_expenses: Array<{
    description: string
    amount: number
    date: string
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

export default function CashFlowPage() {
  const [data, setData] = useState<CashFlowData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [period, setPeriod] = useState('daily')
  const [showComparison, setShowComparison] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        period: period,
        compare: showComparison.toString()
      })
      
      const response = await fetch(`/api/reports/cash-flow?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [startDate, endDate, period, showComparison])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return 'text-green-600'
      case 'decreasing':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchData}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cash Flow Report</h1>
        <p className="text-muted-foreground">
          Monitor your income and expenses over time
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Start Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[200px] justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Period */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Comparison Toggle */}
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Compare</label>
              <Button
                variant={showComparison ? "default" : "outline"}
                onClick={() => setShowComparison(!showComparison)}
              >
                {showComparison ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {/* Refresh */}
            <Button onClick={fetchData} variant="outline" className="ml-auto">
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>

            {/* Export */}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_income)}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.transaction_count.income} transactions
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_expenses)}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.transaction_count.expenses} transactions
            </p>
          </CardContent>
        </Card>

        {/* Net Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
            {getTrendIcon(data.trend.direction)}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              data.summary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency(data.summary.net_cash_flow)}
            </div>
            <p className={cn("text-xs", getTrendColor(data.trend.direction))}>
              {data.trend.direction === 'increasing' && '↑'}
              {data.trend.direction === 'decreasing' && '↓'}
              {' '}{Math.abs(data.trend.change_percentage).toFixed(1)}% from previous period
            </p>
          </CardContent>
        </Card>

        {/* Average Cash Flow */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.trend.average_cash_flow)}</div>
            <p className="text-xs text-muted-foreground">
              {data.cash_flow_by_period.length} periods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cash Flow Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.cash_flow_by_period}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Income"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Expenses"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net_cash_flow" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Net Cash Flow"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Net Cash Flow Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Net Cash Flow by Period</CardTitle>
            <CardDescription>Profit/Loss per period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.cash_flow_by_period}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar 
                  dataKey="net_cash_flow" 
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.category_breakdown}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.category} (${entry.percentage.toFixed(1)}%)`}
                  labelLine={false}
                >
                  {data.category_breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Income */}
        <Card>
          <CardHeader>
            <CardTitle>Top Income Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_income_sources.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(item.date), 'PPP')}</p>
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_expenses.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(item.date), 'PPP')}</p>
                  </div>
                  <div className="text-sm font-bold text-red-600">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison (if enabled) */}
      {showComparison && data.comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Period Comparison</CardTitle>
            <CardDescription>
              Current period vs {format(new Date(data.comparison.previous_period.start), 'PPP')} - {format(new Date(data.comparison.previous_period.end), 'PPP')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Income Change</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.summary.total_income - data.comparison.previous_period.total_income)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((data.summary.total_income / data.comparison.previous_period.total_income - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expense Change</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.summary.total_expenses - data.comparison.previous_period.total_expenses)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((data.summary.total_expenses / data.comparison.previous_period.total_expenses - 1) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cash Flow Change</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.summary.net_cash_flow - data.comparison.previous_period.net_cash_flow)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((data.summary.net_cash_flow / data.comparison.previous_period.net_cash_flow - 1) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

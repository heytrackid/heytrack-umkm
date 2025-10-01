'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon, TrendingUp, DollarSign, Percent, Package, Download, RefreshCw } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

type ProfitData = {
  summary: {
    period: {
      start: string
      end: string
      type: string
    }
    total_revenue: number
    total_cogs: number
    gross_profit: number
    gross_profit_margin: number
    total_operating_expenses: number
    net_profit: number
    net_profit_margin: number
    orders_count: number
  }
  profit_by_period: Array<{
    period: string
    revenue: number
    cogs: number
    gross_profit: number
    gross_margin: number
    orders_count: number
  }>
  product_profitability: Array<{
    product_name: string
    recipe_id: string
    total_revenue: number
    total_cogs: number
    total_quantity: number
    gross_profit: number
    gross_margin: number
    avg_selling_price: number
    avg_cost_per_unit: number
  }>
  cogs_breakdown: Array<{
    ingredient_name: string
    total_cost: number
    total_quantity: number
    wac: number
    percentage: number
  }>
  operating_expenses_breakdown: Array<{
    category: string
    total: number
    count: number
    percentage: number
  }>
  top_profitable_products: Array<any>
  least_profitable_products: Array<any>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#FF6B6B', '#4ECDC4']

export default function ProfitReportPage() {
  const [data, setData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(1)
    return date
  })
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [period, setPeriod] = useState('monthly')

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        period: period,
        include_breakdown: 'true'
      })
      
      const response = await fetch(`/api/reports/profit?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch profit data')
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
  }, [startDate, endDate, period])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
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
        <h1 className="text-3xl font-bold tracking-tight">Real Profit Report</h1>
        <p className="text-muted-foreground">
          Analyze profitability with WAC-based COGS calculation
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
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

            <Button onClick={fetchData} variant="outline" className="ml-auto">
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.orders_count} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.summary.gross_profit)}</div>
            <p className="text-xs text-muted-foreground">
              {data.summary.gross_profit_margin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Percent className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              data.summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency(data.summary.net_profit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.summary.net_profit_margin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COGS (WAC)</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.total_cogs)}</div>
            <p className="text-xs text-muted-foreground">
              {((data.summary.total_cogs / data.summary.total_revenue) * 100).toFixed(1)}% of revenue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Waterfall */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Waterfall</CardTitle>
          <CardDescription>Revenue breakdown to net profit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Revenue</span>
                <span className="text-sm font-bold">{formatCurrency(data.summary.total_revenue)}</span>
              </div>
              <Progress value={100} className="h-3 bg-blue-100" />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">- COGS</span>
                <span className="text-sm font-bold text-red-600">
                  -{formatCurrency(data.summary.total_cogs)}
                </span>
              </div>
              <Progress 
                value={(data.summary.total_cogs / data.summary.total_revenue) * 100} 
                className="h-3 bg-red-100"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">= Gross Profit</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(data.summary.gross_profit)} ({data.summary.gross_profit_margin.toFixed(1)}%)
                </span>
              </div>
              <Progress 
                value={data.summary.gross_profit_margin} 
                className="h-3 bg-green-100"
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">- Operating Expenses</span>
                <span className="text-sm font-bold text-orange-600">
                  -{formatCurrency(data.summary.total_operating_expenses)}
                </span>
              </div>
              <Progress 
                value={(data.summary.total_operating_expenses / data.summary.total_revenue) * 100} 
                className="h-3 bg-orange-100"
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-base font-bold">= Net Profit</span>
                <span className={cn(
                  "text-base font-bold",
                  data.summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatCurrency(data.summary.net_profit)} ({data.summary.net_profit_margin.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Profit Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Profit Trend Over Time</CardTitle>
            <CardDescription>Revenue, COGS, and profit margins</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={data.profit_by_period}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'Gross Margin %') return `${Number(value).toFixed(1)}%`
                    return formatCurrency(Number(value))
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="revenue" 
                  fill="#3b82f6"
                  name="Revenue"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="cogs" 
                  fill="#ef4444"
                  name="COGS"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="gross_profit" 
                  fill="#10b981"
                  name="Gross Profit"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="gross_margin" 
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Gross Margin %"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* COGS Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>COGS Breakdown by Ingredient</CardTitle>
            <CardDescription>Cost contribution (WAC-based)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.cogs_breakdown.slice(0, 6)}
                  dataKey="total_cost"
                  nameKey="ingredient_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => `${entry.ingredient_name} (${entry.percentage.toFixed(1)}%)`}
                >
                  {data.cogs_breakdown.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Operating Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Expenses</CardTitle>
            <CardDescription>Expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.operating_expenses_breakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  dataKey="category" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar 
                  dataKey="total" 
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Product Profitability */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Profitable Products</CardTitle>
            <CardDescription>By gross profit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.top_profitable_products.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.total_quantity} units · Avg: {formatCurrency(product.avg_selling_price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(product.gross_profit)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {product.gross_margin.toFixed(1)}% margin
                      </Badge>
                    </div>
                  </div>
                  <Progress value={product.gross_margin} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Least Profitable Products</CardTitle>
            <CardDescription>Products needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.least_profitable_products.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product.product_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.total_quantity} units · Cost: {formatCurrency(product.avg_cost_per_unit)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        product.gross_profit >= 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {formatCurrency(product.gross_profit)}
                      </p>
                      <Badge 
                        variant={product.gross_margin < 20 ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {product.gross_margin.toFixed(1)}% margin
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={Math.max(0, product.gross_margin)} 
                    className={cn(
                      "h-2",
                      product.gross_margin < 20 && "bg-red-100"
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown Tables */}
      <Card>
        <CardHeader>
          <CardTitle>COGS Ingredient Details</CardTitle>
          <CardDescription>Weighted Average Cost breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ingredient</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">WAC</th>
                  <th className="text-right p-2">Total Cost</th>
                  <th className="text-right p-2">% of COGS</th>
                </tr>
              </thead>
              <tbody>
                {data.cogs_breakdown.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.ingredient_name}</td>
                    <td className="text-right p-2">{item.total_quantity.toFixed(2)}</td>
                    <td className="text-right p-2">{formatCurrency(item.wac)}</td>
                    <td className="text-right p-2 font-bold">{formatCurrency(item.total_cost)}</td>
                    <td className="text-right p-2">
                      <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

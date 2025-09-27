'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart
} from 'lucide-react'

interface FinancialDataPoint {
  month: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

const mockData: FinancialDataPoint[] = [
  { month: 'Jan', revenue: 35000000, expenses: 25000000, profit: 10000000, margin: 28.6 },
  { month: 'Feb', revenue: 38000000, expenses: 27000000, profit: 11000000, margin: 28.9 },
  { month: 'Mar', revenue: 42000000, expenses: 30000000, profit: 12000000, margin: 28.6 },
  { month: 'Apr', revenue: 45000000, expenses: 32000000, profit: 13000000, margin: 28.9 },
  { month: 'May', revenue: 48000000, expenses: 34000000, profit: 14000000, margin: 29.2 },
  { month: 'Jun', revenue: 52000000, expenses: 36000000, profit: 16000000, margin: 30.8 }
]

export default function FinancialTrendsChart() {
  const [selectedChart, setSelectedChart] = useState<'line' | 'bar' | 'area'>('line')
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '2y'>('6m')

  const formatCurrency = (value: number) => {
    return `Rp ${(value / 1000000).toFixed(0)}M`
  }

  const renderChart = () => {
    const commonProps = {
      data: mockData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    }

    switch (selectedChart) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="revenue" fill="#16a34a" name="Revenue" />
            <Bar dataKey="expenses" fill="#dc2626" name="Expenses" />
            <Bar dataKey="profit" fill="#2563eb" name="Profit" />
          </BarChart>
        )
      
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1" 
              stroke="#16a34a" 
              fill="#16a34a" 
              fillOpacity={0.6}
              name="Revenue" 
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stackId="2" 
              stroke="#dc2626" 
              fill="#dc2626" 
              fillOpacity={0.6}
              name="Expenses" 
            />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stackId="3" 
              stroke="#2563eb" 
              fill="#2563eb" 
              fillOpacity={0.6}
              name="Profit" 
            />
          </AreaChart>
        )
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={2} name="Profit" />
          </LineChart>
        )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Financial Trends
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Analisis tren keuangan 6 bulan terakhir
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedChart === 'line' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChart('line')}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedChart === 'bar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChart('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedChart === 'area' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedChart('area')}
            >
              <PieChart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">+48.5%</div>
            <p className="text-xs text-muted-foreground">Revenue Growth</p>
            <Badge variant="default" className="bg-green-100 text-green-800 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Excellent
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">+44.0%</div>
            <p className="text-xs text-muted-foreground">Expense Growth</p>
            <Badge variant="outline" className="mt-1">
              Controlled
            </Badge>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">+60.0%</div>
            <p className="text-xs text-muted-foreground">Profit Growth</p>
            <Badge variant="default" className="bg-blue-100 text-blue-800 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Outstanding
            </Badge>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-6 space-y-3 border-t pt-4">
          <h4 className="font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Key Insights
          </h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              <span>Revenue menunjukkan pertumbuhan konsisten sebesar 48.5% dalam 6 bulan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Profit margin stabil di atas 28%, menunjukkan efisiensi operasional yang baik</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <span>Pertumbuhan expenses terkendali, tidak melebihi pertumbuhan revenue</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
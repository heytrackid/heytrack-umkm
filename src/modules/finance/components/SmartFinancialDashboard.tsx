'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Calendar,
  AlertCircle
} from 'lucide-react'

export default function SmartFinancialDashboard() {
  const [financialData, setFinancialData] = useState({
    revenue: 45000000,
    expenses: 32000000,
    profit: 13000000,
    margin: 28.9,
    monthlyGrowth: 12.5,
    yearlyTarget: 150000000
  })

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Smart Financial Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Analisis keuangan real-time dengan insights otomatis
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Rp {financialData.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Rp {financialData.expenses.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Rp {financialData.profit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Net Profit</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {financialData.margin}%
              </div>
              <p className="text-xs text-muted-foreground">Profit Margin</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Monthly Growth</span>
                <Badge variant="default" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                 {financialData.monthlyGrowth}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Profit Margin</span>
                <Badge variant="outline">
                  {financialData.margin}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Yearly Target Progress</span>
                <Badge variant="secondary">
                  {((financialData.revenue / financialData.yearlyTarget) * 100).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Financial Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Performa Baik</p>
                  <p className="text-xs text-muted-foreground">
                    Margin profit di atas target industri 25%
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Growth Trend</p>
                  <p className="text-xs text-muted-foreground">
                    Pertumbuhan konsisten selama 3 bulan terakhir
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analysis Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Financial Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed financial analysis will be displayed here
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Trend Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Financial trends and patterns will be displayed here
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="forecast" className="space-y-4">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Financial Forecast</h3>
                <p className="text-sm text-muted-foreground">
                  Predicted financial performance will be displayed here
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
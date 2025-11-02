'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { Download, FileText, FileSpreadsheet, FileImage, Calendar, BarChart3, LineChart, Table, TrendingUp, type LucideIcon } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import { dbLogger } from '@/lib/logger'
import { useResponsive } from '@/hooks/useResponsive'
import { PageHeader, SharedStatsCards } from '@/components/shared'
import { HppCostTrendsChart } from '@/modules/hpp'

type HppExportFormat = 'pdf' | 'excel' | 'csv' | 'json'
type HppExportMetric = 'hpp' | 'margin' | 'cost_breakdown' | 'trends' | 'alerts' | 'recommendations'

type ExportFormat = HppExportFormat
type ExportMetric = HppExportMetric

interface ReportConfig {
  dateRange: {
    start: string
    end: string
  }
  recipeIds: string[]
  metrics: ExportMetric[]
  format: ExportFormat
  includeCharts: boolean
}

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

const reportsBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'Reports' }
]

const HppReportsPage = () => {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const { isMobile } = useResponsive()

  const [config, setConfig] = useState<ReportConfig>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
      end: new Date().toISOString().split('T')[0] || ''
    },
    recipeIds: [],
    metrics: ['hpp', 'margin', 'cost_breakdown'],
    format: 'pdf',
    includeCharts: true
  })

  const [analytics, setAnalytics] = useState<HppAnalytics | null>(null)
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    try {
      void setLoading(true)

      // Load analytics data - mock data for now
      const mockAnalytics: HppAnalytics = {
        totalRecipes: 15,
        totalCalculations: 127,
        averageHpp: 28500,
        hppRange: {
          min: 15000,
          max: 45000
        },
        marginAnalysis: {
          high: 8,
          medium: 5,
          low: 2
        },
        costTrends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '',
          averageHpp: 28000 + Math.random() * 4000,
          totalRecipes: 12 + Math.floor(Math.random() * 6)
        })).reverse(),
        topCostDrivers: [
          { ingredient: 'Tepung Terigu', totalCost: 1250000, percentage: 28 },
          { ingredient: 'Gula Pasir', totalCost: 980000, percentage: 22 },
          { ingredient: 'Telur', totalCost: 765000, percentage: 17 },
          { ingredient: 'Mentega', totalCost: 612000, percentage: 14 },
          { ingredient: 'Susu', totalCost: 489000, percentage: 11 },
          { ingredient: 'Coklat', totalCost: 367000, percentage: 8 }
        ]
      }

      void setAnalytics(mockAnalytics)

    } catch (err: unknown) {
      dbLogger.error({ err }, 'Failed to load HPP analytics')
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      })
    } finally {
      void setLoading(false)
    }
  }

  const generateReport = async () => {
    try {
      void setGenerating(true)

      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({
        title: 'Success',
        description: `Report generated successfully in ${config.format.toUpperCase()} format`,
      })

    } catch (err: unknown) {
      dbLogger.error({ err }, 'Failed to generate report')
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      })
    } finally {
      void setGenerating(false)
    }
  }

  const exportData = (format: ExportFormat) => {
    try {
      void setGenerating(true)
      toast({
        title: 'Export Not Available',
        description: 'Export feature has been removed',
        variant: 'destructive'
      })

    } catch (err: unknown) {
      dbLogger.error({ err }, `Failed to export ${format}`)
      toast({
        title: 'Export Failed',
        description: `Failed to export ${format.toUpperCase()} file`,
        variant: 'destructive'
      })
    } finally {
      void setGenerating(false)
    }
  }

  const formatOptions: Array<{ value: ExportFormat; label: string; icon: LucideIcon }> = [
    { value: 'pdf', label: 'PDF Report', icon: FileText },
    { value: 'excel', label: 'Excel Spreadsheet', icon: FileSpreadsheet },
    { value: 'csv', label: 'CSV Data', icon: FileText },
    { value: 'json', label: 'JSON Data', icon: FileText }
  ]

  const metricOptions: Array<{ value: ExportMetric; label: string }> = [
    { value: 'hpp', label: 'HPP Values' },
    { value: 'margin', label: 'Profit Margins' },
    { value: 'cost_breakdown', label: 'Cost Breakdown' },
    { value: 'trends', label: 'Cost Trends' },
    { value: 'alerts', label: 'Price Alerts' },
    { value: 'recommendations', label: 'AI Recommendations' }
  ]

  const isExportFormat = (value: string): value is ExportFormat =>
    formatOptions.some((option) => option.value === value)

  return (
    <AppLayout pageTitle="HPP Reports & Analytics">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="HPP Reports"
          description="Generate laporan mendalam mengenai biaya produksi, tren HPP, dan performa resep"
          breadcrumbs={reportsBreadcrumbs}
        />

        {/* Stats Cards */}
        <SharedStatsCards
          stats={[
            {
              title: "Total Reports",
              value: "0",
              subtitle: "Jumlah laporan yang dibuat",
              icon: <FileImage className="h-4 w-4" />
            },
            {
              title: "Reports Generated",
              value: "0",
              subtitle: "Laporan yang telah dihasilkan",
              icon: <BarChart3 className="h-4 w-4" />
            },
            {
              title: "Data Points",
              value: "0",
              subtitle: "Titik data yang dianalisis",
              icon: <Table className="h-4 w-4" />
            },
            {
              title: "Scheduled Reports",
              value: "0",
              subtitle: "Laporan terjadwal aktif",
              icon: <Calendar className="h-4 w-4" />
            }
          ]}
        />

        <SwipeableTabs defaultValue="analytics" className="space-y-6">
          <SwipeableTabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <SwipeableTabsTrigger value="analytics">Analytics</SwipeableTabsTrigger>
            <SwipeableTabsTrigger value="reports">Reports</SwipeableTabsTrigger>
            <SwipeableTabsTrigger value="export">Export</SwipeableTabsTrigger>
            <SwipeableTabsTrigger value="insights">Insights</SwipeableTabsTrigger>
          </SwipeableTabsList>

          {/* Analytics Tab */}
          <SwipeableTabsContent value="analytics" className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {analytics.totalRecipes}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Recipes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
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
                      <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
                    <HppCostTrendsChart data={analytics.costTrends} />
                  </CardContent>
                </Card>

                {/* Top Cost Drivers */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Cost Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.topCostDrivers.map((driver, index) => (
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
            ) : null}
          </SwipeableTabsContent>

          {/* Reports Tab */}
          <SwipeableTabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={config.dateRange.start}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={config.dateRange.end}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                {/* Format */}
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select
                    value={config.format}
                    onValueChange={(value) => {
                      if (isExportFormat(value)) {
                        setConfig(prev => ({ ...prev, format: value }))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Metrics */}
                <div className="space-y-2">
                  <Label>Metrics to Include</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {metricOptions.map((metric) => (
                      <div key={metric.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={metric.value}
                          checked={config.metrics.includes(metric.value)}
                          onChange={(e) => {
                            const { checked } = e.target
                            setConfig(prev => ({
                              ...prev,
                              metrics: checked
                                ? prev.metrics.includes(metric.value)
                                  ? prev.metrics
                                  : [...prev.metrics, metric.value]
                                : prev.metrics.filter(m => m !== metric.value)
                            }))
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={metric.value} className="text-sm">{metric.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={generateReport}
                  disabled={generating}
                  className="w-full"
                >
                  {generating ? 'Generating Report...' : 'Generate Report'}
                </Button>
              </CardContent>
            </Card>
          </SwipeableTabsContent>

          {/* Export Tab */}
          <SwipeableTabsContent value="export" className="space-y-6">
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
              {formatOptions.map((option) => (
                <Card key={option.value} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center space-y-4">
                    <option.icon className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="font-semibold">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        Export data in {option.label.toLowerCase()} format
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => exportData(option.value)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </SwipeableTabsContent>

          {/* Insights Tab */}
          <SwipeableTabsContent value="insights" className="space-y-6">
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Card>
                <CardHeader>
                  <CardTitle>Cost Optimization Opportunities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Supplier Negotiation</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      3 ingredients have potential cost savings of 12% through bulk purchasing
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">Recipe Optimization</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      5 recipes can reduce costs by optimizing ingredient quantities
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold">Seasonal Pricing</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Peak season pricing can increase margins by 15-20%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Most Profitable Recipe</span>
                      <Badge variant="secondary">Nasi Goreng Special</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Highest Cost Recipe</span>
                      <Badge variant="outline">Seafood Paella</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Best Margin Category</span>
                      <Badge variant="secondary">Desserts</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cost Volatility</span>
                      <Badge variant="destructive">High (15%)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SwipeableTabsContent>
        </SwipeableTabs>
      </div>
    </AppLayout>
  )
}

export default HppReportsPage


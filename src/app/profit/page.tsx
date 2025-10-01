'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/use-mobile'
import PrefetchLink from '@/components/ui/prefetch-link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Receipt,
  Download,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProfitData {
  summary: {
    total_revenue: number
    total_cogs: number
    gross_profit: number
    gross_profit_margin: number
    total_operating_expenses: number
    net_profit: number
    net_profit_margin: number
  }
  products: Array<{
    product_name: string
    quantity_sold: number
    revenue: number
    cogs: number
    profit: number
    profit_margin: number
  }>
  ingredients: Array<{
    ingredient_name: string
    quantity_used: number
    wac_cost: number
    total_cost: number
  }>
  operating_expenses: Array<{
    category: string
    total_amount: number
  }>
  trends: {
    revenue_trend: number
    profit_trend: number
  }
}

export default function ProfitReportPage() {
  const { formatCurrency } = useSettings()
  const { isMobile } = useResponsive()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)
  
  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchProfitData()
  }, [selectedPeriod, startDate, endDate])

  const fetchProfitData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Calculate date range based on period
      const today = new Date()
      let calculatedStartDate = startDate
      let calculatedEndDate = endDate || today.toISOString().split('T')[0]
      
      if (!startDate) {
        if (selectedPeriod === 'week') {
          calculatedStartDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0]
        } else if (selectedPeriod === 'month') {
          calculatedStartDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        } else if (selectedPeriod === 'quarter') {
          const quarter = Math.floor(today.getMonth() / 3)
          calculatedStartDate = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
        } else if (selectedPeriod === 'year') {
          calculatedStartDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        }
      }

      const params = new URLSearchParams()
      if (calculatedStartDate) params.append('start_date', calculatedStartDate)
      if (calculatedEndDate) params.append('end_date', calculatedEndDate)

      const response = await fetch(`/api/reports/profit?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data laporan laba')
      }

      const data = await response.json()
      setProfitData(data)
    } catch (err: any) {
      console.error('Error fetching profit data:', err)
      setError(err.message || 'Terjadi kesalahan saat mengambil data')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      params.append('export', format)

      const response = await fetch(`/api/reports/profit?${params.toString()}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-laba-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error exporting report:', err)
      alert('Gagal mengekspor laporan')
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Memuat laporan laba...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchProfitData}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  if (!profitData) {
    return null
  }

  const { summary, products, ingredients, operating_expenses, trends } = profitData

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Laporan Laba Riil</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'justify-between items-center'}`}>
          <div>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Laporan Laba Riil
            </h1>
            <p className="text-muted-foreground">
              Analisis keuntungan dengan metode WAC (Weighted Average Cost)
            </p>
          </div>
          
          <div className={`flex gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
            <Button 
              variant="outline" 
              onClick={() => exportReport('csv')}
              className={isMobile ? 'w-full' : ''}
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => exportReport('xlsx')}
              className={isMobile ? 'w-full' : ''}
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor Excel
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter Periode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-4'}`}>
              <div>
                <label className="text-sm font-medium mb-2 block">Periode</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Minggu Ini</SelectItem>
                    <SelectItem value="month">Bulan Ini</SelectItem>
                    <SelectItem value="quarter">Kuartal Ini</SelectItem>
                    <SelectItem value="year">Tahun Ini</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPeriod === 'custom' && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
              
              <div className="flex items-end">
                <Button onClick={fetchProfitData} className="w-full">
                  Terapkan Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {/* Total Revenue */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</p>
                  {trends?.revenue_trend && trends.revenue_trend !== 0 && (
                    <p className={`text-xs flex items-center gap-1 mt-1 ${
                      trends.revenue_trend > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trends.revenue_trend > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(trends.revenue_trend).toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gross Profit */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Laba Kotor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.gross_profit)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margin: {summary.gross_profit_margin.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Laba Bersih
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${
                    summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(summary.net_profit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margin: {summary.net_profit_margin.toFixed(1)}%
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  {summary.net_profit >= 0 ? (
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* COGS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Harga Pokok Penjualan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_cogs)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Metode: WAC
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Profitability */}
        <Card>
          <CardHeader>
            <CardTitle>Profitabilitas Produk</CardTitle>
            <CardDescription>
              Analisis keuntungan per produk menggunakan WAC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Produk</th>
                    <th className="text-right py-3 px-4 font-medium">Terjual</th>
                    <th className="text-right py-3 px-4 font-medium">Pendapatan</th>
                    <th className="text-right py-3 px-4 font-medium">HPP</th>
                    <th className="text-right py-3 px-4 font-medium">Laba</th>
                    <th className="text-right py-3 px-4 font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{product.product_name}</td>
                      <td className="py-3 px-4 text-right">{product.quantity_sold}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(product.revenue)}</td>
                      <td className="py-3 px-4 text-right text-orange-600">
                        {formatCurrency(product.cogs)}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${
                        product.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(product.profit)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant={product.profit_margin >= 30 ? 'default' : 'secondary'}>
                          {product.profit_margin.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Ingredient Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Biaya Bahan Baku (WAC)</CardTitle>
            <CardDescription>
              Rincian biaya bahan baku dengan metode Weighted Average Cost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Bahan Baku</th>
                    <th className="text-right py-3 px-4 font-medium">Jumlah Terpakai</th>
                    <th className="text-right py-3 px-4 font-medium">Harga WAC</th>
                    <th className="text-right py-3 px-4 font-medium">Total Biaya</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{ingredient.ingredient_name}</td>
                      <td className="py-3 px-4 text-right">{ingredient.quantity_used.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(ingredient.wac_cost)}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(ingredient.total_cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Operating Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Biaya Operasional</CardTitle>
            <CardDescription>
              Rincian pengeluaran operasional periode ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {operating_expenses.map((expense, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="font-medium">{expense.category}</span>
                  </div>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(expense.total_amount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 border-t-2 font-bold">
                <span>Total Biaya Operasional</span>
                <span className="text-lg text-red-600">
                  {formatCurrency(summary.total_operating_expenses)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Laba Rugi</CardTitle>
            <CardDescription>
              Perhitungan laba dengan metode WAC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="font-medium">Total Pendapatan</span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(summary.total_revenue)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Harga Pokok Penjualan (WAC)</span>
                <span className="font-semibold text-orange-600">
                  - {formatCurrency(summary.total_cogs)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t">
                <span className="font-semibold">Laba Kotor</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(summary.gross_profit)} ({summary.gross_profit_margin.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-medium">Biaya Operasional</span>
                <span className="font-semibold text-red-600">
                  - {formatCurrency(summary.total_operating_expenses)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-primary">
                <span className="text-lg font-bold">Laba Bersih</span>
                <span className={`text-xl font-bold ${
                  summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.net_profit)} ({summary.net_profit_margin.toFixed(1)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  Tentang Metode WAC (Weighted Average Cost)
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  Laporan ini menggunakan metode WAC untuk menghitung Harga Pokok Penjualan (HPP). 
                  WAC menghitung rata-rata tertimbang dari semua pembelian bahan baku, memberikan 
                  gambaran biaya produksi yang lebih akurat dibanding FIFO atau LIFO.
                </p>
                <p className="text-blue-800 dark:text-blue-200">
                  <strong>Formula:</strong> Laba Bersih = Pendapatan - HPP (WAC) - Biaya Operasional
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

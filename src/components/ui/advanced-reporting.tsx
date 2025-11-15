'use client'

import {
    BarChart3,
    Download,
    Package,
    PiggyBank,
    Printer,
    ShoppingCart,
    TrendingUp
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { formatCurrentCurrency } from '@/lib/currency'



interface ReportData {
  totalSales: number
  totalOrders: number
  totalProfit: number
  salesData: Array<{ date: string; amount: number }>
  orderData: Array<{ date: string; count: number }>
  topProducts: Array<{ name: string; sales: number }>
  profitData: Array<{ date: string; amount: number }>
}

interface AdvancedReportingProps {
  reportData?: ReportData
}

export const AdvancedReporting = ({
  reportData
}: AdvancedReportingProps) => {

  const [activeReport, setActiveReport] = useState<'orders' | 'profit' | 'sales'>('sales')
  const [isExporting, setIsExporting] = useState(false)

  // Sample data if not provided
  const sampleData: ReportData = {
    totalSales: reportData?.totalSales ?? 45000000,
    totalOrders: reportData?.totalOrders ?? 142,
    totalProfit: reportData?.totalProfit ?? 12000000,
    salesData: reportData?.salesData ?? [
      { date: '2023-01', amount: 3500000 },
      { date: '2023-02', amount: 4200000 },
      { date: '2023-03', amount: 3800000 },
      { date: '2023-04', amount: 5100000 },
      { date: '2023-05', amount: 4800000 },
      { date: '2023-06', amount: 5500000 },
      { date: '2023-07', amount: 6200000 },
    ],
    orderData: reportData?.orderData ?? [
      { date: '2023-01', count: 24 },
      { date: '2023-02', count: 28 },
      { date: '2023-03', count: 22 },
      { date: '2023-04', count: 35 },
      { date: '2023-05', count: 31 },
      { date: '2023-06', count: 38 },
      { date: '2023-07', count: 42 },
    ],
    topProducts: reportData?.topProducts ?? [
      { name: 'Bakso Sapi', sales: 1250000 },
      { name: 'Sate Ayam', sales: 980000 },
      { name: 'Rendang', sales: 870000 },
      { name: 'Soto Ayam', sales: 760000 },
      { name: 'Nasi Goreng', sales: 650000 },
    ],
    profitData: reportData?.profitData ?? [
      { date: '2023-01', amount: 1000000 },
      { date: '2023-02', amount: 1200000 },
      { date: '2023-03', amount: 1100000 },
      { date: '2023-04', amount: 1400000 },
      { date: '2023-05', amount: 1300000 },
      { date: '2023-06', amount: 1500000 },
      { date: '2023-07', amount: 1700000 },
    ]
  }



  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // Export completed - in production, this would trigger actual export
      void format
    }, 1500)
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Laporan Lanjutan
          </h2>
          <p className="text-muted-foreground mt-1">
            Analisis performa bisnis Anda dengan data real-time
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Cetak
          </Button>
          <div className="relative">
            <Button variant="outline" size="sm" disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              Export {isExporting && '...'}
            </Button>
            {isExporting && (
              <div className="absolute inset-0 bg-black/20 dark:bg-black/40 rounded-md flex items-center justify-center">
                 <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Penjualan</p>
              <p className="text-xl font-bold">{formatCurrentCurrency(sampleData.totalSales)}</p>
              <Badge variant="secondary" className="mt-1">+12.5% dari bulan lalu</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pesanan</p>
              <p className="text-xl font-bold">{sampleData.totalOrders}</p>
              <Badge variant="secondary" className="mt-1">+8.2% dari bulan lalu</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
              <PiggyBank className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Keuntungan</p>
              <p className="text-xl font-bold">{formatCurrentCurrency(sampleData.totalProfit)}</p>
              <Badge variant="secondary" className="mt-1">+15.3% dari bulan lalu</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium">Laporan:</h3>
        <Button
          variant={activeReport === 'sales' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('sales')}
        >
          Penjualan
        </Button>
        <Button
          variant={activeReport === 'orders' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('orders')}
        >
          Pesanan
        </Button>
        <Button
          variant={activeReport === 'profit' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveReport('profit')}
        >
          Keuntungan
        </Button>
      </div>

      {/* Data Summary */}
      <div className="bg-background rounded-xl border p-4">
        <h3 className="text-lg font-semibold mb-4">
          Data Summary
        </h3>
        <div className="h-64 sm:h-80 flex items-center justify-center">
          <div className="text-center space-y-4">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Data summary for {activeReport}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">+12%</p>
                <p className="text-sm text-muted-foreground">Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="bg-secondary rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <span className="font-medium">{product.name}</span>
                </div>
                <span className="font-semibold">{formatCurrentCurrency(product.sales)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import AppLayout from '@/components/layout/app-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/useSupabase'
import {
  BarChart3,
  Calendar,
  Download
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ExcelExportButton = dynamic(() => import('@/components/export/ExcelExportButton'), {
  ssr: false
})

export default function ReportsPage() {
  const { formatCurrency } = useCurrency()
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    end: new Date().toISOString().split('T')[0] // Today
  })
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  // Fetch data
  const { data: orders } = useSupabaseCRUD('orders')
  const { data: ingredients } = useSupabaseCRUD('ingredients')
  const { data: financialRecords } = useSupabaseCRUD('financial_records')

  // Calculate sales report
  const salesData = orders?.filter((order: unknown) => {
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    return orderDate >= dateRange.start && orderDate <= dateRange.end
  }) || []

  const salesStats = {
    totalOrders: salesData.length,
    totalRevenue: salesData.reduce((sum: number, order: unknown) => sum + (order.total_amount || 0), 0),
    completedOrders: salesData.filter((o: unknown) => o.status === 'DELIVERED').length,
    pendingOrders: salesData.filter((o: unknown) => o.status === 'PENDING' || o.status === 'CONFIRMED').length
  }

  // Calculate inventory report
  const inventoryStats = {
    totalItems: ingredients?.length || 0,
    lowStock: ingredients?.filter((i: unknown) => (i.current_stock || 0) <= (i.min_stock || 0)).length || 0,
    totalValue: ingredients?.reduce((sum: number, i: unknown) =>
      sum + ((i.current_stock || 0) * (i.price_per_unit || 0)), 0
    ) || 0,
    outOfStock: ingredients?.filter((i: unknown) => (i.current_stock || 0) === 0).length || 0
  }

  // Calculate financial report
  const financialData = financialRecords?.filter((record: unknown) => {
    const recordDate = new Date(record.date).toISOString().split('T')[0]
    return recordDate >= dateRange.start && recordDate <= dateRange.end
  }) || []

  const financialStats = {
    totalIncome: financialData.filter((r: unknown) => r.type === 'INCOME').reduce((sum: number, r: unknown) => sum + r.amount, 0),
    totalExpense: financialData.filter((r: unknown) => r.type === 'EXPENSE').reduce((sum: number, r: unknown) => sum + r.amount, 0),
    netProfit: 0,
    profitMargin: 0
  }
  financialStats.netProfit = financialStats.totalIncome - financialStats.totalExpense
  financialStats.profitMargin = financialStats.totalIncome > 0
    ? (financialStats.netProfit / financialStats.totalIncome) * 100
    : 0

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/">Dashboard</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Laporan</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Laporan
            </h1>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <PrefetchLink href="/">
                  Dashboard
                </PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage>Laporan</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Laporan
            </h1>
            <p className="text-muted-foreground">Analisis bisnis dan laporan keuangan</p>
          </div>
          <div className="flex gap-2">
            <ExcelExportButton variant="outline" />
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Date Range Picker */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev: unknown) => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev: unknown) => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <Button>
                <Calendar className="h-4 w-4 mr-2" />
                Terapkan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Penjualan</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="financial">Keuangan</TabsTrigger>
          </TabsList>

          {/* Sales Report */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{salesStats.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pendapatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Selesai
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{salesStats.completedOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{salesStats.pendingOrders}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detail Penjualan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {salesData.slice(0, 10).map((order: unknown) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.order_no}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Report */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{inventoryStats.totalItems}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Nilai Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{formatCurrency(inventoryStats.totalValue)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Stok Rendah
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600">{inventoryStats.lowStock}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Habis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">{inventoryStats.outOfStock}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financial Report */}
          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pemasukan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(financialStats.totalIncome)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Pengeluaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(financialStats.totalExpense)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Laba Bersih
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-2xl font-bold ${financialStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(financialStats.netProfit)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Margin Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {financialStats.profitMargin.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}

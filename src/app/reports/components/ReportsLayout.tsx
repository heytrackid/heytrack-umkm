'use client'

import { AlertCircle, ArrowDownIcon, ArrowUpIcon, Calendar, CheckCircle, DollarSign, Filter, Package, ShoppingCart, TrendingUp } from '@/components/icons'
import dynamic from 'next/dynamic'
import { useEffect, useState, type ReactNode } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { Skeleton } from '@/components/ui/skeleton'
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
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { SalesReport } from './SalesReport'

const InventoryReport = dynamic(
  () => import('./InventoryReport')
    .then(m => ({ default: m.InventoryReport }))
    .catch(() => {
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load inventory report</div> }
    }),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded" />
          <Skeleton className="h-64 rounded" />
        </div>
      </div>
    ),
    ssr: false
  }
)

const FinancialReport = dynamic(
  () => import('./FinancialReport')
    .then(m => ({ default: m.FinancialReport }))
    .catch(() => {
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load financial report</div> }
    }),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded" />
          <Skeleton className="h-48 rounded" />
        </div>
      </div>
    ),
    ssr: false
  }
)

const ProfitReport = dynamic(
  () => import('./ProfitReport')
    .then(m => ({ default: m.ProfitReport }))
    .catch(() => {
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load profit report</div> }
    }),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-16 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-24 rounded" />
          ))}
        </div>
        <Skeleton className="h-96 rounded" />
      </div>
    ),
    ssr: false
})

// Reports Layout - Main structure and navigation
// Contains breadcrumbs, header, and date range picker

interface ReportsLayoutProps {
  children?: ReactNode
}

export const ReportsLayout = ({ children }: ReportsLayoutProps) => {
  const [dateRange, setDateRange] = useState(() => {
    const start = new Date(new Date().setDate(1)).toISOString().substring(0, 10)
    const end = new Date().toISOString().substring(0, 10)
    return { start, end }
  })
  const [dateError, setDateError] = useState<string>('')

  // Fetch real dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats(dateRange.start, dateRange.end)

  // Helper function for responsive tab labels
  const getTabLabel = (full: string, short: string) => (
    <>
      <span className="hidden sm:inline">{full}</span>
      <span className="sm:hidden">{short}</span>
    </>
  )

  const validateDateRange = (start: string | undefined, end: string | undefined): boolean => {
    if (!start || !end) {return false}
    const startDate = new Date(start)
    const endDate = new Date(end)
    const today = new Date()
    const maxRange = 365 // Maximum 1 year range

    if (startDate > endDate) {
      setDateError('Tanggal mulai harus sebelum tanggal akhir')
      return false
    }

    if (endDate > today) {
      setDateError('Tanggal akhir tidak boleh melebihi hari ini')
      return false
    }

    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays > maxRange) {
      setDateError(`Rentang tanggal maksimal ${maxRange} hari`)
      return false
    }

    setDateError('')
    return true
  }

  const handleDateChange = (field: 'end' | 'start', value: string) => {
    const newRange = { ...dateRange, [field]: value } as { start: string; end: string }
    if (validateDateRange(newRange.start, newRange.end)) {
      setDateRange(newRange)
    }
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

        <PageHeader
          title="Laporan"
          description="Lihat laporan bisnis Anda"
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Penjualan
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    Rp {stats?.revenue.today.toLocaleString('id-ID') || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stats?.revenue.trend === 'up' ? (
                      <ArrowUpIcon className="h-3 w-3 text-green-600" />
                    ) : (
                      <ArrowDownIcon className="h-3 w-3 text-red-600" />
                    )}
                    {stats?.revenue.growth}% dari periode sebelumnya
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Laba Bersih
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    Rp {stats?.expenses.netProfit.toLocaleString('id-ID') || '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Berdasarkan pengeluaran periode ini
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stok Rendah
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.inventory?.lowStock || 0} Item</div>
                  <p className="text-xs text-muted-foreground">
                    {(stats?.inventory?.lowStock ?? 0) > 0 ? 'Perlu restock segera' : 'Stok dalam kondisi baik'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pesanan
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : statsError ? (
                <div className="text-sm text-red-600">Error loading data</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.orders.today || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Pesanan dalam periode ini
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Date Range Picker */}
        <Card className="border-0 ">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Laporan
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {/* Quick Presets */}
                <div>
                   <p className="text-sm font-medium mb-2">Periode Cepat:</p>
                  <div aria-label="Periode Cepat" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                   <Button
                     variant="outline"
                     size="sm"
                       onClick={() => {
                         const today = new Date().toISOString().substring(0, 10)
                         setDateRange({ start: today, end: today })
                       }}
                   >
                     Hari Ini
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                       onClick={() => {
                         const end = new Date()
                         const start = new Date(end)
                         start.setDate(start.getDate() - 6)
                         const startStr: string = start.toISOString().substring(0, 10)
                         const endStr: string = end.toISOString().substring(0, 10)
                           setDateRange({ start: startStr, end: endStr })
                       }}
                   >
                     7 Hari
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                      onClick={() => {
                        const end = new Date()
                        const start = new Date(end)
                        start.setDate(start.getDate() - 29)
                         const startStr = start.toISOString().substring(0, 10)
                         const endStr = end.toISOString().substring(0, 10)
                        if (validateDateRange(startStr, endStr)) {
                            setDateRange({ start: startStr, end: endStr })
                        }
                      }}
                   >
                     30 Hari
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       const now = new Date()
                       const start = new Date(now.getFullYear(), now.getMonth(), 1)
                       const startStr = start.toISOString().split('T')[0]
                       const endStr = now.toISOString().split('T')[0]
                       if (validateDateRange(startStr, endStr)) {
                           setDateRange({ start: startStr as string, end: endStr as string })
                       }
                     }}
                   >
                     Bulan Ini
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       const now = new Date()
                       const quarter = Math.floor(now.getMonth() / 3)
                       const start = new Date(now.getFullYear(), quarter * 3, 1)
                       const startStr = start.toISOString().split('T')[0]
                       const endStr = now.toISOString().split('T')[0]
                       if (validateDateRange(startStr, endStr)) {
                           setDateRange({ start: startStr as string, end: endStr as string })
                       }
                     }}
                   >
                     Kuartal Ini
                   </Button>
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       const now = new Date()
                       const start = new Date(now.getFullYear(), 0, 1)
                       const startStr = start.toISOString().split('T')[0]
                       const endStr = now.toISOString().split('T')[0]
                       if (validateDateRange(startStr, endStr)) {
                           setDateRange({ start: startStr as string, end: endStr as string })
                       }
                     }}
                   >
                     Tahun Ini
                   </Button>
                 </div>
               </div>

               {/* Custom Date Range */}
               <div className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-4 items-end">
                   <div className="flex-1">
                     <label htmlFor="tanggal-mulai" className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                     <input
                       id="tanggal-mulai"
                       type="date"
                       value={dateRange.start}
                       onChange={(e) => handleDateChange('start', e.target.value)}
                       className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        max={new Date().toISOString().split('T')[0]}
                     />
                   </div>
                   <div className="flex-1">
                     <label htmlFor="tanggal-akhir" className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                     <input
                       id="tanggal-akhir"
                       type="date"
                       value={dateRange.end}
                       onChange={(e) => handleDateChange('end', e.target.value)}
                       className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        max={new Date().toISOString().split('T')[0]}
                     />
                   </div>
                   <Button className="w-full sm:w-auto" disabled={Boolean(dateError)}>
                     <Calendar className="h-4 w-4 mr-2" />
                     Terapkan Filter
                   </Button>
                 </div>

                 {/* Date Validation Error */}
                 {dateError && (
                   <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-md">
                     <AlertCircle className="h-4 w-4 flex-shrink-0" />
                     <span>{dateError}</span>
                   </div>
                 )}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <div className="w-full overflow-hidden">
          <SwipeableTabs defaultValue="profit" className="space-y-4">
            <SwipeableTabsList className="h-12 w-full">
              <SwipeableTabsTrigger value="profit" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:">
                <TrendingUp className="h-4 w-4 mr-2" />
                {getTabLabel('Laba Rugi', 'Laba')}
              </SwipeableTabsTrigger>
              <SwipeableTabsTrigger value="sales" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {getTabLabel('Penjualan', 'Sales')}
              </SwipeableTabsTrigger>
              <SwipeableTabsTrigger value="inventory" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:">
                <Package className="h-4 w-4 mr-2" />
                {getTabLabel('Inventory', 'Inv')}
              </SwipeableTabsTrigger>
              <SwipeableTabsTrigger value="financial" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:">
                <DollarSign className="h-4 w-4 mr-2" />
                {getTabLabel('Keuangan', 'Fin')}
              </SwipeableTabsTrigger>
            </SwipeableTabsList>

          <SwipeableTabsContent value="profit">
            <ProfitReport dateRange={dateRange} />
          </SwipeableTabsContent>

          <SwipeableTabsContent value="sales">
            <SalesReport dateRange={dateRange} />
          </SwipeableTabsContent>

          <SwipeableTabsContent value="inventory">
            <InventoryReport dateRange={dateRange} />
          </SwipeableTabsContent>

          <SwipeableTabsContent value="financial">
            <FinancialReport dateRange={dateRange} />
          </SwipeableTabsContent>
        </SwipeableTabs>
        </div>

        {children}
      </div>
    </AppLayout>
  )
}

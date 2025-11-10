'use client'

import { BarChart3, Calendar, AlertCircle, Filter, CheckCircle, TrendingUp, ShoppingCart, Package, DollarSign } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useState, type ReactNode } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
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

const SalesReport = dynamic(() => import('./SalesReport').then(m => ({ default: m.SalesReport })), {
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    </div>
  ),
  ssr: false
})

const InventoryReport = dynamic(() => import('./InventoryReport').then(m => ({ default: m.InventoryReport })), {
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-muted/50 rounded animate-pulse" />
        <div className="h-64 bg-muted/50 rounded animate-pulse" />
      </div>
    </div>
  ),
  ssr: false
})

const FinancialReport = dynamic(() => import('./FinancialReport').then(m => ({ default: m.FinancialReport })), {
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-48 bg-muted/50 rounded animate-pulse" />
        <div className="h-48 bg-muted/50 rounded animate-pulse" />
      </div>
    </div>
  ),
  ssr: false
})

const EnhancedProfitReport = dynamic(() => import('./EnhancedProfitReport').then(m => ({ default: m.EnhancedProfitReport })), {
  loading: () => (
    <div className="space-y-4">
      <div className="h-16 bg-muted/50 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-muted/50 rounded animate-pulse" />
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

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              Laporan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analisis bisnis dan laporan keuangan
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Penjualan
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 12.500.000</div>
              <p className="text-xs text-muted-foreground">+12% dari bulan lalu</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Laba Bersih
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp 3.200.000</div>
              <p className="text-xs text-muted-foreground">+18% dari bulan lalu</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Stok Rendah
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Item</div>
              <p className="text-xs text-muted-foreground">Perlu restock segera</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pesanan
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+5 dari hari sebelumnya</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Date Range Picker */}
        <Card className="border-0 shadow-sm">
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
                 <label className="text-sm font-medium mb-2 block">Periode Cepat:</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
                     <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                     <input
                       type="date"
                       value={dateRange.start}
                       onChange={(e) => handleDateChange('start', e.target.value)}
                       className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        max={new Date().toISOString().split('T')[0]}
                     />
                   </div>
                   <div className="flex-1">
                     <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                     <input
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
              <SwipeableTabsTrigger value="profit" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                {getTabLabel('Profit & Loss', 'Profit')}
              </SwipeableTabsTrigger>
              <SwipeableTabsTrigger value="sales" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {getTabLabel('Penjualan', 'Sales')}
              </SwipeableTabsTrigger>
              <SwipeableTabsTrigger value="inventory" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-sm">
                <Package className="h-4 w-4 mr-2" />
                {getTabLabel('Inventory', 'Inv')}
              </SwipeableTabsTrigger>
              <SwipeableTabsTrigger value="financial" className="h-9 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-sm">
                <DollarSign className="h-4 w-4 mr-2" />
                {getTabLabel('Keuangan', 'Fin')}
              </SwipeableTabsTrigger>
            </SwipeableTabsList>

          <SwipeableTabsContent value="profit">
            <EnhancedProfitReport dateRange={dateRange} />
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

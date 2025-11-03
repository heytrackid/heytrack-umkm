import { useState, type ReactNode } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { BarChart3, Calendar } from 'lucide-react'
import SalesReport from './SalesReport'
import InventoryReport from './InventoryReport'
import FinancialReport from './FinancialReport'
import EnhancedProfitReport from './EnhancedProfitReport'

// Reports Layout - Main structure and navigation
// Contains breadcrumbs, header, and date range picker

interface ReportsLayoutProps {
  children?: ReactNode
}

export const ReportsLayout = ({ children }: ReportsLayoutProps) => {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of month
    end: new Date().toISOString().split('T')[0] // Today
  })

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
              <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8" />
              Laporan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analisis bisnis dan laporan keuangan
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Quick Presets */}
              <div>
                <label className="text-sm font-medium mb-2 block">Periode Cepat:</label>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const today = new Date().toISOString().split('T')[0]
                      void setDateRange({ start: today, end: today })
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
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      })
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
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                      })
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
                      setDateRange({
                        start: start.toISOString().split('T')[0],
                        end: now.toISOString().split('T')[0]
                      })
                    }}
                  >
                    Bulan Ini
                  </Button>
                </div>
              </div>

              {/* Custom Date Range */}
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <Button className="w-full sm:w-auto">
                  <Calendar className="h-4 w-4 mr-2" />
                  Terapkan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Tabs */}
        <SwipeableTabs defaultValue="profit" className="space-y-4">
          <SwipeableTabsList>
            <SwipeableTabsTrigger value="profit">Profit & Loss</SwipeableTabsTrigger>
            <SwipeableTabsTrigger value="sales">Penjualan</SwipeableTabsTrigger>
            <SwipeableTabsTrigger value="inventory">Inventory</SwipeableTabsTrigger>
            <SwipeableTabsTrigger value="financial">Keuangan</SwipeableTabsTrigger>
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

        {children}
      </div>
    </AppLayout>
  )
}

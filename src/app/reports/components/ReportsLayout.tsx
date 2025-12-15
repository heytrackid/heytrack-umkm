'use client'

import { ArrowDownIcon, ArrowUpIcon, CheckCircle, DollarSign, Package, ShoppingCart, TrendingUp } from '@/components/icons'
import { type ReactNode } from 'react'

import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { BreadcrumbPatterns, PageBreadcrumb } from '@/components/ui/index'
import { Skeleton } from '@/components/ui/skeleton'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useDashboardStats } from '@/hooks/api/useDashboard'
import { FinancialReport } from './FinancialReport'
import { InventoryReport } from './InventoryReport'
import { SalesReport } from './SalesReport'

// Reports Layout - Main structure and navigation
// Contains breadcrumbs, header, and report tabs

interface ReportsLayoutProps {
  children?: ReactNode
}

export const ReportsLayout = ({ children }: ReportsLayoutProps) => {

  // Fetch real dashboard stats
   const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()

  // Helper function for responsive tab labels
  const getTabLabel = (full: string, short: string) => (
    <>
      <span className="hidden sm:inline">{full}</span>
      <span className="sm:hidden">{short}</span>
    </>
  )





  return (
    <AppLayout>
      <div className="space-y-6">
        <PageBreadcrumb items={BreadcrumbPatterns.reports} />

        <PageHeader
          title="Laporan"
          description="Lihat laporan bisnis Anda"
        />

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Penjualan
                  </span>
                  <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : statsError ? (
                  <div className="text-xs text-red-600">
                    {statsError instanceof Error ? statsError.message : 'Error loading data'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      Rp {stats?.revenue.today.toLocaleString('id-ID') || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {stats?.revenue.trend === 'up' ? (
                        <ArrowUpIcon className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <ArrowDownIcon className="h-3 w-3 text-rose-600" />
                      )}
                      {stats?.revenue.growth}% dari periode sebelumnya
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Laba Bersih
                  </span>
                  <div className="p-2 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : statsError ? (
                  <div className="text-sm text-red-600">Error loading data</div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      Rp {stats?.expenses.netProfit.toLocaleString('id-ID') || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Berdasarkan pengeluaran periode ini
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Stok Rendah
                  </span>
                  <div className="p-2 bg-amber-100/50 dark:bg-amber-900/20 rounded-lg">
                    <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : statsError ? (
                  <div className="text-sm text-red-600">Error loading data</div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stats?.inventory?.lowStock || 0} Item</div>
                    <p className="text-xs text-muted-foreground">
                      {(stats?.inventory?.lowStock ?? 0) > 0 ? 'Perlu restock segera' : 'Stok dalam kondisi baik'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total Pesanan
                  </span>
                  <div className="p-2 bg-violet-100/50 dark:bg-violet-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                </div>
                {statsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : statsError ? (
                  <div className="text-sm text-red-600">Error loading data</div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{stats?.orders.today || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Pesanan dalam periode ini
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>



        {/* Reports Tabs */}
        <div className="w-full overflow-hidden">
          <SwipeableTabs defaultValue="sales" className="space-y-4">
            <SwipeableTabsList className="h-12 w-full">
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

           <SwipeableTabsContent value="sales">
             <SalesReport />
           </SwipeableTabsContent>

           <SwipeableTabsContent value="inventory">
             <InventoryReport />
           </SwipeableTabsContent>

           <SwipeableTabsContent value="financial">
             <FinancialReport />
           </SwipeableTabsContent>
        </SwipeableTabs>
        </div>

        {children}
      </div>
    </AppLayout>
  )
}

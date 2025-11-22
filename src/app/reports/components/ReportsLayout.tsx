'use client'

import { ArrowDownIcon, ArrowUpIcon, CheckCircle, DollarSign, Package, ShoppingCart, TrendingUp } from '@/components/icons'
import dynamic from 'next/dynamic'
import { type ReactNode } from 'react'

import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { Skeleton } from '@/components/ui/skeleton'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useDashboardStats } from '@/hooks/api/useDashboard'
import { createClientLogger } from '@/lib/client-logger'
import { SalesReport } from './SalesReport'

const logger = createClientLogger('ReportsLayout')

const logDynamicImportError = (label: string, error: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    logger.error({ label, error: error instanceof Error ? error.message : String(error) }, 'Component load failure')
  }
}

const InventoryReport = dynamic(
  () => import('./InventoryReport')
    .then(m => ({ default: m.InventoryReport }))
    .catch((error) => {
      logDynamicImportError('Inventory report', error)
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
    .catch((error) => {
      logDynamicImportError('Financial report', error)
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
                <div className="text-xs text-red-600">
                  {statsError instanceof Error ? statsError.message : 'Error loading data'}
                </div>
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

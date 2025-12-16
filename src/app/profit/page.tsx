'use client'

import { AlertCircle, Download } from '@/components/icons'

import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChartComponent } from '@/components/ui/charts'
import { StatsSkeleton } from '@/components/ui/index'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { Skeleton } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/useResponsive'


import {
    IngredientCostsTable,
    OperatingExpenses,
    ProductProfitabilityTable,
    ProfitBreakdown,
    // Lightweight components (tables, filters, cards)
    ProfitFilters,
    ProfitInfoCard,
    ProfitSummaryCards,
    useProfitData
} from '@/app/profit/components/index'

const ProfitReportPage = () => {
  const { isMobile } = useResponsive()

  // Simple currency formatter
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const {
    loading,
    error,
    profitData,
    filters,
    updateFilters,
    refetch,
    exportReport
  } = useProfitData()

  // Chart data removed - no longer using charts

  // Error state
  if (error) {
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

          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={refetch}>Coba Lagi</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  const {
    summary = {
      total_revenue: 0,
      total_cogs: 0,
      gross_profit: 0,
      gross_profit_margin: 0,
      total_operating_expenses: 0,
      net_profit: 0,
      net_profit_margin: 0
    },
    products = [],
    ingredients = [],
    operating_expenses = []
  } = profitData ?? {}

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb - Always visible */}
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

        {/* Header - Always visible */}
        <PageHeader
          title="Laporan Laba Riil"
          description="Analisis keuntungan dengan metode WAC (Weighted Average Cost)"
          action={
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                onClick={() => exportReport('csv')}
                className="flex-1 sm:flex-none"
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => exportReport('xlsx')}
                className="flex-1 sm:flex-none"
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          }
        />

        {/* Main Content */}
        {loading ? (
          // ✅ Loading skeleton
          <div className="space-y-6">
            {/* Filters Loading */}
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-4">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards Loading */}
            <StatsSkeleton count={4} />

            {/* Charts Loading */}
            <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="h-[350px] bg-muted animate-pulse rounded flex items-center justify-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="h-[350px] bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            </div>

            {/* Tables Loading */}
            {[1, 2, 3].map((i) => (
              <Card key={`table-skeleton-${i}`}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="space-y-2">
                      {Array.from({ length: 3 }, (_, j) => (
                        <div key={`row-${j}`} className="h-12 bg-muted rounded" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Filters */}
            <ProfitFilters
              filters={filters}
              onFiltersChange={updateFilters}
              onApplyFilters={refetch}
              isMobile={isMobile}
            />

            {/* Summary Cards */}
            {profitData?.trends && (
              <ProfitSummaryCards
                summary={summary}
                trends={profitData.trends}
                formatCurrency={formatCurrency}
                isMobile={isMobile}
              />
            )}

            {/* Product Profitability Charts */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 grid-cols-1 lg:grid-cols-2'}`}>
              <BarChartComponent
                data={products.slice(0, 10).map(p => ({ 
                  name: p.product_name.length > 15 ? p.product_name.substring(0, 15) + '...' : p.product_name, 
                  Pendapatan: p.revenue, 
                  Laba: p.profit 
                }))}
                title="Pendapatan vs Laba per Produk"
                description="Top 10 produk berdasarkan pendapatan"
                dataKey={['Pendapatan', 'Laba']}
                xAxisKey="name"
                height={isMobile ? 250 : 300}
                config={{
                  Pendapatan: { label: 'Pendapatan', color: '#3b82f6' },
                  Laba: { label: 'Laba', color: '#10b981' }
                }}
              />
              <BarChartComponent
                data={products.slice(0, 10).map(p => ({ 
                  name: p.product_name.length > 15 ? p.product_name.substring(0, 15) + '...' : p.product_name, 
                  Margin: p.profit_margin 
                }))}
                title="Margin Laba per Produk"
                description="Persentase margin laba kotor"
                dataKey="Margin"
                xAxisKey="name"
                height={isMobile ? 250 : 300}
                config={{
                  Margin: { label: 'Margin (%)', color: '#8b5cf6' }
                }}
              />
            </div>

            {/* Product Profitability Table */}
            <ProductProfitabilityTable
              products={products}
              formatCurrency={formatCurrency}
            />

            {/* Ingredient Costs */}
            <IngredientCostsTable
              ingredients={ingredients}
              formatCurrency={formatCurrency}
            />

            {/* Operating Expenses */}
            <OperatingExpenses
              operating_expenses={operating_expenses}
              summary={summary}
              formatCurrency={formatCurrency}
            />

            {/* Profit Breakdown */}
            <ProfitBreakdown
              summary={summary}
              formatCurrency={formatCurrency}
            />

            {/* Info Card */}
            <ProfitInfoCard />
          </>
        )}
      </div>
    </AppLayout>
  )
}

export default ProfitReportPage
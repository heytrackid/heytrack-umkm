'use client'

import { AlertCircle, Download, Loader2 } from 'lucide-react'
import { Suspense } from 'react'

import { PageHeader } from '@/components/layout'
import { AppLayout } from '@/components/layout/app-layout'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StatsSkeleton } from '@/components/ui/index'
import { PrefetchLink } from '@/components/ui/prefetch-link'
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

  // Loading skeleton helper functions to avoid unstable nested components
  const renderProfitInfoSkeleton = () => (
    Array.from({ length: 5 }, (_, i) => (
      <div key={`profit-info-${i}`} className="h-12 bg-muted rounded" />
    ))
  )

  const renderIngredientCostSkeleton = () => (
    Array.from({ length: 3 }, (_, i) => (
      <div key={`ingredient-cost-${i}`} className="h-12 bg-muted rounded" />
    ))
  )

  const renderOperatingExpenseSkeleton = () => (
    Array.from({ length: 4 }, (_, i) => (
      <div key={`operating-expense-${i}`} className="h-10 bg-muted rounded" />
    ))
  )

  const renderProfitBreakdownSkeleton = () => (
    Array.from({ length: 6 }, (_, i) => (
      <div key={`profit-breakdown-${i}`} className="h-6 bg-muted rounded" />
    ))
  )

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
                  <div className="grid gap-4 md:grid-cols-4">
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
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="h-[350px] bg-muted animate-pulse rounded flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
          <Suspense fallback={
            <div className="space-y-6">
              {/* Filters Loading */}
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="grid gap-4 md:grid-cols-4">
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

                {/* Product Profitability Table Loading */}
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="space-y-2">
                      {renderProfitInfoSkeleton()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredient Costs Loading */}
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="space-y-2">
                      {renderIngredientCostSkeleton()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operating Expenses Loading */}
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="space-y-2">
                      {renderOperatingExpenseSkeleton()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profit Breakdown Loading */}
              <Card>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="space-y-2">
                      {renderProfitBreakdownSkeleton()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card Loading */}
              <Card className="border-border/20 bg-muted ">
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          }>
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
          </Suspense>
        )}
      </div>
    </AppLayout>
  )
}

export default ProfitReportPage
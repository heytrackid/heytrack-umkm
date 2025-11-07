'use client'

import { AlertCircle, PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Suspense } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatsSkeleton, CardSkeleton } from '@/components/ui'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb' 
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PrefetchLink from '@/components/ui/prefetch-link'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/useResponsive'

// Import components directly - no lazy loading for better parallel loading
import CategoryBreakdown from './components/CategoryBreakdown'
import EnhancedCashFlowChart from './components/EnhancedCashFlowChart'
import EnhancedSummaryCards from './components/EnhancedSummaryCards'
import EnhancedTransactionForm from './components/EnhancedTransactionForm'
import EnhancedTransactionList from './components/EnhancedTransactionList'
import FilterPeriod from './components/FilterPeriod'
import { useEnhancedCashFlow } from './hooks/useEnhancedCashFlow'

// Summary cards skeleton component
const SummaryCardsSkeleton = (): JSX.Element[] => (
  Array.from({ length: 3 }, (_, i) => (
    <div key={`summary-card-${i}`} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
  ))
)

const CashFlowPage = (): JSX.Element => {
  const { formatCurrency } = useSettings()
  const { isMobile } = useResponsive()

  // Use the enhanced hook for all cash flow logic
  const {
    loading,
    error,
    cashFlowData,
    comparison,
    selectedPeriod,
    startDate,
    endDate,
    isAddDialogOpen,
    transactionType,
    chartData,
    transactions,
    summary,
    setSelectedPeriod,
    setStartDate,
    setEndDate,
    setIsAddDialogOpen,
    setTransactionType,
    fetchCashFlowData,
    handleAddTransaction,
    handleDeleteTransaction
  } = useEnhancedCashFlow()

  // Loading state
  if (loading && !cashFlowData) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <StatsSkeleton count={4} />
          <CardSkeleton rows={6} />
        </div>
      </AppLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Terjadi Kesalahan</h3>
              <p className="text-muted-foreground mb-2">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Periksa koneksi internet Anda atau coba lagi dalam beberapa saat
              </p>
              <Button onClick={fetchCashFlowData}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
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
                <PrefetchLink href="/">Dashboard</PrefetchLink>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Arus Kas</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <PageHeader
          title="Arus Kas"
          description="Kelola semua transaksi pemasukan dan pengeluaran"
          action={
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              disabled={loading}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          }
        />

        {/* Main Content - Single Suspense boundary for parallel loading */}
        <Suspense fallback={
          <div className="space-y-6">
            {/* Filters Loading */}
            <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />

            {/* Summary Cards Loading */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
              <SummaryCardsSkeleton />
            </div>

            {/* Chart Loading */}
            <div className="h-80 bg-gray-100 animate-pulse rounded-lg" />

            {/* Transactions Loading */}
            <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />

            {/* Category Breakdown Loading */}
            <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
          </div>
        }>
          {/* Enhanced Transaction Form Dialog */}
          <EnhancedTransactionForm
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
            onSubmit={handleAddTransaction}
            loading={loading}
          />

          {/* Quick Actions for Mobile */}
          {isMobile && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setTransactionType('income')
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <ArrowUpCircle className="h-6 w-6 text-gray-600" />
                    <span className="text-sm">Pemasukan</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => {
                      setTransactionType('expense')
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <ArrowDownCircle className="h-6 w-6 text-red-600" />
                    <span className="text-sm">Pengeluaran</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <FilterPeriod
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            onApplyFilters={fetchCashFlowData}
            loading={loading}
            isMobile={isMobile}
          />

          {/* Enhanced Summary Cards */}
          <EnhancedSummaryCards
            summary={summary}
            comparison={comparison}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
          />

          {/* Enhanced Cash Flow Trend Chart */}
          <EnhancedCashFlowChart
            chartData={chartData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            isMobile={isMobile}
          />

          {/* Enhanced Transactions List */}
          <EnhancedTransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            formatCurrency={formatCurrency}
            loading={loading}
          />

          {/* Category Breakdown */}
          <CategoryBreakdown
            summary={summary}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
          />
        </Suspense>
      </div>
    </AppLayout>
  )
}

export default CashFlowPage

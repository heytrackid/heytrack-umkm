'use client'

import { lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/useResponsive'
import PrefetchLink from '@/components/ui/prefetch-link'
import { Download, AlertCircle, Loader2 } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { StatsSkeleton, CardSkeleton } from '@/components/ui'

// Lazy load extracted components for better performance and code splitting
const TransactionForm = lazy(() => import('./components/TransactionForm'))
const SummaryCards = lazy(() => import('./components/SummaryCards'))
const CashFlowChart = lazy(() => import('./components/CashFlowChart'))
const TransactionList = lazy(() => import('./components/TransactionList'))
const CategoryBreakdown = lazy(() => import('./components/CategoryBreakdown'))
const FilterPeriod = lazy(() => import('./components/FilterPeriod'))

import { useCashFlow } from './hooks/useCashFlow'

export default function CashFlowPage() {
  const { formatCurrency } = useSettings()
  const { isMobile } = useResponsive()

  // Use the custom hook for all cash flow logic
  const {
    loading,
    error,
    cashFlowData,
    selectedPeriod,
    startDate,
    endDate,
    isAddDialogOpen,
    transactionType,
    formData,
    chartData,
    transactions,
    summary,
    setSelectedPeriod,
    setStartDate,
    setEndDate,
    setIsAddDialogOpen,
    setTransactionType,
    setFormData,
    fetchCashFlowData,
    handleAddTransaction,
    handleDeleteTransaction,
    exportReport
  } = useCashFlow()

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
              <p className="text-muted-foreground mb-4">{error}</p>
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
        <div className={`flex gap-4 ${isMobile ? 'flex-col' : 'justify-between items-center'}`}>
          <div>
            <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              Arus Kas
            </h1>
            <p className="text-muted-foreground">
              Kelola semua transaksi pemasukan dan pengeluaran
            </p>
          </div>

          <div className={`flex gap-2 ${isMobile ? 'flex-col w-full' : ''}`}>
            <Button className={isMobile ? 'w-full' : ''} onClick={() => setIsAddDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>

            <Button
              variant="outline"
              onClick={() => exportReport('csv')}
              className={isMobile ? 'w-full' : ''}
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor
            </Button>
          </div>
        </div>

        {/* Transaction Form Dialog */}
        <Suspense fallback={null}>
          <TransactionForm
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
            onSubmit={handleAddTransaction}
            loading={loading}
          />
        </Suspense>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse rounded-lg" />}>
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
        </Suspense>

        {/* Summary Cards */}
        <Suspense fallback={
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        }>
          <SummaryCards
            summary={summary}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
          />
        </Suspense>

        {/* Cash Flow Trend Chart */}
        <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-lg" />}>
          <CashFlowChart
            chartData={chartData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            isMobile={isMobile}
          />
        </Suspense>

        {/* Transactions List */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
          <TransactionList
            transactions={transactions}
            onDeleteTransaction={handleDeleteTransaction}
            formatCurrency={formatCurrency}
            loading={loading}
          />
        </Suspense>

        {/* Category Breakdown */}
        <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
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

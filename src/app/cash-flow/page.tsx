'use client'

import { lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/useResponsive'
import PrefetchLink from '@/components/ui/prefetch-link'
import { Download, AlertCircle, PlusCircle, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { StatsSkeleton, CardSkeleton } from '@/components/ui'

// Lazy load enhanced components for better performance and code splitting
const EnhancedTransactionForm = lazy(() => import('./components/EnhancedTransactionForm'))
const EnhancedSummaryCards = lazy(() => import('./components/EnhancedSummaryCards'))
const EnhancedCashFlowChart = lazy(() => import('./components/EnhancedCashFlowChart'))
const EnhancedTransactionList = lazy(() => import('./components/EnhancedTransactionList'))
const CategoryBreakdown = lazy(() => import('./components/CategoryBreakdown'))
const FilterPeriod = lazy(() => import('./components/FilterPeriod'))

import { useEnhancedCashFlow } from './hooks/useEnhancedCashFlow'

export default function CashFlowPage() {
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
            <Button
              className={isMobile ? 'w-full' : ''}
              onClick={() => setIsAddDialogOpen(true)}
              disabled={loading}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>

          </div>
        </div>

        {/* Enhanced Transaction Form Dialog */}
        <Suspense fallback={null}>
          <EnhancedTransactionForm
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            transactionType={transactionType}
            onTransactionTypeChange={setTransactionType}
            onSubmit={handleAddTransaction}
            loading={loading}
          />
        </Suspense>

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
                  <ArrowUpCircle className="h-6 w-6 text-green-600" />
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

        {/* Enhanced Summary Cards */}
        <Suspense fallback={
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
            ))}
          </div>
        }>
          <EnhancedSummaryCards
            summary={summary}
            comparison={comparison}
            formatCurrency={formatCurrency}
            isMobile={isMobile}
          />
        </Suspense>

        {/* Enhanced Cash Flow Trend Chart */}
        <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-lg" />}>
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
        </Suspense>

        {/* Enhanced Transactions List */}
        <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg" />}>
          <EnhancedTransactionList
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

'use client'

import { Calendar } from '@/components/ui/calendar'
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, PlusCircle, Settings } from 'lucide-react'
import { Suspense, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CardSkeleton, StatsSkeleton } from '@/components/ui/index'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { useSettings } from '@/contexts/settings-context'
import { useResponsive } from '@/hooks/useResponsive'

// Import components directly - no lazy loading for better parallel loading
import { CategoryBreakdown } from '@/app/cash-flow/components/CategoryBreakdown'
import { CategoryManagementDialog } from '@/app/cash-flow/components/CategoryManagementDialog'
import { EnhancedCashFlowChart } from '@/app/cash-flow/components/EnhancedCashFlowChart'
import { EnhancedSummaryCards } from '@/app/cash-flow/components/EnhancedSummaryCards'
import { EnhancedTransactionForm } from '@/app/cash-flow/components/EnhancedTransactionForm'
import { EnhancedTransactionList } from '@/app/cash-flow/components/EnhancedTransactionList'
import { FilterPeriod } from '@/app/cash-flow/components/FilterPeriod'
import { useEnhancedCashFlow } from '@/app/cash-flow/hooks/useEnhancedCashFlow'

// Summary cards skeleton component
const SummaryCardsSkeleton = (): JSX.Element[] => (
  Array.from({ length: 3 }, (_, i) => (
    <div key={`summary-card-${i}`} className="h-24 bg-muted animate-pulse rounded-lg" />
  ))
)

const CashFlowPage = (): JSX.Element => {
  const { formatCurrency } = useSettings()
  const { isMobile } = useResponsive()
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)

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
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                disabled={loading}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Tambah Transaksi
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCategoryDialogOpen(true)}
                disabled={loading}
              >
                <Settings className="h-4 w-4 mr-2" />
                Kelola Kategori
              </Button>
            </div>
          }
        />

        {/* Mobile Calendar */}
        <div className="md:hidden mb-4">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="range"
                onSelect={(range) => {
                  if (!range) return
                  const params = new URLSearchParams(window.location.search)
                  if (range.from) params.set('from', range.from.toISOString())
                  if (range.to) params.set('to', range.to.toISOString())
                  const url = `${window.location.pathname}?${params.toString()}`
                  window.history.replaceState(null, '', url)
                }}
                numberOfMonths={1}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

         {/* Main Content - Single Suspense boundary for parallel loading */}
         <Suspense fallback={
           <div className="space-y-6">
             {/* Filters Loading */}
             <div className="h-32 bg-muted animate-pulse rounded-lg" />

             {/* Summary Cards Loading */}
             <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
               <SummaryCardsSkeleton />
             </div>

             {/* Chart Loading */}
             <div className={`h-80 bg-muted animate-pulse rounded-lg ${isMobile ? 'h-64' : 'h-80'}`} />

             {/* Transactions Loading */}
             <div className={`bg-muted animate-pulse rounded-lg ${isMobile ? 'h-80' : 'h-96'}`} />

             {/* Category Breakdown Loading */}
             <div className={`h-48 bg-muted animate-pulse rounded-lg ${isMobile ? 'h-40' : 'h-48'}`} />
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

          {/* Category Management Dialog */}
          <CategoryManagementDialog
            isOpen={isCategoryDialogOpen}
            onOpenChange={setIsCategoryDialogOpen}
          />

           {/* Quick Actions for Mobile */}
           {isMobile && (
             <Card className="border-2 border-dashed border-primary/20">
               <CardContent className="pt-6">
                 <h3 className="font-semibold mb-4 text-center">Aksi Cepat</h3>
                 <div className="grid grid-cols-2 gap-3">
                   <Button
                     variant="default"
                     className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
                     onClick={() => {
                       setTransactionType('income')
                       setIsAddDialogOpen(true)
                     }}
                   >
                     <ArrowUpCircle className="h-6 w-6" />
                     <span className="text-sm font-medium">Pemasukan</span>
                   </Button>
                   <Button
                     variant="default"
                     className="h-20 flex-col gap-2 bg-red-600 hover:bg-red-700"
                     onClick={() => {
                       setTransactionType('expense')
                       setIsAddDialogOpen(true)
                     }}
                   >
                     <ArrowDownCircle className="h-6 w-6" />
                     <span className="text-sm font-medium">Pengeluaran</span>
                   </Button>
                 </div>
                 <div className="mt-4 pt-4 border-t border-border/20">
                   <Button
                     variant="outline"
                     className="w-full"
                     onClick={() => setIsCategoryDialogOpen(true)}
                   >
                     <Settings className="h-4 w-4 mr-2" />
                     Kelola Kategori
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

           {/* Main Content Layout */}
           <div className={`space-y-6 ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
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
           </div>
        </Suspense>
      </div>
    </AppLayout>
  )
}

export { CashFlowPage }
export default CashFlowPage
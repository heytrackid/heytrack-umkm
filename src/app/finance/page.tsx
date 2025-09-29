'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useFinancialRecords } from '@/hooks/useDatabase'
import { useI18n } from '@/providers/I18nProvider'

// Lazy loading imports
import { SmartFinancialDashboardWithLoading } from '@/components/lazy/automation-features'
import { FinancialTrendsChartWithLoading } from '@/components/lazy/chart-features'
import { ProgressiveLoader } from '@/components/lazy/progressive-loading'

// Mobile UX imports
import { useResponsive } from '@/hooks/use-mobile'
import { PullToRefresh } from '@/components/ui/mobile-gestures'

// Dynamically load heavy sections with skeleton fallbacks
const FinancialSummaryCards = dynamic(() => import('./components/FinancialSummaryCards').then(m => m.FinancialSummaryCards), {
  loading: () => (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  ),
})

const FinancialFilters = dynamic(() => import('./components/FinancialFilters').then(m => m.FinancialFilters), {
  loading: () => (
    <Card>
      <CardContent className="p-6">
        <div className="h-10 rounded bg-muted animate-pulse mb-3" />
        <div className="h-10 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  ),
})

const QuickAnalytics = dynamic(() => import('./components/QuickAnalytics').then(m => m.QuickAnalytics), {
  loading: () => (
    <Card>
      <CardContent className="p-6">
        <div className="h-24 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  ),
})

const TransactionList = dynamic(() => import('./components/TransactionList').then(m => m.TransactionList), {
  loading: () => (
    <Card>
      <CardContent className="p-6">
        <div className="h-64 rounded bg-muted animate-pulse" />
      </CardContent>
    </Card>
  ),
})

const FinanceForm = dynamic(() => import('./components/FinanceForm').then(m => m.FinanceForm), {
  loading: () => <div className="h-64 rounded bg-muted animate-pulse" />,
})

const TransactionDetailView = dynamic(() => import('./components/TransactionDetailView').then(m => m.TransactionDetailView), {
  loading: () => <div className="h-32 rounded bg-muted animate-pulse" />,
})

import { Plus, Download, AlertTriangle } from 'lucide-react'

// Sample data removed - now using real data from API
// const sampleTransactions = [...]

export default function FinancePage() {
  const { data: financialRecords, loading: recordsLoading, error: recordsError } = useFinancialRecords()
  const { t } = useI18n()
  
  const transactionTypes = [
    { value: 'INCOME', label: t('finance.transactionTypes.income'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-green-800 dark:text-green-100' },
    { value: 'EXPENSE', label: t('finance.transactionTypes.expense'), color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-red-800 dark:text-red-100' }
  ]
  
  const incomeCategories = ['Penjualan', 'Investasi', 'Lain-lain']
  const expenseCategories = ['Bahan Baku', 'Gaji', 'Operasional', 'Equipment', 'Marketing', 'Transport']
  const paymentMethods = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET']
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState(t('finance.all'))
  const [categoryFilter, setCategoryFilter] = useState(t('finance.all'))
  const [dateFilter, setDateFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState(t('finance.all'))
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  // Mobile responsive hooks
  const { isMobile, isTablet } = useResponsive()
  
  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Data will automatically refresh via real-time subscription
    window.location.reload()
  }
  
  // Use real financial records or fallback to empty array
  const transactions = financialRecords || []
  
  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.reference_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === t('finance.all') || transaction.type === typeFilter
    const matchesCategory = categoryFilter === t('finance.all') || transaction.category === categoryFilter
    const matchesDate = !dateFilter || transaction.transaction_date === dateFilter
    return matchesSearch && matchesType && matchesCategory && matchesDate
  })

  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }


  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (t.amount || 0), 0)
  
  const netProfit = totalIncome - totalExpense
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome * 100) : 0

  const stats = {
    totalIncome,
    totalExpense,
    netProfit,
    profitMargin,
    totalTransactions: transactions.length
  }

  // Monthly summary (simplified for demo)
  const thisMonth = {
    income: totalIncome,
    expense: totalExpense,
    profit: netProfit
  }

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`flex gap-4 ${
            isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-3xl'
              }`}>{t('finance.title')}</h1>
              <p className="text-muted-foreground">{t('finance.description')}</p>
            </div>
            <div className={`flex gap-2 ${
              isMobile ? 'w-full flex-col' : ''
            }`}>
              <Button variant="outline" className={isMobile ? 'w-full' : ''}>
                <Download className="h-4 w-4 mr-2" />
                {t('common.actions.export')}
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className={isMobile ? 'w-full' : ''}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('finance.newTransaction')}
                  </Button>
                </DialogTrigger>
                <DialogContent className={`max-w-2xl ${
                  isMobile ? 'w-full mx-4 rounded-lg' : ''
                }`}>
                  <DialogHeader>
                    <DialogTitle className={isMobile ? 'text-lg' : ''}>
                      {t('finance.createNewTransaction')}
                    </DialogTitle>
                  </DialogHeader>
                  <Suspense fallback={<div className="h-64 rounded bg-muted animate-pulse" />}>
                    <FinanceForm onClose={() => setIsAddDialogOpen(false)} />
                  </Suspense>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Financial Summary Cards (Suspense) */}
          <Suspense fallback={
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          }>
            <FinancialSummaryCards
              stats={stats}
              isMobile={isMobile}
              transactions={transactions}
            />
          </Suspense>

          {/* Financial Trends Chart (already lazy) */}
          <Card>
            <CardHeader className={isMobile ? 'pb-2' : ''}>
              <CardTitle className={isMobile ? 'text-lg' : ''}>
                {t('finance.financialTrends')}
              </CardTitle>
              <p className={`text-muted-foreground ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                {t('finance.financialTrendsDesc')}
              </p>
            </CardHeader>
            <CardContent>
              <div className={isMobile ? 'overflow-x-auto' : ''}>
                <FinancialTrendsChartWithLoading />
              </div>
            </CardContent>
          </Card>

          {/* Smart Financial Dashboard */}
          {recordsLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className={`ml-3 ${isMobile ? 'text-sm' : ''}`}>{t('finance.loadingFinancialData')}</span>
                </div>
              </CardContent>
            </Card>
          ) : recordsError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-destructive">
                  <AlertTriangle className="h-4 w-4 mx-auto mb-4" />
                  <p className={isMobile ? 'text-sm' : ''}>Error loading financial data: {recordsError}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ProgressiveLoader 
              loadingMessage={t('finance.loadingFinancialDashboard')}
              fallback={
                <div className={isMobile ? 'overflow-x-auto' : ''}>
                  <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
                </div>
              }
            >
              <div className={isMobile ? 'overflow-x-auto' : ''}>
                <SmartFinancialDashboardWithLoading 
                  data={{
                    sales: financialRecords
                      .filter(t => t.type === 'INCOME')
                      .map(t => ({ amount: t.amount, cost: t.amount * 0.6, date: t.date })),
                    expenses: financialRecords
                      .filter(t => t.type === 'EXPENSE')
                      .map(t => ({ amount: t.amount, category: t.category, date: t.date })),
                  }}
                />
              </div>
            </ProgressiveLoader>
          )}

          {/* Quick Analytics (Suspense) */}
          <Suspense fallback={
            <Card>
              <CardContent className="p-6">
                <div className="h-24 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          }>
            <QuickAnalytics
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            transactions={transactions}
            isMobile={isMobile}
          />
          </Suspense>

          {/* Filters (Suspense) */}
          <Suspense fallback={
            <Card>
              <CardContent className="p-6">
                <div className="h-10 rounded bg-muted animate-pulse mb-3" />
                <div className="h-10 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          }>
            <FinancialFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            paymentMethodFilter={paymentMethodFilter}
            setPaymentMethodFilter={setPaymentMethodFilter}
            isMobile={isMobile}
            transactionTypes={transactionTypes}
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
          />
          </Suspense>

          {/* Transactions List (Suspense) */}
          <Suspense fallback={
            <Card>
              <CardContent className="p-6">
                <div className="h-64 rounded bg-muted animate-pulse" />
              </CardContent>
            </Card>
          }>
            <TransactionList
            transactions={filteredTransactions}
            isMobile={isMobile}
            onViewTransaction={(transaction) => {
              setSelectedTransaction(transaction)
              setIsViewDialogOpen(true)
            }}
            onEditTransaction={() => {}}
            onDeleteTransaction={() => {}}
            onBulkAction={(action, transactionIds) => {
              console.log('Bulk action:', action, 'for transactions:', transactionIds)
              // TODO: Implement bulk actions (export, delete)
            }}
            getPaymentMethodLabel={(method: string) => getPaymentMethodLabel(method, t)}
            transactionTypes={transactionTypes}
          />
          </Suspense>

          {/* Transaction Detail Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className={`max-w-2xl ${
              isMobile ? 'w-full mx-4 rounded-lg' : ''
            }`}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>
                  {t('finance.transactionDetail')} {selectedTransaction?.reference}
                </DialogTitle>
              </DialogHeader>
              {selectedTransaction && <TransactionDetailView transaction={selectedTransaction} />}
            </DialogContent>
          </Dialog>
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

function getPaymentMethodLabel(method: string, t: any) {
  const methods: any = {
    'CASH': t('finance.paymentMethods.cash'),
    'BANK_TRANSFER': t('finance.paymentMethods.bankTransfer'),
    'CREDIT_CARD': t('finance.paymentMethods.creditCard'),
    'DIGITAL_WALLET': t('finance.paymentMethods.digitalWallet')
  }
  return methods[method] || method
}

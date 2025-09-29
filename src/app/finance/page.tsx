'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useFinancialRecords } from '@/hooks/useDatabase'

// Lazy loading imports
import { SmartFinancialDashboardWithLoading } from '@/components/lazy/automation-features'
import { FinancialTrendsChartWithLoading } from '@/components/lazy/chart-features'
import { ProgressiveLoader } from '@/components/lazy/progressive-loading'

// Mobile UX imports
import { useResponsive } from '@/hooks/use-mobile'
import { PullToRefresh } from '@/components/ui/mobile-gestures'

// Extracted components
import { FinancialSummaryCards } from './components/FinancialSummaryCards'
import { FinancialFilters } from './components/FinancialFilters'
import { QuickAnalytics } from './components/QuickAnalytics'
import { TransactionList } from './components/TransactionList'
import { FinanceForm } from './components/FinanceForm'
import { TransactionDetailView } from './components/TransactionDetailView'

import { Plus, Download, AlertTriangle } from 'lucide-react'

// Sample data
const sampleTransactions = [
  {
    id: '1',
    type: 'INCOME',
    category: 'Penjualan',
    amount: 2450000,
    description: 'Penjualan harian 25 Jan 2024',
    date: '2024-01-25',
    reference: 'SAL-20240125',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '2',
    type: 'EXPENSE',
    category: 'Bahan Baku',
    amount: 600000,
    description: 'Pembelian tepung terigu 50kg',
    date: '2024-01-25',
    reference: 'PO-2024-001',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED'
  },
  {
    id: '3',
    type: 'INCOME',
    category: 'Penjualan',
    amount: 1850000,
    description: 'Penjualan B2B PT. Kue Mantap',
    date: '2024-01-24',
    reference: 'ORD-20240124-002',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED'
  },
  {
    id: '4',
    type: 'EXPENSE',
    category: 'Operasional',
    amount: 300000,
    description: 'Biaya listrik bulan Januari',
    date: '2024-01-24',
    reference: 'UTIL-001',
    paymentMethod: 'BANK_TRANSFER',
    status: 'COMPLETED'
  },
  {
    id: '5',
    type: 'EXPENSE',
    category: 'Gaji',
    amount: 2500000,
    description: 'Gaji karyawan minggu ke-4',
    date: '2024-01-23',
    reference: 'SAL-W4-2024',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '6',
    type: 'INCOME',
    category: 'Penjualan',
    amount: 1200000,
    description: 'Pesanan catering ulang tahun',
    date: '2024-01-22',
    reference: 'ORD-20240122-003',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '7',
    type: 'EXPENSE',
    category: 'Equipment',
    amount: 850000,
    description: 'Service mixer besar',
    date: '2024-01-21',
    reference: 'MAINT-001',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  },
  {
    id: '8',
    type: 'INCOME',
    category: 'Lain-lain',
    amount: 150000,
    description: 'Penjualan kemasan bekas',
    date: '2024-01-20',
    reference: 'MISC-001',
    paymentMethod: 'CASH',
    status: 'COMPLETED'
  }
]

const transactionTypes = [
  { value: 'INCOME', label: 'Pemasukan', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-green-800 dark:text-green-100' },
  { value: 'EXPENSE', label: 'Pengeluaran', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 dark:bg-red-800 dark:text-red-100' }
]

const incomeCategories = ['Penjualan', 'Investasi', 'Lain-lain']
const expenseCategories = ['Bahan Baku', 'Gaji', 'Operasional', 'Equipment', 'Marketing', 'Transport']
const paymentMethods = ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET']

export default function FinancePage() {
  const { data: financialRecords, loading: recordsLoading, error: recordsError } = useFinancialRecords()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [categoryFilter, setCategoryFilter] = useState('Semua')
  const [dateFilter, setDateFilter] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('Semua')
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
    const matchesType = typeFilter === 'Semua' || transaction.type === typeFilter
    const matchesCategory = categoryFilter === 'Semua' || transaction.category === categoryFilter
    const matchesDate = !dateFilter || transaction.transaction_date === dateFilter
    return matchesSearch && matchesType && matchesCategory && matchesDate
  })

  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: any = {
      'CASH': 'Tunai',
      'BANK_TRANSFER': 'Transfer Bank',
      'CREDIT_CARD': 'Kartu Kredit',
      'DIGITAL_WALLET': 'E-Wallet'
    }
    return methods[method] || method
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
              }`}>Keuangan</h1>
              <p className="text-muted-foreground">Kelola pemasukan, pengeluaran dan laporan keuangan</p>
            </div>
            <div className={`flex gap-2 ${
              isMobile ? 'w-full flex-col' : ''
            }`}>
              <Button variant="outline" className={isMobile ? 'w-full' : ''}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className={isMobile ? 'w-full' : ''}>
                    <Plus className="h-4 w-4 mr-2" />
                    Transaksi Baru
                  </Button>
                </DialogTrigger>
                <DialogContent className={`max-w-2xl ${
                  isMobile ? 'w-full mx-4 rounded-lg' : ''
                }`}>
                  <DialogHeader>
                    <DialogTitle className={isMobile ? 'text-lg' : ''}>
                      Buat Transaksi Keuangan Baru
                    </DialogTitle>
                  </DialogHeader>
                  <FinanceForm onClose={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <FinancialSummaryCards
            stats={stats}
            isMobile={isMobile}
            transactions={transactions}
          />

          {/* Financial Trends Chart */}
          <Card>
            <CardHeader className={isMobile ? 'pb-2' : ''}>
              <CardTitle className={isMobile ? 'text-lg' : ''}>
                Tren Keuangan
              </CardTitle>
              <p className={`text-muted-foreground ${
                isMobile ? 'text-xs' : 'text-sm'
              }`}>
                Analisis pendapatan, pengeluaran, keuntungan, dan HPP
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
                  <span className={`ml-3 ${isMobile ? 'text-sm' : ''}`}>Memuat data keuangan...</span>
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
              loadingMessage="Loading financial dashboard..."
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
                    inventory: []
                  }} 
                />
              </div>
            </ProgressiveLoader>
          )}

          {/* Quick Analytics */}
          <QuickAnalytics
            incomeCategories={incomeCategories}
            expenseCategories={expenseCategories}
            transactions={transactions}
            isMobile={isMobile}
          />

          {/* Filters */}
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

          {/* Transactions List */}
          <TransactionList
            transactions={filteredTransactions}
            isMobile={isMobile}
            onViewTransaction={(transaction) => {
              setSelectedTransaction(transaction)
              setIsViewDialogOpen(true)
            }}
            onEditTransaction={() => {}}
            onDeleteTransaction={() => {}}
            getPaymentMethodLabel={getPaymentMethodLabel}
            transactionTypes={transactionTypes}
          />

          {/* Transaction Detail Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className={`max-w-2xl ${
              isMobile ? 'w-full mx-4 rounded-lg' : ''
            }`}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>
                  Detail Transaksi {selectedTransaction?.reference}
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

function getPaymentMethodLabel(method: string) {
  const methods: any = {
    'CASH': 'Tunai',
    'BANK_TRANSFER': 'Transfer Bank',
    'CREDIT_CARD': 'Kartu Kredit',
    'DIGITAL_WALLET': 'E-Wallet'
  }
  return methods[method] || method
}

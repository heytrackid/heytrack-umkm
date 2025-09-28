'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFinancialRecords } from '@/hooks/useDatabase'

// Lazy loading imports
import { SmartFinancialDashboardWithLoading } from '@/components/lazy/automation-features'
import { FinancialTrendsChartWithLoading } from '@/components/lazy/chart-features'
import { ProgressiveLoader } from '@/components/lazy/progressive-loading'

// Mobile UX imports
import { useResponsive } from '@/hooks/use-mobile'
import { PullToRefresh, SwipeActions } from '@/components/ui/mobile-gestures'
import { MobileInput, MobileSelect } from '@/components/ui/mobile-forms'
import { MiniChart } from '@/components/ui/mobile-charts'
import { 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  BarChart3,
  AlertTriangle
} from 'lucide-react'

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
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : isTablet ? 'grid-cols-2' : 'md:grid-cols-4'
          }`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Total Pemasukan</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-gray-600 dark:text-gray-400 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  Rp {stats.totalIncome.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">bulan ini</p>
                <MiniChart 
                  data={transactions.filter(t => t.type === 'INCOME').slice(-7).map((transaction, index) => ({
                    day: index + 1,
                    amount: transaction.amount
                  }))}
                  type="area"
                  dataKey="amount"
                  color="#16a34a"
                  className="mt-2"
                  height={30}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Total Pengeluaran</CardTitle>
                <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold text-gray-600 dark:text-gray-400 ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  Rp {stats.totalExpense.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">bulan ini</p>
                <MiniChart 
                  data={transactions.filter(t => t.type === 'EXPENSE').slice(-7).map((transaction, index) => ({
                    day: index + 1,
                    amount: transaction.amount
                  }))}
                  type="area"
                  dataKey="amount"
                  color="#dc2626"
                  className="mt-2"
                  height={30}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Keuntungan Bersih</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${stats.netProfit >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'} ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>
                  Rp {stats.netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Margin: {stats.profitMargin.toFixed(1)}%
                </p>
                <MiniChart 
                  data={transactions.slice(-7).map((_, index) => ({
                    day: index + 1,
                    profit: Math.random() * 1000000 + 500000 // Mock profit trend
                  }))}
                  type="line"
                  dataKey="profit"
                  color={stats.netProfit >= 0 ? '#16a34a' : '#dc2626'}
                  className="mt-2"
                  height={30}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`font-medium ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>Transaksi</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`font-bold ${
                  isMobile ? 'text-xl' : 'text-2xl'
                }`}>{stats.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">total transaksi</p>
                <MiniChart 
                  data={Array.from({ length: 7 }, (_, index) => ({
                    day: index + 1,
                    count: Math.floor(Math.random() * 5) + 1
                  }))}
                  type="bar"
                  dataKey="count"
                  color="#6b7280"
                  className="mt-2"
                  height={30}
                />
              </CardContent>
            </Card>
          </div>

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
          <div className={`grid gap-6 ${
            isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'md:grid-cols-3'
          }`}>
            <Card>
              <CardHeader>
                <CardTitle className={isMobile ? 'text-sm' : 'text-sm'}>
                  Breakdown Pemasukan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {incomeCategories.map(category => {
                    const amount = transactions
                      .filter(t => t.type === 'INCOME' && t.category === category)
                      .reduce((sum, t) => sum + t.amount, 0)
                    const percentage = totalIncome > 0 ? (amount / totalIncome * 100) : 0
                    
                    return (
                      <div key={category} className={`flex justify-between ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        <span>{category}</span>
                        <div className="text-right">
                          <div className="font-medium">Rp {amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className={isMobile ? 'text-sm' : 'text-sm'}>
                  Breakdown Pengeluaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expenseCategories.slice(0, 4).map(category => {
                    const amount = transactions
                      .filter(t => t.type === 'EXPENSE' && t.category === category)
                      .reduce((sum, t) => sum + t.amount, 0)
                    const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0
                    
                    return (
                      <div key={category} className={`flex justify-between ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        <span>{category}</span>
                        <div className="text-right">
                          <div className="font-medium">Rp {amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className={isMobile ? 'text-sm' : 'text-sm'}>
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentMethods.map(method => {
                    const count = transactions.filter(t => t.paymentMethod === method).length
                    const amount = transactions
                      .filter(t => t.paymentMethod === method)
                      .reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum - t.amount, 0)
                    
                    return (
                      <div key={method} className={`flex justify-between ${
                        isMobile ? 'text-xs' : 'text-sm'
                      }`}>
                        <span>{getPaymentMethodLabel(method)}</span>
                        <div className="text-right">
                          <div className="font-medium">{count}x</div>
                          <div className="text-xs text-muted-foreground">
                            Rp {Math.abs(amount).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className={`pt-6 ${isMobile ? 'px-4' : ''}`}>
              <div className={`flex gap-4 ${
                isMobile ? 'flex-col space-y-4' : 'flex-col md:flex-row'
              }`}>
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute text-muted-foreground ${
                      isMobile ? 'left-3 top-3 h-4 w-4' : 'left-2.5 top-2.5 h-4 w-4'
                    }`} />
                    {isMobile ? (
                      <MobileInput
                        placeholder="Cari deskripsi atau referensi..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="pl-10"
                      />
                    ) : (
                      <Input
                        placeholder="Cari deskripsi atau referensi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    )}
                  </div>
                </div>
                <div className={`flex gap-2 ${
                  isMobile ? 'flex-col space-y-2' : 'flex-wrap'
                }`}>
                  {isMobile ? (
                    <>
                      <MobileSelect
                        value={typeFilter}
                        onChange={setTypeFilter}
                        placeholder="Semua Tipe"
                        options={[
                          { value: "Semua", label: "Semua Tipe" },
                          ...transactionTypes.map(type => ({
                            value: type.value,
                            label: type.label
                          }))
                        ]}
                      />
                      <MobileSelect
                        value={categoryFilter}
                        onChange={setCategoryFilter}
                        placeholder="Semua Kategori"
                        options={[
                          { value: "Semua", label: "Semua Kategori" },
                          ...[...incomeCategories, ...expenseCategories].map(category => ({
                            value: category,
                            label: category
                          }))
                        ]}
                      />
                      <MobileInput
                        value={dateFilter}
                        onChange={setDateFilter}
                        placeholder="Pilih tanggal"
                      />
                    </>
                  ) : (
                    <>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Semua Tipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semua">Semua Tipe</SelectItem>
                          {transactionTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semua">Semua Kategori</SelectItem>
                          {[...incomeCategories, ...expenseCategories].map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-40"
                      />
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          {isMobile ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const typeInfo = getTypeInfo(transaction.type)
                
                return (
                  <SwipeActions
                    key={transaction.id}
                    actions={[
                      {
                        id: 'view',
                        label: 'Lihat',
                        icon: <Eye className="h-4 w-4" />,
                        color: 'blue',
                        onClick: () => {
                          setSelectedTransaction(transaction)
                          setIsViewDialogOpen(true)
                        }
                      },
                      {
                        id: 'edit',
                        label: 'Edit',
                        icon: <Edit className="h-4 w-4" />,
                        color: 'yellow',
                        onClick: () => console.log('Edit transaction', transaction.id)
                      },
                      {
                        id: 'delete',
                        label: 'Hapus',
                        icon: <Trash2 className="h-4 w-4" />,
                        color: 'red',
                        onClick: () => console.log('Delete transaction', transaction.id)
                      }
                    ]}
                  >
                    <Card className="cursor-pointer transition-shadow" onClick={() => {
                      setSelectedTransaction(transaction)
                      setIsViewDialogOpen(true)
                    }}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{transaction.date}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 ml-2">
                              <Badge className={`${typeInfo.color} text-xs`}>
                                {transaction.type === 'INCOME' ? (
                                  <ArrowUpRight className="h-2.5 w-2.5 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-2.5 w-2.5 mr-1" />
                                )}
                                {typeInfo.label}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {transaction.category}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs text-muted-foreground">Jumlah</p>
                              <p className={`font-bold text-lg ${
                                transaction.type === 'INCOME' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Via</p>
                              <p className="text-sm font-medium">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
                            </div>
                          </div>
                          
                          <div className="pt-1 border-t border-border">
                            <p className="text-xs text-muted-foreground font-mono">{transaction.reference}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </SwipeActions>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Tanggal</th>
                        <th className="p-4 font-medium">Deskripsi</th>
                        <th className="p-4 font-medium">Kategori</th>
                        <th className="p-4 font-medium">Tipe</th>
                        <th className="p-4 font-medium">Jumlah</th>
                        <th className="p-4 font-medium">Metode</th>
                        <th className="p-4 font-medium">Referensi</th>
                        <th className="p-4 font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => {
                        const typeInfo = getTypeInfo(transaction.type)
                        
                        return (
                          <tr key={transaction.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{transaction.date}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="outline">{transaction.category}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={typeInfo.color}>
                                {transaction.type === 'INCOME' ? (
                                  <ArrowUpRight className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-1" />
                                )}
                                {typeInfo.label}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className={`font-medium ${transaction.type === 'INCOME' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-mono text-sm">{transaction.reference}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction)
                                    setIsViewDialogOpen(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-400">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {filteredTransactions.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className={`font-medium mb-2 ${
                  isMobile ? 'text-base' : 'text-lg'
                }`}>Tidak ada transaksi ditemukan</h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah filter atau buat transaksi baru
                </p>
              </CardContent>
            </Card>
          )}

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

// Finance Form Component
function FinanceForm({ onClose }: { onClose: () => void }) {
  const [selectedType, setSelectedType] = useState('INCOME')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [date, setDate] = useState('')
  const [reference, setReference] = useState('')
  const [description, setDescription] = useState('')
  const { isMobile } = useResponsive()
  
  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      }`}>
        <div>
          <Label htmlFor="type">Tipe Transaksi</Label>
          {isMobile ? (
            <MobileSelect
              value={selectedType}
              onChange={setSelectedType}
              placeholder="Pilih tipe transaksi"
              options={transactionTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          ) : (
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe transaksi" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="category">Kategori</Label>
          {isMobile ? (
            <MobileSelect
              value={category}
              onChange={setCategory}
              placeholder="Pilih kategori"
              options={(selectedType === 'INCOME' ? incomeCategories : expenseCategories).map(cat => ({
                value: cat,
                label: cat
              }))}
            />
          ) : (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {(selectedType === 'INCOME' ? incomeCategories : expenseCategories).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="amount">Jumlah</Label>
          {isMobile ? (
            <MobileInput
              value={amount}
              onChange={setAmount}
              placeholder="1000000"
              type="number"
            />
          ) : (
            <Input 
              id="amount" 
              type="number" 
              placeholder="1000000" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
          {isMobile ? (
            <MobileSelect
              value={paymentMethod}
              onChange={setPaymentMethod}
              placeholder="Pilih metode pembayaran"
              options={paymentMethods.map(method => ({
                value: method,
                label: getPaymentMethodLabel(method)
              }))}
            />
          ) : (
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih metode pembayaran" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map(method => (
                  <SelectItem key={method} value={method}>{getPaymentMethodLabel(method)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="date">Tanggal</Label>
          {isMobile ? (
            <MobileInput
              value={date}
              onChange={setDate}
              placeholder="Pilih tanggal"
              type="date"
            />
          ) : (
            <Input 
              id="date" 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          )}
        </div>
        <div>
          <Label htmlFor="reference">Referensi</Label>
          {isMobile ? (
            <MobileInput
              value={reference}
              onChange={setReference}
              placeholder="SAL-20240125"
            />
          ) : (
            <Input 
              id="reference" 
              placeholder="SAL-20240125" 
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="description">Deskripsi</Label>
        {isMobile ? (
          <MobileInput
            value={description}
            onChange={setDescription}
            placeholder="Deskripsi transaksi..."
            multiline
            rows={3}
          />
        ) : (
          <Textarea 
            id="description" 
            placeholder="Deskripsi transaksi..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        )}
      </div>
      <div className={`flex gap-2 pt-4 ${
        isMobile ? 'flex-col' : 'justify-end'
      }`}>
        <Button variant="outline" onClick={onClose} className={isMobile ? 'w-full' : ''}>
          Batal
        </Button>
        <Button className={isMobile ? 'w-full' : ''}>
          Simpan Transaksi
        </Button>
      </div>
    </div>
  )
}

// Transaction Detail View Component
function TransactionDetailView({ transaction }: { transaction: any }) {
  const { isMobile } = useResponsive()
  
  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }
  
  const typeInfo = getTypeInfo(transaction.type)

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      }`}>
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Informasi Transaksi</h3>
          <div className={`mt-2 space-y-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referensi:</span>
              <span className="font-mono break-all">{transaction.reference}</span>
            </div>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-1' : 'justify-between'
            }`}>
              <span className="text-muted-foreground">Tipe:</span>
              <Badge className={typeInfo.color}>
                {transaction.type === 'INCOME' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {typeInfo.label}
              </Badge>
            </div>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-1' : 'justify-between'
            }`}>
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">{transaction.status}</Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Detail Keuangan</h3>
          <div className={`mt-2 space-y-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori:</span>
              <span>{transaction.category}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Jumlah:</span>
              <span className={`${
                transaction.type === 'INCOME' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
              } ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode:</span>
              <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className={`font-medium ${
          isMobile ? 'text-base' : 'text-lg'
        }`}>Deskripsi</h3>
        <p className={`mt-1 text-muted-foreground ${
          isMobile ? 'text-sm' : 'text-sm'
        }`}>{transaction.description}</p>
      </div>
    </div>
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

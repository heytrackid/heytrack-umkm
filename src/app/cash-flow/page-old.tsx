'use client'

import React, { useState, lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { useSettings } from '@/contexts/settings-context'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useResponsive } from '@/hooks/use-mobile'

// Lazy load all heavy components for better performance
const AddTransactionForm = lazy(() => import('./components/AddTransactionForm'))
const OverviewTab = lazy(() => import('./components/OverviewTab'))
const DetailTab = lazy(() => import('./components/DetailTab'))
const ChartTab = lazy(() => import('./components/ChartTab'))

export default function CashFlowPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency, t } = useSettings()
  const [selectedPeriod, setSelectedPeriod] = useState('month') // 'day', 'week', 'month', 'year'
  const [currentView, setCurrentView] = useState('overview') // 'overview', 'detail', 'chart', 'add'
  
  // Form state for adding new transaction
  const [newTransaction, setNewTransaction] = useState({
    type: 'income', // 'income' or 'expense'
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  })

  // Mock cash flow data - replace with actual data fetching
  const [cashFlowData, setCashFlowData] = useState({
    totalIncome: 15750000,
    totalExpenses: 8950000,
    netFlow: 6800000,
    incomeTransactions: [
      {
        id: 1,
        date: '2024-01-28',
        description: 'Penjualan Roti Tawar Premium',
        category: 'Penjualan Produk',
        amount: 450000,
        type: 'income'
      },
      {
        id: 2,
        date: '2024-01-28',
        description: 'Penjualan Kue Ulang Tahun',
        category: 'Penjualan Produk',
        amount: 750000,
        type: 'income'
      },
      {
        id: 3,
        date: '2024-01-27',
        description: 'Penjualan Cookies & Pastry',
        category: 'Penjualan Produk',
        amount: 325000,
        type: 'income'
      },
    ],
    expenseTransactions: [
      {
        id: 4,
        date: '2024-01-28',
        description: 'Pembelian Tepung & Gula',
        category: 'Bahan Baku',
        amount: -235000,
        type: 'expense'
      },
      {
        id: 5,
        date: '2024-01-27',
        description: 'Tagihan Listrik',
        category: 'Operasional',
        amount: -150000,
        type: 'expense'
      },
      {
        id: 6,
        date: '2024-01-26',
        description: 'Gaji Karyawan',
        category: 'SDM',
        amount: -800000,
        type: 'expense'
      },
    ],
  })

  // Categories for transactions
  const incomeCategories = [
    'Penjualan Produk',
    'Jasa Catering',
    'Pre-Order',
    'Penjualan Online',
    'Event & Wedding',
    'Lainnya'
  ]
  
  const expenseCategories = [
    'Bahan Baku',
    'Operasional',
    'SDM',
    'Utilities',
    'Marketing',
    'Transportasi',
    'Peralatan',
    'Lainnya'
  ]

  const allTransactions = [
    ...cashFlowData.incomeTransactions,
    ...cashFlowData.expenseTransactions
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Breadcrumb component
  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', href: '/' },
      { label: 'Laporan Arus Kas', href: currentView === 'overview' ? undefined : '/cash-flow' }
    ]
    
    if (currentView !== 'overview') {
      items.push({ 
        label: currentView === 'detail' ? 'Detail Transaksi' : 
               currentView === 'chart' ? 'Grafik Analisis' : 'Tambah Transaksi'
      })
    }
    
    return items
  }

  const getPeriodText = () => {
    switch (selectedPeriod) {
      case 'day': return 'Hari Ini'
      case 'week': return 'Minggu Ini'
      case 'month': return 'Bulan Ini'
      case 'year': return 'Tahun Ini'
      default: return 'Periode'
    }
  }

  // Handle form submission
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
      alert('Mohon lengkapi semua field')
      return
    }

    const amount = parseFloat(newTransaction.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Jumlah harus berupa angka positif')
      return
    }

    const transaction = {
      id: Date.now(), // Simple ID generation
      date: newTransaction.date,
      description: newTransaction.description,
      category: newTransaction.category,
      amount: newTransaction.type === 'expense' ? -amount : amount,
      type: newTransaction.type
    }

    // Update cash flow data
    setCashFlowData(prev => {
      const updatedData = { ...prev }
      
      if (newTransaction.type === 'income') {
        updatedData.incomeTransactions = [...prev.incomeTransactions, transaction]
        updatedData.totalIncome += amount
      } else {
        updatedData.expenseTransactions = [...prev.expenseTransactions, transaction]
        updatedData.totalExpenses += amount
      }
      
      updatedData.netFlow = updatedData.totalIncome - updatedData.totalExpenses
      
      return updatedData
    })

    // Reset form
    setNewTransaction({
      type: 'income',
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })

    // Go back to overview
    setCurrentView('overview')
    alert('Transaksi berhasil ditambahkan!')
  }

  const AddTransactionForm = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentView('overview')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Tambah Transaksi</h2>
          <p className="text-muted-foreground">Catat pemasukan atau pengeluaran baru</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Jenis Transaksi</Label>
            <Select 
              value={newTransaction.type} 
              onValueChange={(value) => setNewTransaction(prev => ({ ...prev, type: value, category: '' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span>Pemasukan</span>
                  </div>
                </SelectItem>
                <SelectItem value="expense">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span>Pengeluaran</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Deskripsi</Label>
            <Input
              value={newTransaction.description}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              placeholder={newTransaction.type === 'income' ? 'Contoh: Penjualan Roti Tawar Premium' : 'Contoh: Pembelian Tepung & Gula'}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select 
              value={newTransaction.category} 
              onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Jumlah (Rp)</Label>
            <Input
              type="number"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
              min="0"
              step="1000"
            />
            {newTransaction.amount && (
              <p className="text-sm text-muted-foreground">
                = {formatCurrency(parseFloat(newTransaction.amount) || 0)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleAddTransaction} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Simpan Transaksi
            </Button>
            <Button variant="outline" onClick={() => setCurrentView('overview')}>
              Batal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Suggestions */}
      {newTransaction.type && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
                {newTransaction.type === 'income' ? 
                  <TrendingUp className="h-5 w-5 text-blue-600" /> : 
                  <TrendingDown className="h-5 w-5 text-blue-600" />
                }
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Tips: {newTransaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Umum
                </h3>
                <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex flex-wrap gap-2'}`}>
                  {(newTransaction.type === 'income' ? [
                    'Penjualan harian produk',
                    'Order custom cake',
                    'Catering event',
                    'Pre-order weekend'
                  ] : [
                    'Belanja bahan baku',
                    'Bayar listrik/gas',
                    'Gaji karyawan',
                    'Ongkos kirim'
                  ]).map((tip, index) => (
                    <Badge key={index} variant="outline" className="mr-1 mb-1">
                      {tip}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Laporan Arus Kas
          </h1>
          <p className="text-muted-foreground">
            Monitor pemasukan dan pengeluaran bisnis
          </p>
        </div>
        <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className={isMobile ? 'w-full' : 'w-40'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hari Ini</SelectItem>
              <SelectItem value="week">Minggu Ini</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
              <SelectItem value="year">Tahun Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className={isMobile ? 'w-full' : ''}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className={isMobile ? 'w-full' : ''}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className={`font-bold text-green-800 dark:text-green-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(cashFlowData.totalIncome)}
            </div>
            <p className="text-sm text-green-600 font-medium">Total Pemasukan</p>
            <p className="text-xs text-green-600 mt-1">{getPeriodText()}</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className={`font-bold text-red-800 dark:text-red-200 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(cashFlowData.totalExpenses)}
            </div>
            <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
            <p className="text-xs text-red-600 mt-1">{getPeriodText()}</p>
          </CardContent>
        </Card>

        <Card className={`${cashFlowData.netFlow >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} dark:${cashFlowData.netFlow >= 0 ? 'bg-blue-900/20 border-blue-800' : 'bg-orange-900/20 border-orange-800'}`}>
          <CardContent className="p-6 text-center">
            <DollarSign className={`h-8 w-8 ${cashFlowData.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} mx-auto mb-2`} />
            <div className={`font-bold ${cashFlowData.netFlow >= 0 ? 'text-blue-800 dark:text-blue-200' : 'text-orange-800 dark:text-orange-200'} ${isMobile ? 'text-xl' : 'text-2xl'}`}>
              {formatCurrency(cashFlowData.netFlow)}
            </div>
            <p className={`text-sm ${cashFlowData.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'} font-medium`}>
              Arus Kas Bersih
            </p>
            <Badge variant={cashFlowData.netFlow >= 0 ? 'default' : 'destructive'} className="mt-1">
              {cashFlowData.netFlow >= 0 ? 'Surplus' : 'Defisit'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => setCurrentView('detail')}
        >
          <Eye className="h-5 w-5" />
          <span>Lihat Detail Transaksi</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => setCurrentView('chart')}
        >
          <BarChart3 className="h-5 w-5" />
          <span>Analisis Grafik</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-auto p-4 flex flex-col items-center gap-2"
          onClick={() => setCurrentView('add')}
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Transaksi</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaksi Terbaru</span>
            <Button variant="ghost" size="sm" onClick={() => setCurrentView('detail')}>
              Lihat Semua
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Tips: Kelola Arus Kas dengan Baik
              </h3>
              <div className={`text-sm text-blue-800 dark:text-blue-200 ${isMobile ? 'space-y-1' : 'flex items-center gap-4'}`}>
                <span>• Monitor harian untuk deteksi dini</span>
                <span>• Catat semua transaksi secara rutin</span>
                <span>• Analisis tren bulanan</span>
                <span>• Siapkan cadangan untuk operasional</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DetailTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Detail Transaksi</h2>
        <Button variant="outline" onClick={() => setCurrentView('overview')}>
          Kembali ke Overview
        </Button>
      </div>

      <div className="space-y-4">
        {allTransactions.map((transaction) => (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{transaction.category}</Badge>
                      <span>•</span>
                      <span>{transaction.date}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const ChartTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>Analisis Grafik</h2>
        <Button variant="outline" onClick={() => setCurrentView('overview')}>
          Kembali ke Overview
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">Grafik akan tersedia segera</h3>
          <p className="text-muted-foreground">
            Fitur visualisasi data cash flow dengan chart interaktif sedang dalam pengembangan
          </p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Using lazy-loaded components for better performance */}
        {currentView === 'overview' && (
          <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div></div>}>
            <OverviewTab />
          </Suspense>
        )}
        
        {currentView === 'detail' && <DetailTab />}
        {currentView === 'chart' && <ChartTab />}
        
        {currentView === 'add' && (
          <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div></div>}>
            <AddTransactionForm />
          </Suspense>
        )}
      </div>
    </AppLayout>
  )
}
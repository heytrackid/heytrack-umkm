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
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [currentView, setCurrentView] = useState('overview')
  
  // Form state for adding new transaction
  const [newTransaction, setNewTransaction] = useState({
    type: 'income',
    description: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Mock cash flow data
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

  // Categories
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
      id: Date.now(),
      date: newTransaction.date,
      description: newTransaction.description,
      category: newTransaction.category,
      amount: newTransaction.type === 'expense' ? -amount : amount,
      type: newTransaction.type
    }

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

    setNewTransaction({
      type: 'income',
      description: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0]
    })

    setCurrentView('overview')
    alert('Transaksi berhasil ditambahkan!')
  }

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

        {/* Content with lazy loading */}
        {currentView === 'overview' && (
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          }>
            <OverviewTab
              cashFlowData={cashFlowData}
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              setCurrentView={setCurrentView}
              formatCurrency={formatCurrency}
              isMobile={isMobile}
            />
          </Suspense>
        )}
        
        {currentView === 'detail' && (
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          }>
            <DetailTab
              transactions={allTransactions}
              formatCurrency={formatCurrency}
              onBack={() => setCurrentView('overview')}
              isMobile={isMobile}
            />
          </Suspense>
        )}
        
        {currentView === 'chart' && (
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          }>
            <ChartTab
              onBack={() => setCurrentView('overview')}
              isMobile={isMobile}
            />
          </Suspense>
        )}
        
        {currentView === 'add' && (
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          }>
            <AddTransactionForm
              newTransaction={newTransaction}
              setNewTransaction={setNewTransaction}
              incomeCategories={incomeCategories}
              expenseCategories={expenseCategories}
              formatCurrency={formatCurrency}
              onSubmit={handleAddTransaction}
              onCancel={() => setCurrentView('overview')}
              isMobile={isMobile}
            />
          </Suspense>
        )}
      </div>
    </AppLayout>
  )
}

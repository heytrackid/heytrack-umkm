'use client'

import React, { useState, useEffect, lazy, Suspense } from 'react'
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
import PrefetchLink from '@/components/ui/prefetch-link'

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

  const [cashFlowData, setCashFlowData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    incomeTransactions: [],
    expenseTransactions: [],
  })

  // Fetch cash flow data from API
  useEffect(() => {
    fetchCashFlowData()
  }, [selectedPeriod])

  const fetchCashFlowData = async () => {
    try {
      // Calculate date range based on period
      const today = new Date()
      let startDate = ''
      let endDate = today.toISOString().split('T')[0]
      
      if (selectedPeriod === 'week') {
        startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0]
      } else if (selectedPeriod === 'month') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
      } else if (selectedPeriod === 'year') {
        startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
      }

      // Use new cash flow report API endpoint
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)
      params.append('group_by', selectedPeriod === 'week' ? 'day' : selectedPeriod === 'month' ? 'week' : 'month')
      
      const response = await fetch(`/api/reports/cash-flow?${params.toString()}`)
      const data = await response.json()

      // Transform data for existing component structure
      const incomeTransactions = data.transactions
        ?.filter((t: any) => t.type === 'income')
        .map((t: any) => ({
          id: t.reference_id,
          date: t.date,
          description: t.description,
          category: t.category,
          amount: t.amount,
          type: 'income'
        })) || []

      const expenseTransactions = data.transactions
        ?.filter((t: any) => t.type === 'expense')
        .map((t: any) => ({
          id: t.reference_id,
          date: t.date,
          description: t.description,
          category: t.category,
          amount: -Math.abs(t.amount),
          type: 'expense'
        })) || []

      setCashFlowData({
        totalIncome: data.summary?.total_income || 0,
        totalExpenses: data.summary?.total_expenses || 0,
        netFlow: data.summary?.net_cash_flow || 0,
        incomeTransactions,
        expenseTransactions,
      })
    } catch (error: any) {
      console.error('Error fetching cash flow data:', error)
    }
  }

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
      alert
      return
    }

    const amount = parseFloat
    if (isNaN(amount) || amount <= 0) {
      alert
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
    alert
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index: number) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <PrefetchLink href={item.href}>{item.label}</PrefetchLink>
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

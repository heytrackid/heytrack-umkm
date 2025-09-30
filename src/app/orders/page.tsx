'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { useCurrency } from '@/hooks/useCurrency'
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { useI18n } from '@/providers/I18nProvider'
import { 
  StatsCardSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { 
  OrdersTableSkeleton
} from '@/components/ui/skeletons/table-skeletons'
import { SearchFormSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { 
  ShoppingCart,
  Plus
} from 'lucide-react'

// Lazy load heavy components
const OrdersStatsSection = lazy(() => import('./components/OrdersStatsSection'))
const OrdersFilters = lazy(() => import('./components/OrdersFilters'))
const OrdersQuickActions = lazy(() => import('./components/OrdersQuickActions'))
const OrdersTableSection = lazy(() => import('./components/OrdersTableSection'))

// Mock data
const mockOrders = [
  {
    id: '1',
    order_number: 'ORD00001234',
    customer_name: 'Ibu Sari',
    customer_phone: '08123456789',
    status: 'confirmed',
    order_date: '2025-09-29',
    due_date: '2025-10-02',
    items: [{ name: 'Roti Tawar Premium', quantity: 2 }],
    total_amount: 55500,
    payment_status: 'unpaid'
  },
  {
    id: '2', 
    order_number: 'ORD00001235',
    customer_name: 'Pak Budi',
    customer_phone: '08129876543',
    status: 'in_production',
    order_date: '2025-09-28',
    due_date: '2025-10-01',
    items: [{ name: 'Kue Ulang Tahun', quantity: 1 }],
    total_amount: 166500,
    payment_status: 'partial'
  }
]

// We'll define these inside the component to use t() function
// const ORDER_STATUS_CONFIG = ...
// const PAYMENT_STATUS_CONFIG = ...

export default function OrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { formatCurrency } = useCurrency()
  const { t } = useI18n()
  const { loading, setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_ORDERS]: true
  })

  // Status configurations using i18n
  const ORDER_STATUS_CONFIG = {
    pending: { label: t('orders.status.pending'), color: 'bg-gray-100 text-gray-800' },
    confirmed: { label: t('orders.status.confirmed'), color: 'bg-gray-200 text-gray-900' },
    in_production: { label: t('orders.status.in_production'), color: 'bg-gray-300 text-gray-900' },
    completed: { label: t('orders.status.completed'), color: 'bg-gray-400 text-white' },
    cancelled: { label: t('orders.status.cancelled'), color: 'bg-gray-500 text-white' }
  }

  const PAYMENT_STATUS_CONFIG = {
    unpaid: { label: t('orders.paymentStatus.unpaid'), color: 'bg-gray-100 text-gray-800' },
    partial: { label: t('orders.paymentStatus.partial'), color: 'bg-gray-200 text-gray-900' },
    paid: { label: t('orders.paymentStatus.paid'), color: 'bg-gray-300 text-gray-900' }
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric'
    })
  }
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDateFrom = !dateFrom || order.order_date >= dateFrom
    const matchesDateTo = !dateTo || order.order_date <= dateTo
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
  })
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(LOADING_KEYS.FETCH_ORDERS, false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Stats calculations
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const pendingRevenue = orders.filter(o => o.payment_status === 'unpaid').reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              {t('orders.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('orders.subtitle')}
            </p>
          </div>
          <Button onClick={() => window.location.href = '/orders/new'}>
            <Plus className="h-4 w-4 mr-2" />
            {t('orders.addOrder')}
          </Button>
        </div>
        
        {/* Stats Cards (Suspense boundary) */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          }>
            <OrdersStatsSection
              totalOrders={totalOrders}
              totalRevenue={totalRevenue}
              averageOrderValue={averageOrderValue}
              pendingRevenue={pendingRevenue}
              formatCurrency={formatCurrency}
              t={t}
            />
          </Suspense>
        )}
        
        {/* Quick Actions */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-800 rounded" />
        ) : (
          <Suspense fallback={<div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-800 rounded" />}>
            <OrdersQuickActions t={t} />
          </Suspense>
        )}
        
        {/* Filters */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <SearchFormSkeleton />
        ) : (
          <Suspense fallback={<SearchFormSkeleton />}>
            <OrdersFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              statusConfig={ORDER_STATUS_CONFIG}
              t={t}
            />
          </Suspense>
        )}
        
        {/* Orders Table */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <OrdersTableSkeleton rows={5} />
        ) : (
          <Suspense fallback={<OrdersTableSkeleton rows={5} />}>
            <OrdersTableSection
              orders={filteredOrders}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              ORDER_STATUS_CONFIG={ORDER_STATUS_CONFIG}
              PAYMENT_STATUS_CONFIG={PAYMENT_STATUS_CONFIG}
              t={t}
            />
          </Suspense>
        )}
      </div>
    </AppLayout>
  )
}

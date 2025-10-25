'use client'

import { useEffect, useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { apiLogger } from '@/lib/logger'
import {
  StatsCardSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { SearchFormSkeleton } from '@/components/ui/skeletons/form-skeletons'
import {
  OrdersTableSkeleton
} from '@/components/ui/skeletons/table-skeletons'
import { useCurrency } from '@/hooks/useCurrency'
import { LOADING_KEYS, useLoading } from '@/hooks/useLoading'
import {
  Plus,
  ShoppingCart
} from 'lucide-react'

// Lazy load heavy components
const OrdersStatsSection = lazy(() => import('./components/OrdersStatsSection'))
const OrdersFilters = lazy(() => import('./components/OrdersFilters'))
const OrdersQuickActions = lazy(() => import('./components/OrdersQuickActions'))
const OrdersTableSection = lazy(() => import('./components/OrdersTableSection'))

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const { formatCurrency } = useCurrency()
  const { loading, setLoading, isLoading } = useLoading({
    [LOADING_KEYS.FETCH_ORDERS]: true
  })
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Fetch orders from API
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthLoading, isAuthenticated])

  const fetchOrders = async () => {
    try {
      setLoading(LOADING_KEYS.FETCH_ORDERS, true)
      const response = await fetch('/api/orders')

      if (response.status === 401) {
        toast({
          title: 'Sesi berakhir',
          description: 'Sesi Anda telah berakhir. Silakan login kembali.',
          variant: 'destructive',
        })
        router.push('/auth/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data)
    } catch (error: unknown) {
      apiLogger.error({ error: error }, 'Error fetching orders:')
      toast({
        title: 'Terjadi kesalahan',
        description: 'Gagal memuat data pesanan. Silakan coba lagi.',
        variant: 'destructive',
      })
    } finally {
      setLoading(LOADING_KEYS.FETCH_ORDERS, false)
    }
  }

  // Status configurations using hardcoded strings
  const ORDER_STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
    confirmed: { label: 'Dikonfirmasi', color: 'bg-gray-200 text-gray-900' },
    in_production: { label: 'Sedang Diproduksi', color: 'bg-gray-300 text-gray-900' },
    completed: { label: 'Selesai', color: 'bg-gray-400 text-white' },
    cancelled: { label: 'Dibatalkan', color: 'bg-gray-500 text-white' }
  }

  const PAYMENT_STATUS_CONFIG = {
    unpaid: { label: 'Belum Dibayar', color: 'bg-gray-100 text-gray-800' },
    partial: { label: 'Dibayar Sebagian', color: 'bg-gray-200 text-gray-900' },
    paid: { label: 'Lunas', color: 'bg-gray-300 text-gray-900' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    const matchesDateFrom = !dateFrom || order.order_date >= dateFrom
    const matchesDateTo = !dateTo || order.order_date <= dateTo

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo
  })



  // Stats calculations
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const pendingRevenue = orders.filter(o => o.payment_status === 'unpaid').reduce((sum, o) => sum + o.total_amount, 0)

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingCart className="h-8 w-8" />
                Pesanan
              </h1>
              <p className="text-muted-foreground">
                Kelola pesanan pelanggan
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
          <OrdersTableSkeleton rows={5} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Pesanan
            </h1>
            <p className="text-muted-foreground">
              Kelola pesanan pelanggan
            </p>
          </div>
          <Button onClick={() => window.location.href = '/orders/new'}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pesanan
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
            />
          </Suspense>
        )}

        {/* Quick Actions */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-800 rounded" />
        ) : (
          <Suspense fallback={<div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-800 rounded" />}>
            <OrdersQuickActions />
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
            />
          </Suspense>
        )}

        {/* Orders Table */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <OrdersTableSkeleton rows={5} />
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border rounded-md bg-muted/30 text-center">
            <ShoppingCart className="h-10 w-10 mb-3 opacity-60" />
            <p className="text-lg font-medium">Belum ada pesanan</p>
            <p className="text-sm text-muted-foreground mb-4">Klik tombol di bawah untuk membuat pesanan pertama Anda.</p>
            <Button onClick={() => window.location.href = '/orders/new'}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pesanan
            </Button>
          </div>
        ) : (
          <Suspense fallback={<OrdersTableSkeleton rows={5} />}>
            <OrdersTableSection
              orders={filteredOrders}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              ORDER_STATUS_CONFIG={ORDER_STATUS_CONFIG}
              PAYMENT_STATUS_CONFIG={PAYMENT_STATUS_CONFIG}
            />
          </Suspense>
        )}
      </div>
    </AppLayout>
  )
}

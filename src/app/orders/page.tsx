'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useCurrency } from '@/hooks/useCurrency'
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { useI18n } from '@/providers/I18nProvider'
import { 
  StatsCardSkeleton,
  DashboardHeaderSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { 
  OrdersTableSkeleton,
  DataGridSkeleton
} from '@/components/ui/skeletons/table-skeletons'
import { SearchFormSkeleton } from '@/components/ui/skeletons/form-skeletons'
import { 
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Clock,
  Eye,
  MessageCircle,
  Package
} from 'lucide-react'

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

// Stats component inline
const OrdersStatsSection = ({ totalOrders, totalRevenue, averageOrderValue, pendingRevenue, formatCurrency, t }: any) => (
  <div className="grid gap-4 md:grid-cols-4">
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('orders.totalOrders')}</p>
            <p className="text-2xl font-bold">{totalOrders}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
             18.7% {t('orders.growthFromPrevious')}
            </p>
          </div>
          <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('orders.totalRevenue')}</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
             23.2% {t('orders.growthFromPrevious')}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('orders.averageOrderValue')}</p>
            <p className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('orders.perOrder')}</p>
          </div>
          <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('orders.pendingPayment')}</p>
            <p className="text-2xl font-bold">{formatCurrency(pendingRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t('orders.pendingPaymentLabel')}</p>
          </div>
          <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        </div>
      </CardContent>
    </Card>
  </div>
)

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
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/settings/whatsapp-templates'}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Export orders')}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                {t('orders.exportData')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Filters */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <SearchFormSkeleton />
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('orders.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('orders.allStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('orders.allStatus')}</SelectItem>
                    {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    placeholder={t('orders.fromDate')}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-[140px]"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    type="date"
                    placeholder={t('orders.toDate')}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-[140px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Orders Table */}
        {isLoading(LOADING_KEYS.FETCH_ORDERS) ? (
          <OrdersTableSkeleton rows={5} />
        ) : (
          <Card>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('orders.table.order')}</TableHead>
                    <TableHead>{t('orders.table.customer')}</TableHead>
                    <TableHead>{t('orders.table.status')}</TableHead>
                    <TableHead>{t('orders.table.date')}</TableHead>
                    <TableHead>{t('orders.table.total')}</TableHead>
                    <TableHead>{t('orders.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.order_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.items.map(item => item.name).join(', ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG].color}>
                          {ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(order.order_date)}</div>
                          <div className="text-muted-foreground">{t('orders.table.due')}: {formatDate(order.due_date)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                          <Badge className={PAYMENT_STATUS_CONFIG[order.payment_status as keyof typeof PAYMENT_STATUS_CONFIG].color}>
                            {PAYMENT_STATUS_CONFIG[order.payment_status as keyof typeof PAYMENT_STATUS_CONFIG].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

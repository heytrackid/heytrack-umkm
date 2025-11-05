'use client'


import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { uiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import { Calendar, MessageCircle, Plus, ShoppingCart, TrendingUp, XCircle } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { arrayCalculations } from '@/lib/performance-optimized'
import dynamic from 'next/dynamic'
import type { Order, OrderStatus } from '@/app/orders/types/orders.types'
import { StatsCards } from './StatsCards'
import { StatusSummary } from './StatusSummary'
import { OrderFilters } from './OrderFilters'
import { DashboardView } from './DashboardView'
import { OrdersList } from './OrdersList'


/**
 * Orders Page - Main Component (Refactored & Modular)
 * Split into smaller, focused components
 */



// ✅ Code Splitting - Lazy load heavy components
const OrderForm = dynamic(() => import('../OrderForm').then(mod => ({ default: mod.OrderForm })), {
    loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false
})

const OrderDetailView = dynamic(() => import('../OrderDetailView').then(mod => ({ default: mod.OrderDetailView })), {
    loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
    ssr: false
})

// Import modular components

interface OrderFilters {
    status: OrderStatus[]
    payment_status: string[]
    date_from: string
    date_to: string
    customer_search?: string
}

interface OrderStats {
    total_orders: number
    pending_orders: number
    confirmed_orders: number
    in_production_orders: number
    completed_orders: number
    cancelled_orders: number
    total_revenue: number
    pending_revenue: number
    paid_revenue: number
    average_order_value: number
    total_customers: number
    repeat_customers: number
    period_growth: number
    revenue_growth: number
    order_growth: number
}

interface OrdersPageProps {
    userRole?: 'admin' | 'manager' | 'staff'
    enableAdvancedFeatures?: boolean
}

const OrdersPage = (_props: OrdersPageProps) => {
    const queryClient = useQueryClient()

    type ActiveView = 'dashboard' | 'list' | 'calendar' | 'analytics'
    const [activeView, setActiveView] = useState<ActiveView>('dashboard')

    const [filters, setFilters] = useState<OrderFilters>({
        status: [],
        payment_status: [],
        date_from: '',
        date_to: '',
        customer_search: ''
    })
    const hasFiltersApplied = (filters.status?.length || 0) > 0 || Boolean(filters.customer_search?.trim())

    // Fetch orders
    const { data: ordersData, isLoading: loading, error: queryError } = useQuery({
        queryKey: ['orders', 'all'],
        queryFn: async () => {
            const response = await fetch('/api/orders', {
                credentials: 'include', // Include cookies for authentication
            })
            if (!response.ok) { throw new Error('Failed to fetch orders') }
            const data = await response.json()
            return Array.isArray(data) ? data : []
        },
        staleTime: 2 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
    })

    // Ensure orders is always an array
    const orders = useMemo(() => {
        if (!ordersData) { return [] }
        return Array.isArray(ordersData) ? ordersData : []
    }, [ordersData])

    const error = queryError ? getErrorMessage(queryError) : null

    // Calculate stats with safe array operations
    const stats = useMemo<OrderStats>(() => {
        // Guard against non-array
        const safeOrders = Array.isArray(orders) ? orders : []

        return {
            total_orders: safeOrders.length,
            pending_orders: safeOrders.filter(o => o.status === 'PENDING').length,
            confirmed_orders: safeOrders.filter(o => o.status === 'CONFIRMED').length,
            in_production_orders: safeOrders.filter(o => o.status === 'IN_PROGRESS').length,
            completed_orders: safeOrders.filter(o => o.status === 'DELIVERED').length,
            cancelled_orders: safeOrders.filter(o => o.status === 'CANCELLED').length,
            total_revenue: arrayCalculations.sum(safeOrders, 'total_amount'),
            pending_revenue: arrayCalculations.sum(
                safeOrders.filter(o => o.payment_status === 'UNPAID'),
                'total_amount'
            ),
            paid_revenue: safeOrders.reduce((sum, o) => sum + (o.paid_amount ?? 0), 0),
            average_order_value: arrayCalculations.average(safeOrders, 'total_amount'),
            total_customers: new Set(safeOrders.filter(o => o.customer_id).map(o => o.customer_id)).size,
            repeat_customers: 0,
            period_growth: 0,
            revenue_growth: 0,
            order_growth: 0
        }
    }, [orders])

    // Dialog states
    const [showOrderForm, setShowOrderForm] = useState(false)
    const [showOrderDetail, setShowOrderDetail] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const handleCreateOrder = () => {
        setSelectedOrder(null)
        setShowOrderForm(true)
    }

    const handleEditOrder = (order: Order) => {
        setSelectedOrder(order)
        setShowOrderForm(true)
    }

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order)
        setShowOrderDetail(true)
    }

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include', // Include cookies for authentication
            })
            await queryClient.invalidateQueries({ queryKey: ['orders'] })
        } catch (error: unknown) {
            const message = getErrorMessage(error)
            uiLogger.error({ error: message }, 'Failed to update status')
        }
    }

    const handleClearFilters = () => {
        setFilters({ status: [], payment_status: [], date_from: '', date_to: '', customer_search: '' })
    }

    // Loading state
    if (loading && orders.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ShoppingCart className="h-8 w-8" />
                            Order Management
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola pesanan dan penjualan dengan sistem terintegrasi
                        </p>
                    </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center py-8">
                        <XCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium mb-2">Gagal Memuat Data</h3>
                        <p className="text-sm text-muted-foreground mb-4">{error}</p>
                        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-8 w-8" />
                        Kelola Pesanan
                    </h1>
                    <p className="text-muted-foreground">
                        Kelola pesanan dan penjualan dengan sistem terintegrasi
                    </p>
                </div>
                <Button onClick={handleCreateOrder}>
                    <Plus className="h-4 w-4 mr-2" />
                    Pesanan Baru
                </Button>
            </div>

            {/* Stats Overview */}
            <StatsCards stats={stats} />

            {/* Quick Actions */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/orders/whatsapp-templates'}
                            className="flex items-center gap-2"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Template WhatsApp
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Status Summary */}
            <StatusSummary stats={stats} />

            {/* Navigation Tabs */}
            <SwipeableTabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)}>
                <SwipeableTabsList>
                    <SwipeableTabsTrigger value="dashboard">Ringkasan</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="list">Daftar Pesanan</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="calendar">Kalender</SwipeableTabsTrigger>
                    <SwipeableTabsTrigger value="analytics">Analitik</SwipeableTabsTrigger>
                </SwipeableTabsList>

                <SwipeableTabsContent value="dashboard" className="mt-6">
                    <DashboardView
                        orders={orders}
                        onCreateOrder={() => setShowOrderForm(true)}
                    />
                </SwipeableTabsContent>

                <SwipeableTabsContent value="list" className="mt-6">
                    <OrderFilters
                        filters={filters}
                        totalOrders={stats.total_orders}
                        filteredCount={orders.length}
                        onFilterChange={setFilters}
                        onClearFilters={handleClearFilters}
                    />
                    <OrdersList
                        orders={orders}
                        hasFilters={hasFiltersApplied}
                        onCreateOrder={handleCreateOrder}
                        onViewOrder={handleViewOrder}
                        onEditOrder={handleEditOrder}
                        onUpdateStatus={handleUpdateStatus}
                        onClearFilters={handleClearFilters}
                    />
                </SwipeableTabsContent>

                <SwipeableTabsContent value="calendar" className="mt-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="font-medium mb-2">Tampilan Kalender</h3>
                                <p className="text-sm text-muted-foreground">
                                    Kalender pesanan berdasarkan tanggal kirim akan ditampilkan di sini
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>

                <SwipeableTabsContent value="analytics" className="mt-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-12">
                                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="font-medium mb-2">Analitik Penjualan</h3>
                                <p className="text-sm text-muted-foreground">
                                    Grafik penjualan dan tren bisnis akan ditampilkan di sini
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </SwipeableTabsContent>
            </SwipeableTabs>

            {/* Order Form Dialog */}
            <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
                <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            {selectedOrder ? `Edit Pesanan ${selectedOrder.order_no}` : 'Buat Pesanan Baru'}
                        </DialogTitle>
                    </DialogHeader>
                    <OrderForm
                        order={selectedOrder ? { ...selectedOrder, items: [] } : undefined}
                        onSubmit={async () => {
                            await queryClient.invalidateQueries({ queryKey: ['orders'] })
                            setShowOrderForm(false)
                            setSelectedOrder(null)
                        }}
                        onCancel={() => {
                            setShowOrderForm(false)
                            setSelectedOrder(null)
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
                <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-lg sm:text-xl">
                            Detail Pesanan {selectedOrder?.order_no}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedOrder && <OrderDetailView order={selectedOrder} />}
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default OrdersPage

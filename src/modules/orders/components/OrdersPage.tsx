'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Package,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  BarChart3
} from 'lucide-react'

// Types and constants
import { 
  Order, 
  OrderStatus, 
  PaymentStatus, 
  OrderFilters, 
  OrderStats,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS 
} from '../types'
import { 
  ORDER_STATUSES, 
  PAYMENT_STATUSES, 
  ORDER_PRIORITIES,
  ORDER_CONFIG 
} from '../constants'

// Lazy loading akan diimplementasikan setelah komponen ini
interface OrdersPageProps {
  userRole?: 'admin' | 'manager' | 'staff'
  enableAdvancedFeatures?: boolean
}

export default function OrdersPage({ 
  userRole = 'manager', 
  enableAdvancedFeatures = true 
}: OrdersPageProps) {
  // State management
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [activeView, setActiveView] = useState<'dashboard' | 'list' | 'calendar' | 'analytics'>('dashboard')
  
  // Filters
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    payment_status: [],
    date_from: '',
    date_to: '',
    customer_search: ''
  })
  
  // Stats
  const [stats, setStats] = useState<OrderStats>({
    total_orders: 0,
    pending_orders: 0,
    confirmed_orders: 0,
    in_production_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    total_revenue: 0,
    pending_revenue: 0,
    paid_revenue: 0,
    average_order_value: 0,
    total_customers: 0,
    repeat_customers: 0,
    period_growth: 0,
    revenue_growth: 0,
    order_growth: 0
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data for demonstration - in real app would fetch from API
      const mockOrders: Order[] = [
        {
          id: '1',
          order_number: 'ORD00001234',
          customer_name: 'Ibu Sari',
          customer_phone: '08123456789',
          customer_email: 'sari@email.com',
          status: 'confirmed',
          priority: 'normal',
          order_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: '1',
              order_id: '1',
              recipe_id: '1',
              recipe: {
                id: '1',
                name: 'Roti Tawar Premium',
                price: 25000,
                category: 'Roti',
                servings: 12
              },
              quantity: 2,
              unit_price: 25000,
              total_price: 50000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          subtotal: 50000,
          tax_amount: 5500,
          tax_rate: 0.11,
          discount_amount: 0,
          discount_percentage: 0,
          total_amount: 55500,
          payments: [],
          payment_status: 'unpaid',
          paid_amount: 0,
          remaining_amount: 55500,
          delivery_method: 'pickup',
          delivery_fee: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          order_number: 'ORD00001235',
          customer_name: 'Pak Budi',
          customer_phone: '08129876543',
          status: 'in_production',
          priority: 'high',
          order_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              id: '2',
              order_id: '2',
              recipe_id: '2',
              recipe: {
                id: '2',
                name: 'Kue Ulang Tahun',
                price: 150000,
                category: 'Cake',
                servings: 8
              },
              quantity: 1,
              unit_price: 150000,
              total_price: 150000,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          subtotal: 150000,
          tax_amount: 16500,
          tax_rate: 0.11,
          discount_amount: 0,
          discount_percentage: 0,
          total_amount: 166500,
          payments: [
            {
              id: '1',
              order_id: '2',
              amount: 83250,
              method: 'transfer',
              status: 'paid',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ],
          payment_status: 'partial',
          paid_amount: 83250,
          remaining_amount: 83250,
          delivery_method: 'delivery',
          delivery_address: 'Jl. Sudirman No. 123, Jakarta',
          delivery_fee: 15000,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      setOrders(mockOrders)
      
      // Calculate stats
      const newStats: OrderStats = {
        total_orders: mockOrders.length,
        pending_orders: mockOrders.filter(o => o.status === 'pending').length,
        confirmed_orders: mockOrders.filter(o => o.status === 'confirmed').length,
        in_production_orders: mockOrders.filter(o => o.status === 'in_production').length,
        completed_orders: mockOrders.filter(o => o.status === 'completed').length,
        cancelled_orders: mockOrders.filter(o => o.status === 'cancelled').length,
        total_revenue: mockOrders.reduce((sum, o) => sum + o.total_amount, 0),
        pending_revenue: mockOrders.filter(o => o.payment_status === 'unpaid').reduce((sum, o) => sum + o.total_amount, 0),
        paid_revenue: mockOrders.reduce((sum, o) => sum + o.paid_amount, 0),
        average_order_value: mockOrders.length > 0 ? mockOrders.reduce((sum, o) => sum + o.total_amount, 0) / mockOrders.length : 0,
        total_customers: new Set(mockOrders.map(o => o.customer_name)).size,
        repeat_customers: 0,
        period_growth: 15.5,
        revenue_growth: 23.2,
        order_growth: 18.7
      }
      
      setStats(newStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data pesanan')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const config = ORDER_STATUSES[status]
    return `${config.color} ${config.bgColor}`
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const config = PAYMENT_STATUSES[status]
    return `${config.color} ${config.bgColor}`
  }

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleCreateOrder = () => {
    // Will implement order form
    console.log('Create order')
  }

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order)
    // Will open edit form
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    // Will open detail view
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Update status via API
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ))
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  if (loading) {
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
            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-600 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium mb-2">Gagal Memuat Data</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchOrders}>Coba Lagi</Button>
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
            Order Management
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold">{stats.total_orders}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  +{stats.order_growth}% dari periode sebelumnya
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  +{stats.revenue_growth}% dari periode sebelumnya
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
                <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</p>
                <p className="text-xs text-muted-foreground mt-1">per pesanan</p>
              </div>
              <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.pending_revenue)}</p>
                <p className="text-xs text-muted-foreground mt-1">belum dibayar</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.pending_orders}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.confirmed_orders}</div>
              <div className="text-xs text-muted-foreground">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.in_production_orders}</div>
              <div className="text-xs text-muted-foreground">Produksi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.completed_orders}</div>
              <div className="text-xs text-muted-foreground">Selesai</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.cancelled_orders}</div>
              <div className="text-xs text-muted-foreground">Batal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.total_customers}</div>
              <div className="text-xs text-muted-foreground">Customer</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="list">Daftar Pesanan</TabsTrigger>
          <TabsTrigger value="calendar">Kalender</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pesanan Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-muted-foreground">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(order.order_date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                        <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribusi Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(ORDER_STATUSES).map(([status, config]) => {
                    const count = orders.filter(o => o.status === status).length
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0
                    
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{config.label}</span>
                          <span>{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${config.bgColor.replace('bg-', 'bg-opacity-60 bg-')}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari customer atau nomor pesanan..."
                      value={filters.customer_search || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, customer_search: e.target.value }))}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <Select 
                  value={filters.status?.join(',') || 'all'}
                  onValueChange={(value) => {
                    setFilters(prev => ({ 
                      ...prev, 
                      status: value === 'all' ? [] : [value as OrderStatus]
                    }))
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter Lainnya
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-lg">{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customer_name} • {formatDate(order.order_date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(order.status)}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        {PAYMENT_STATUS_LABELS[order.payment_status]}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Items</div>
                      <div className="font-medium">
                        {order.items.length} produk ({order.items.reduce((sum, item) => sum + item.quantity, 0)} qty)
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="font-medium text-lg">{formatCurrency(order.total_amount)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Due Date</div>
                      <div className="font-medium">{formatDate(order.due_date)}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Detail
                    </Button>
                    {ORDER_STATUSES[order.status].allowEdit && (
                      <Button variant="outline" size="sm" onClick={() => handleEditOrder(order)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                    {ORDER_STATUSES[order.status].nextStatuses.length > 0 && (
                      <Select 
                        value={order.status}
                        onValueChange={(newStatus) => handleUpdateStatus(order.id, newStatus as OrderStatus)}
                      >
                        <SelectTrigger className="w-[200px] h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={order.status || 'PENDING'} disabled>
                            {ORDER_STATUS_LABELS[order.status] || 'Status Tidak Diketahui'}
                          </SelectItem>
                          {ORDER_STATUSES[order.status].nextStatuses.map(status => (
                            <SelectItem key={status} value={status}>
                              {ORDER_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Calendar View</h3>
                <p className="text-sm text-muted-foreground">
                  Kalender pesanan berdasarkan due date akan ditampilkan di sini
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Analitik penjualan dan trend bisnis akan ditampilkan di sini
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
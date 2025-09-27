'use client'

import React, { useState, useEffect, useCallback } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useResponsive } from '@/hooks/use-mobile'
import {
  PullToRefresh,
  SwipeActions
} from '@/components/ui/mobile-gestures'

// Lazy loading imports
import { MiniChartWithLoading } from '@/components/lazy/chart-features'
import { ProgressiveLoader, StatsCardSkeleton } from '@/components/lazy/progressive-loading'
import {
  MobileForm,
  MobileInput,
  MobileTextarea,
  MobileNumberInput,
  MobileSelect
} from '@/components/ui/mobile-forms'
import { MobileTable } from '@/components/ui/mobile-table'
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Phone, 
  MapPin, 
  Clock,
  Package,
  CreditCard,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  CheckCircle
} from 'lucide-react'

// Order Status Configurations
const orderStatuses = {
  'PENDING': { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
  'CONFIRMED': { label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800' },
  'IN_PROGRESS': { label: 'Dalam Proses', color: 'bg-orange-100 text-orange-800' },
  'READY': { label: 'Siap', color: 'bg-green-100 text-green-800' },
  'DELIVERED': { label: 'Terkirim', color: 'bg-gray-100 text-gray-800' },
  'CANCELLED': { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
}

const paymentStatuses = {
  'UNPAID': { label: 'Belum Bayar', color: 'bg-red-100 text-red-800' },
  'PARTIAL': { label: 'Bayar Sebagian', color: 'bg-yellow-100 text-yellow-800' },
  'PAID': { label: 'Lunas', color: 'bg-green-100 text-green-800' }
}

const priorities = {
  'low': { label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
  'normal': { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  'high': { label: 'Tinggi', color: 'bg-red-100 text-red-800' }
}

// Helper functions
function getStatusInfo(status: string) {
  return orderStatuses[status as keyof typeof orderStatuses] || orderStatuses.PENDING
}

function getPriorityInfo(priority: string) {
  return priorities[priority as keyof typeof priorities] || priorities.normal
}


// Main OrdersPage component
export default function OrdersPage() {
  const { isMobile, isTablet } = useResponsive()
  
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingOrder, setEditingOrder] = useState<any>(null)

  // Fetch orders from API
  useEffect(() => {
    fetchOrders()
  }, [])

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setShowOrderDetail(true)
  }

  const handleEditOrder = (order: any) => {
    setEditingOrder(order)
    setShowOrderForm(true)
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        
        // Auto-update inventory for status changes that affect stock
        if (newStatus === 'DELIVERED' || newStatus === 'CANCELLED') {
          try {
            const inventoryAction = newStatus === 'DELIVERED' ? 'order_completed' : 'order_cancelled'
            const orderItems = updatedOrder.order_items || []
            
            if (orderItems.length > 0) {
              await fetch('/api/inventory/auto-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order_id: orderId,
                  action: inventoryAction,
                  order_items: orderItems.map((item: any) => ({
                    recipe_id: item.recipe_id,
                    quantity: item.quantity,
                    product_name: item.product_name
                  }))
                })
              })
              console.log(`✅ Inventory auto-updated for ${inventoryAction}`)
            }
          } catch (err) {
            console.error('⚠️ Failed to auto-update inventory for status change:', err)
          }
        }
      }
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
    totalRevenue: orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.total_amount || 0), 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length : 0
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  // Swipe actions for mobile
  const orderSwipeActions = [
    {
      id: 'view',
      label: 'Lihat',
      icon: <Eye className="h-4 w-4" />,
      color: 'blue' as const,
      onClick: (order: any) => handleViewOrder(order)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      color: 'green' as const,
      onClick: (order: any) => handleEditOrder(order)
    }
  ]

  return (
    <AppLayout>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Header */}
          <div className={`flex gap-4 ${
            isMobile ? 'flex-col items-center text-center' : 'flex-col sm:flex-row sm:justify-between sm:items-center'
          }`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h1 className={`font-bold text-foreground ${
                isMobile ? 'text-2xl' : 'text-2xl sm:text-3xl'
              }`}>Pesanan</h1>
              <p className="text-muted-foreground">Kelola pesanan dari pelanggan</p>
            </div>
          <Button 
            onClick={() => {
              setEditingOrder(null)
              setShowOrderForm(true)
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Pesanan Baru
          </Button>
        </div>

          {/* Stats Cards */}
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">semua pesanan</p>
              {stats.totalOrders > 0 && (
                <MiniChartWithLoading 
                  data={orders.slice(-7).map((order, index) => ({
                    day: index + 1,
                    count: 1
                  }))}
                  type="bar"
                  dataKey="count"
                  color="#3b82f6"
                  className="mt-2"
                  height={30}
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold text-orange-600 ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">perlu dikerjakan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>Rp {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">dari pesanan selesai</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`font-bold ${
                isMobile ? 'text-xl' : 'text-2xl'
              }`}>Rp {Math.round(stats.avgOrderValue).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">per pesanan</p>
            </CardContent>
          </Card>
        </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className={`flex gap-4 ${
                isMobile ? 'flex-col' : 'flex-col md:flex-row'
              }`}>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nomor pesanan atau nama pelanggan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-8 ${
                        isMobile ? 'h-12 text-base' : ''
                      }`}
                    />
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    className={`flex-1 sm:flex-none px-3 py-1.5 border border-input rounded-md bg-background text-sm min-w-0 ${
                      isMobile ? 'h-12 text-base' : ''
                    }`}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    {Object.entries(orderStatuses).map(([key, status]) => (
                      <option key={key} value={key}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List - Mobile Optimized */}
          <MobileTable
            data={filteredOrders}
            searchable
            searchPlaceholder="Cari pesanan..."
            onSearch={setSearchTerm}
            columns={[
              {
                key: 'order_info',
                label: 'Pesanan',
                accessor: 'order_no',
                render: (value, order) => {
                  const statusInfo = getStatusInfo(order.status)
                  const priorityInfo = getPriorityInfo(order.priority)
                  return (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{value}</p>
                        <Badge className={statusInfo.color + ' text-xs'}>
                          {statusInfo.label}
                        </Badge>
                        {order.priority !== 'normal' && (
                          <Badge variant="outline" className={priorityInfo.color + ' text-xs'}>
                            {priorityInfo.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {order.customer_name}
                      </p>
                      {isMobile && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.order_date} • {order.order_items?.length || 0} item
                        </p>
                      )}
                    </div>
                  )
                }
              },
              ...(!isMobile ? [{
                key: 'customer',
                label: 'Pelanggan',
                accessor: 'customer_name' as keyof any,
                render: (value: string, order: any) => (
                  <div>
                    <p className="font-medium">{value}</p>
                    {order.customer_phone && (
                      <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                    )}
                  </div>
                )
              }] : []),
              {
                key: 'amount',
                label: 'Total',
                accessor: 'total_amount',
                render: (value, order) => (
                  <div>
                    <p className="font-medium">Rp {(value || 0).toLocaleString()}</p>
                    {(order.paid_amount || 0) > 0 && (
                      <p className="text-sm text-green-600">
                        Dibayar: Rp {(order.paid_amount || 0).toLocaleString()}
                      </p>
                    )}
                    {isMobile && order.delivery_date && (
                      <p className="text-sm text-muted-foreground">
                        {order.delivery_date}
                      </p>
                    )}
                  </div>
                )
              },
              ...(!isMobile ? [{
                key: 'items',
                label: 'Items',
                accessor: (order: any) => order.order_items?.length || 0,
                render: (value: number, order: any) => (
                  <div className="text-sm">
                    <p>{value} item</p>
                    <p className="text-muted-foreground">
                      Qty: {order.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0}
                    </p>
                  </div>
                )
              }] : []),
              ...(!isMobile ? [{
                key: 'dates',
                label: 'Tanggal',
                accessor: 'order_date' as keyof any,
                render: (value: string, order: any) => (
                  <div className="text-sm">
                    <p>Pesan: {value}</p>
                    {order.delivery_date && (
                      <p>Kirim: {order.delivery_date}</p>
                    )}
                  </div>
                )
              }] : [])
            ]}
            actions={[
              {
                label: 'Lihat',
                icon: <Eye className="h-4 w-4" />,
                onClick: (order) => handleViewOrder(order)
              },
              {
                label: 'Edit',
                icon: <Edit className="h-4 w-4" />,
                onClick: (order) => handleEditOrder(order)
              },
              ...(filteredOrders.some(order => order.status === 'PENDING') ? [{
                label: 'Konfirmasi',
                icon: <CheckCircle className="h-4 w-4" />,
                onClick: (order: any) => updateOrderStatus(order.id, 'CONFIRMED'),
                show: (order: any) => order.status === 'PENDING'
              }] : []),
              ...(filteredOrders.some(order => order.status === 'CONFIRMED') ? [{
                label: 'Produksi',
                icon: <Package className="h-4 w-4" />,
                onClick: (order: any) => updateOrderStatus(order.id, 'IN_PROGRESS'),
                show: (order: any) => order.status === 'CONFIRMED'
              }] : []),
              ...(filteredOrders.some(order => order.status === 'IN_PROGRESS') ? [{
                label: 'Selesai',
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: (order: any) => updateOrderStatus(order.id, 'READY'),
                show: (order: any) => order.status === 'IN_PROGRESS'
              }] : []),
              ...(filteredOrders.some(order => order.status === 'READY') ? [{
                label: 'Kirim',
                icon: <Truck className="h-4 w-4" />,
                onClick: (order: any) => updateOrderStatus(order.id, 'DELIVERED'),
                show: (order: any) => order.status === 'READY'
              }] : [])
            ]}
            emptyMessage="Tidak ada pesanan ditemukan. Coba ubah filter atau buat pesanan baru."
          />

          {/* Order Form Dialog */}
        <Dialog open={showOrderForm} onOpenChange={setShowOrderForm}>
          <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingOrder ? `Edit Pesanan ${editingOrder.order_no}` : 'Buat Pesanan Baru'}
              </DialogTitle>
            </DialogHeader>
            <OrderForm 
              onClose={() => {
                setShowOrderForm(false)
                setEditingOrder(null)
              }} 
              onSuccess={() => {
                fetchOrders()
                setShowOrderForm(false)
                setEditingOrder(null)
              }}
              editData={editingOrder}
            />
          </DialogContent>
        </Dialog>

          {/* Order Detail Dialog */}
          <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
            <DialogContent className="w-full max-w-[95vw] sm:max-w-4xl max-h-[95vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Detail Pesanan {selectedOrder?.order_no}</DialogTitle>
              </DialogHeader>
              {selectedOrder && <OrderDetailView order={selectedOrder} />}
            </DialogContent>
          </Dialog>
        </div>
      </PullToRefresh>
    </AppLayout>
  )
}

// Order Form Component
function OrderForm({ onClose, onSuccess, editData }: { 
  onClose: () => void
  onSuccess?: () => void
  editData?: any | null 
}) {
  const [availableRecipes, setAvailableRecipes] = useState<any[]>([])
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    customer_name: editData?.customer_name || '',
    customer_phone: editData?.customer_phone || '',
    customer_address: editData?.customer_address || '',
    order_date: editData?.order_date || new Date().toISOString().split('T')[0],
    delivery_date: editData?.delivery_date || '',
    delivery_time: editData?.delivery_time || '',
    delivery_fee: editData?.delivery_fee || 0,
    discount: editData?.discount || 0,
    tax_amount: editData?.tax_amount || 0,
    payment_method: editData?.payment_method || 'CASH',
    paid_amount: editData?.paid_amount || 0,
    priority: editData?.priority || 'normal',
    notes: editData?.notes || '',
    special_instructions: editData?.special_instructions || ''
  })
  const [orderItems, setOrderItems] = useState<Array<{
    recipe_id: string
    recipe: any
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    special_requests: string
    hpp_data?: any // HPP calculation data
  }>>(editData?.order_items || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [hppCalculations, setHppCalculations] = useState<Record<string, any>>({})
  
  // Calculations
  const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0)
  const taxAmount = subtotal * (formData.tax_amount / 100)
  const totalAmount = subtotal - formData.discount + taxAmount + formData.delivery_fee

  // Fetch data
  useEffect(() => {
    fetchRecipes()
    fetchCustomers()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      if (response.ok) {
        const data = await response.json()
        setAvailableRecipes(data.filter((recipe: any) => recipe.is_active))
      }
    } catch (err) {
      console.error('Error fetching recipes:', err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setAvailableCustomers(data)
      }
    } catch (err) {
      console.error('Error fetching customers:', err)
    }
  }

  const fetchHPPCalculation = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/hpp`)
      if (response.ok) {
        const hppData = await response.json()
        setHppCalculations(prev => ({ ...prev, [recipeId]: hppData }))
        return hppData
      }
    } catch (err) {
      console.error('Error fetching HPP calculation:', err)
    }
    return null
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const selectCustomer = (customer: any) => {
    setFormData(prev => ({
      ...prev,
      customer_name: customer.name,
      customer_phone: customer.phone || '',
      customer_address: customer.address || ''
    }))
    setCustomerSearch('')
  }

  const addOrderItem = () => {
    if (availableRecipes.length === 0) {
      setError('Belum ada resep tersedia. Tambahkan resep terlebih dahulu.')
      return
    }
    
    const firstRecipe = availableRecipes[0]
    const newItem = {
      recipe_id: firstRecipe.id,
      recipe: firstRecipe,
      product_name: firstRecipe.name,
      quantity: 1,
      unit_price: firstRecipe.selling_price || 0,
      total_price: firstRecipe.selling_price || 0,
      special_requests: ''
    }
    setOrderItems(prev => [...prev, newItem])
  }

  const updateOrderItem = async (index: number, field: string, value: any) => {
    setOrderItems(prev => {
      const updated = [...prev]
      if (field === 'recipe_id') {
        const selectedRecipe = availableRecipes.find(recipe => recipe.id === value)
        if (selectedRecipe) {
          updated[index] = {
            ...updated[index],
            recipe_id: value,
            recipe: selectedRecipe,
            product_name: selectedRecipe.name,
            unit_price: selectedRecipe.selling_price || 0,
            total_price: (selectedRecipe.selling_price || 0) * updated[index].quantity
          }
          
          // Fetch HPP calculation for smart pricing
          fetchHPPCalculation(value).then(hppData => {
            if (hppData && hppData.suggested_selling_price) {
              setOrderItems(current => {
                const newItems = [...current]
                if (newItems[index]?.recipe_id === value) {
                  // Suggest optimal pricing if current price is significantly different
                  const currentPrice = newItems[index].unit_price
                  const suggestedPrice = hppData.suggested_selling_price
                  
                  newItems[index] = {
                    ...newItems[index],
                    hpp_data: hppData,
                    // Auto-update price if current price is 0 or far from suggested
                    unit_price: currentPrice === 0 || Math.abs(currentPrice - suggestedPrice) > suggestedPrice * 0.3 
                      ? suggestedPrice 
                      : currentPrice,
                    total_price: (currentPrice === 0 || Math.abs(currentPrice - suggestedPrice) > suggestedPrice * 0.3 
                      ? suggestedPrice 
                      : currentPrice) * newItems[index].quantity
                  }
                }
                return newItems
              })
            }
          })
        }
      } else if (field === 'quantity') {
        const qty = parseInt(value) || 0
        updated[index] = {
          ...updated[index],
          quantity: qty,
          total_price: updated[index].unit_price * qty
        }
      } else if (field === 'unit_price') {
        const price = parseFloat(value) || 0
        updated[index] = {
          ...updated[index],
          unit_price: price,
          total_price: price * updated[index].quantity
        }
      } else {
        updated[index] = { ...updated[index], [field]: value }
      }
      return updated
    })
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const generateOrderNumber = () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const timeStr = Math.floor(Date.now() / 1000).toString().slice(-3)
    return `ORD-${dateStr}-${timeStr}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer_name || orderItems.length === 0) {
      setError('Nama pelanggan dan minimal 1 item pesanan harus diisi')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    
    try {
      // Generate order number if not editing
      const orderNumber = editData?.order_no || generateOrderNumber()
      
      const orderData = {
        order_no: orderNumber,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        status: editData?.status || 'PENDING',
        order_date: formData.order_date,
        delivery_date: formData.delivery_date,
        delivery_time: formData.delivery_time,
        total_amount: totalAmount,
        discount: formData.discount,
        tax_amount: taxAmount,
        paid_amount: formData.paid_amount,
        payment_status: formData.paid_amount >= totalAmount ? 'PAID' : formData.paid_amount > 0 ? 'PARTIAL' : 'UNPAID',
        payment_method: formData.payment_method,
        priority: formData.priority,
        notes: formData.notes,
        special_instructions: formData.special_instructions,
        order_items: orderItems.map(item => ({
          recipe_id: item.recipe_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          special_requests: item.special_requests
        }))
      }
      
      const url = editData ? `/api/orders/${editData.id}` : '/api/orders'
      const method = editData ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menyimpan pesanan')
      }
      
      const savedOrder = await response.json()
      
      // Auto-update inventory for new orders
      if (!editData && savedOrder.id) {
        try {
          await fetch('/api/inventory/auto-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: savedOrder.id,
              action: 'order_created',
              order_items: orderItems.map(item => ({
                recipe_id: item.recipe_id,
                quantity: item.quantity,
                product_name: item.product_name
              }))
            })
          })
          console.log('✅ Inventory auto-updated for new order')
        } catch (err) {
          console.error('⚠️ Failed to auto-update inventory:', err)
          // Don't fail the order creation for inventory issues
        }
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="customer" className="text-xs sm:text-sm">Pelanggan</TabsTrigger>
          <TabsTrigger value="items" className="text-xs sm:text-sm">Item ({orderItems.length})</TabsTrigger>
          <TabsTrigger value="delivery" className="text-xs sm:text-sm">Pengiriman</TabsTrigger>
          <TabsTrigger value="payment" className="text-xs sm:text-sm">Pembayaran</TabsTrigger>
        </TabsList>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <TabsContent value="customer" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <h3 className="text-lg font-medium">Pelanggan</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowNewCustomer(!showNewCustomer)}
              className="self-end sm:self-auto"
            >
              {showNewCustomer ? 'Pilih Existing' : 'Customer Baru'}
            </Button>
          </div>
          
          {!showNewCustomer && (
            <div>
              <Label className="text-sm font-medium">Cari Pelanggan Existing</Label>
              <div className="relative">
                <Input
                  placeholder="Ketik nama atau nomor telepon..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="mt-1"
                />
                {customerSearch && (
                  <div className="absolute z-10 w-full bg-background border rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {availableCustomers
                      .filter(customer => 
                        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        (customer.phone && customer.phone.includes(customerSearch))
                      )
                      .map(customer => (
                        <div 
                          key={customer.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.phone}</div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="customerName" className="text-sm font-medium">Nama Pelanggan *</Label>
              <Input 
                id="customerName" 
                placeholder="Contoh: Ibu Sari Wahyuni"
                value={formData.customer_name}
                onChange={(e) => handleInputChange('customer_name', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone" className="text-sm font-medium">No. Telepon</Label>
              <Input 
                id="customerPhone" 
                placeholder="+62 812-3456-7890"
                value={formData.customer_phone}
                onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="customerAddress" className="text-sm font-medium">Alamat Lengkap</Label>
            <Textarea 
              id="customerAddress" 
              placeholder="Alamat lengkap pelanggan..."
              value={formData.customer_address}
              onChange={(e) => handleInputChange('customer_address', e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="orderDate" className="text-sm font-medium">Tanggal Pesan *</Label>
              <Input 
                id="orderDate" 
                type="date"
                value={formData.order_date}
                onChange={(e) => handleInputChange('order_date', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-sm font-medium">Prioritas</Label>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="high">Tinggi</option>
                <option value="low">Rendah</option>
              </select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h3 className="text-lg font-medium">Item Pesanan ({orderItems.length})</h3>
            <Button type="button" size="sm" onClick={addOrderItem} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Item
            </Button>
          </div>
          
          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2" />
              <p>Belum ada item yang ditambahkan</p>
              <p className="text-sm">Klik "Tambah Item" untuk memulai</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item, index) => {
                const hppData = item.hpp_data || hppCalculations[item.recipe_id]
                const hasHPP = hppData && hppData.hpp_breakdown
                
                return (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="p-3 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                            <select
                              className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                              value={item.recipe_id}
                              onChange={(e) => updateOrderItem(index, 'recipe_id', e.target.value)}
                            >
                              {availableRecipes.map(recipe => (
                                <option key={recipe.id} value={recipe.id}>
                                  {recipe.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 ml-2 mt-4"
                            onClick={() => removeOrderItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Jumlah</Label>
                            <Input
                              type="number"
                              className="text-sm mt-1"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                              min="1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                            <Input
                              className="text-sm font-medium mt-1 bg-gray-50"
                              value={`Rp ${item.total_price.toLocaleString()}`}
                              readOnly
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Harga Satuan
                            {hasHPP && hppData.margin_analysis && (
                              <span className={`text-xs px-1 py-0.5 rounded text-white ${
                                hppData.margin_analysis.is_profitable 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`}>
                                {hppData.margin_analysis.current_margin}%
                              </span>
                            )}
                          </Label>
                          <Input
                            type="number"
                            className={`text-sm mt-1 ${
                              hasHPP && !hppData.margin_analysis?.is_profitable 
                                ? 'border-red-300 bg-red-50' 
                                : hasHPP && hppData.margin_analysis?.is_profitable
                                ? 'border-green-300 bg-green-50'
                                : ''
                            }`}
                            value={item.unit_price}
                            onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                            min="0"
                            step="500"
                          />
                          {hasHPP && hppData.suggested_selling_price !== item.unit_price && (
                            <div className="text-xs text-blue-600 mt-1">
                              💡 Saran: Rp {hppData.suggested_selling_price.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex sm:items-center gap-3 p-4">
                      <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                          <select
                            className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                            value={item.recipe_id}
                            onChange={(e) => updateOrderItem(index, 'recipe_id', e.target.value)}
                          >
                            {availableRecipes.map(recipe => (
                              <option key={recipe.id} value={recipe.id}>
                                {recipe.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Jumlah</Label>
                          <Input
                            type="number"
                            className="text-sm mt-1"
                            value={item.quantity}
                            onChange={(e) => updateOrderItem(index, 'quantity', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div className="relative">
                          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            Harga Satuan
                            {hasHPP && hppData.margin_analysis && (
                              <span className={`text-xs px-1 py-0.5 rounded text-white ${
                                hppData.margin_analysis.is_profitable 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`}>
                                {hppData.margin_analysis.current_margin}%
                              </span>
                            )}
                          </Label>
                          <Input
                            type="number"
                            className={`text-sm mt-1 ${
                              hasHPP && !hppData.margin_analysis?.is_profitable 
                                ? 'border-red-300 bg-red-50' 
                                : hasHPP && hppData.margin_analysis?.is_profitable
                                ? 'border-green-300 bg-green-50'
                                : ''
                            }`}
                            value={item.unit_price}
                            onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                            min="0"
                            step="500"
                          />
                          {hasHPP && hppData.suggested_selling_price !== item.unit_price && (
                            <div className="absolute -bottom-6 left-0 text-xs text-blue-600">
                              💡 Saran: Rp {hppData.suggested_selling_price.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                          <Input
                            className="text-sm font-medium mt-1 bg-gray-50"
                            value={`Rp ${item.total_price.toLocaleString()}`}
                            readOnly
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => removeOrderItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* HPP Information Panel */}
                    {hasHPP && (
                      <div className="bg-gray-50 px-3 py-3 border-t text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <div className="font-medium text-gray-700 mb-1">💰 Analisis HPP</div>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Cost per serving:</span>
                                <span className="font-mono">Rp {hppData.hpp_breakdown.cost_per_serving.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Profit per unit:</span>
                                <span className={`font-mono ${
                                  item.unit_price > hppData.hpp_breakdown.cost_per_serving 
                                    ? 'text-green-600' 
                                    : 'text-red-600'
                                }`}>
                                  Rp {(item.unit_price - hppData.hpp_breakdown.cost_per_serving).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700 mb-1">📦 Stock & Produksi</div>
                            <div className="space-y-1">
                              {hppData.availability.can_produce ? (
                                <div className="text-green-600">✅ Bisa diproduksi (kapasitas: {hppData.availability.production_capacity} batch)</div>
                              ) : (
                                <div className="text-red-600">❌ Tidak bisa diproduksi - stock kurang</div>
                              )}
                              {hppData.availability.stock_warnings.length > 0 && (
                                <div className="text-orange-600">⚠️ {hppData.availability.stock_warnings.length} bahan akan habis segera</div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick pricing suggestions */}
                        {hppData.pricing_suggestions && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="font-medium text-gray-700 mb-1">🎯 Saran Harga:</div>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <button
                                type="button"
                                className="flex-1 sm:flex-none px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 min-w-0"
                                onClick={() => updateOrderItem(index, 'unit_price', hppData.pricing_suggestions.economy.price)}
                              >
                                <span className="hidden sm:inline">Ekonomis:</span>
                                <span className="sm:hidden">Eco:</span>
                                <span className="ml-1">Rp {hppData.pricing_suggestions.economy.price.toLocaleString()}</span>
                              </button>
                              <button
                                type="button"
                                className="flex-1 sm:flex-none px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 min-w-0"
                                onClick={() => updateOrderItem(index, 'unit_price', hppData.pricing_suggestions.standard.price)}
                              >
                                <span className="hidden sm:inline">Standar:</span>
                                <span className="sm:hidden">Std:</span>
                                <span className="ml-1">Rp {hppData.pricing_suggestions.standard.price.toLocaleString()}</span>
                              </button>
                              <button
                                type="button"
                                className="flex-1 sm:flex-none px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 min-w-0"
                                onClick={() => updateOrderItem(index, 'unit_price', hppData.pricing_suggestions.premium.price)}
                              >
                                <span className="hidden sm:inline">Premium:</span>
                                <span className="sm:hidden">Pre:</span>
                                <span className="ml-1">Rp {hppData.pricing_suggestions.premium.price.toLocaleString()}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span>Subtotal:</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="delivery" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="deliveryDate" className="text-sm font-medium">Tanggal Kirim</Label>
              <Input 
                id="deliveryDate" 
                type="date"
                value={formData.delivery_date}
                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deliveryTime" className="text-sm font-medium">Waktu Kirim</Label>
              <Input 
                id="deliveryTime" 
                type="time"
                value={formData.delivery_time}
                onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="deliveryFee" className="text-sm font-medium">Biaya Kirim</Label>
              <Input 
                id="deliveryFee" 
                type="number" 
                placeholder="15000"
                value={formData.delivery_fee}
                onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Catatan Khusus</Label>
            <Textarea 
              id="notes" 
              placeholder="Catatan untuk pesanan ini..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="specialInstructions" className="text-sm font-medium">Instruksi Khusus</Label>
            <Textarea 
              id="specialInstructions" 
              placeholder="Instruksi khusus untuk produksi..."
              value={formData.special_instructions}
              onChange={(e) => handleInputChange('special_instructions', e.target.value)}
              className="mt-1"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="payment" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="text-sm font-medium">Metode Pembayaran</Label>
              <select 
                className="w-full p-2 border border-input rounded-md bg-background mt-1"
                value={formData.payment_method}
                onChange={(e) => handleInputChange('payment_method', e.target.value)}
              >
                <option value="CASH">Tunai</option>
                <option value="BANK_TRANSFER">Transfer Bank</option>
                <option value="CREDIT_CARD">Kartu Kredit</option>
                <option value="DIGITAL_WALLET">E-Wallet</option>
              </select>
            </div>
            <div>
              <Label htmlFor="discount" className="text-sm font-medium">Diskon (Rp)</Label>
              <Input 
                id="discount" 
                type="number" 
                placeholder="10000"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                min="0"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tax" className="text-sm font-medium">Pajak (%)</Label>
              <Input 
                id="tax" 
                type="number" 
                placeholder="10"
                value={formData.tax_amount}
                onChange={(e) => handleInputChange('tax_amount', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="paidAmount" className="text-sm font-medium">Dibayar</Label>
              <Input 
                id="paidAmount" 
                type="number" 
                placeholder="0"
                value={formData.paid_amount}
                onChange={(e) => handleInputChange('paid_amount', parseFloat(e.target.value) || 0)}
                min="0"
                step="1000"
                className="mt-1"
              />
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Ringkasan Pembayaran</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon:</span>
                <span>- Rp {formData.discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak ({formData.tax_amount}%):</span>
                <span>Rp {taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Kirim:</span>
                <span>Rp {formData.delivery_fee.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>Rp {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Dibayar:</span>
                <span>Rp {formData.paid_amount.toLocaleString()}</span>
              </div>
              {totalAmount > formData.paid_amount && (
                <div className="flex justify-between text-red-600">
                  <span>Sisa:</span>
                  <span>Rp {(totalAmount - formData.paid_amount).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="order-2 sm:order-1">
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="order-1 sm:order-2">
            {isSubmitting ? 'Menyimpan...' : editData ? 'Update Pesanan' : 'Simpan Pesanan'}
          </Button>
        </div>
      </Tabs>
    </form>
  )
}

// Order Detail View Component
function OrderDetailView({ order }: { order: any }) {
  const statusInfo = getStatusInfo(order.status)
  const priorityInfo = getPriorityInfo(order.priority)

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
        <TabsTrigger value="items" className="text-xs sm:text-sm">Item</TabsTrigger>
        <TabsTrigger value="customer" className="text-xs sm:text-sm">Pelanggan</TabsTrigger>
        <TabsTrigger value="payment" className="text-xs sm:text-sm">Bayar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Pesanan</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Pesanan:</span>
                  <span className="font-mono">{order.order_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prioritas:</span>
                  <Badge variant="outline" className={priorityInfo.color}>{priorityInfo.label}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Pesan:</span>
                  <span>{order.order_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Kirim:</span>
                  <span>{order.delivery_date} {order.delivery_time}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Ringkasan Pembayaran</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>Rp {((order.total_amount || 0) - (order.tax_amount || 0) + (order.discount || 0) - (order.delivery_fee || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diskon:</span>
                  <span>- Rp {(order.discount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak:</span>
                  <span>Rp {(order.tax_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Kirim:</span>
                  <span>Rp {(order.delivery_fee || 0).toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>Rp {(order.total_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Dibayar:</span>
                  <span>Rp {(order.paid_amount || 0).toLocaleString()}</span>
                </div>
                {(order.total_amount || 0) > (order.paid_amount || 0) && (
                  <div className="flex justify-between text-red-600">
                    <span>Sisa:</span>
                    <span>Rp {((order.total_amount || 0) - (order.paid_amount || 0)).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {order.notes && (
          <div>
            <h3 className="font-medium">Catatan</h3>
            <p className="mt-2 text-sm text-muted-foreground p-3 bg-muted rounded-lg">{order.notes}</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="items" className="space-y-4">
        <h3 className="font-medium">Item Pesanan ({order.order_items?.length || 0})</h3>
        <div className="space-y-2">
          {order.order_items?.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x Rp {(item.unit_price || 0).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {(item.total_price || 0).toLocaleString()}</p>
              </div>
            </div>
          )) || (
            <div className="text-center py-4 text-muted-foreground">
              Tidak ada item pesanan
            </div>
          )}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Item: {order.order_items?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0}</span>
            <span>Subtotal: Rp {((order.total_amount || 0) - (order.tax_amount || 0) + (order.discount || 0) - (order.delivery_fee || 0)).toLocaleString()}</span>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="customer" className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-3">Informasi Pelanggan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.customer_phone}</span>
              </div>
            )}
            {order.customer_address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{order.customer_address}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline">
              <Phone className="h-3 w-3 mr-1" />
              Hubungi
            </Button>
            <Button size="sm" variant="outline">
              Edit Pelanggan
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="payment" className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{order.payment_method}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {(order.paid_amount || 0) >= (order.total_amount || 0) ? 'LUNAS' : 
                 (order.paid_amount || 0) > 0 ? 'SEBAGIAN' : 'BELUM BAYAR'}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Riwayat Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Riwayat pembayaran akan ditampilkan di sini
            </p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

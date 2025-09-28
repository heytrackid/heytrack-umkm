'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { SimpleDataTable } from '@/components/ui/simple-data-table'
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Calendar,
  User,
  Phone,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Package,
  Grid3X3,
  List,
  ChefHat
} from 'lucide-react'

interface Recipe {
  id: string
  name: string
  selling_price: number
  category: string
  description?: string
  is_active: boolean
}

interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

interface Order {
  id: string
  order_no: string
  order_date: string // Tanggal order 
  delivery_date: string // Tanggal selesai/ambil
  customer_name: string
  customer_phone: string
  items: OrderItem[]
  total_amount: number
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED'
  payment_status: 'UNPAID' | 'PARTIAL' | 'PAID'
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'DIGITAL_WALLET'
  notes: string
  created_at: string
  updated_at: string
}

interface OrderItem {
  recipe_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  special_requests?: string
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800', 
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const PAYMENT_STATUS_COLORS = {
  UNPAID: 'bg-red-100 text-red-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800'
}

const STATUS_LABELS = {
  PENDING: 'Menunggu',
  CONFIRMED: 'Dikonfirmasi',
  IN_PROGRESS: 'Dalam Proses',
  READY: 'Siap Diambil',
  DELIVERED: 'Selesai',
  CANCELLED: 'Dibatalkan'
}

const PAYMENT_LABELS = {
  UNPAID: 'Belum Bayar',
  PARTIAL: 'DP/Sebagian',
  PAID: 'Lunas'
}

export default function PesananBaru() {
  const { toast } = useToast()
  
  // State for data
  const [orders, setOrders] = useState<Order[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  
  // Form state for new order
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_date: new Date().toISOString().split('T')[0],
    payment_method: 'CASH' as const,
    payment_status: 'UNPAID' as const,
    notes: '',
    items: [{ recipe_id: '', product_name: '', quantity: 1, unit_price: 0, special_requests: '' }] as Omit<OrderItem, 'total_price'>[]
  })

  // Fetch data from API
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch recipes
      const recipesResponse = await fetch('/api/recipes')
      if (recipesResponse.ok) {
        const recipesData = await recipesResponse.json()
        setRecipes(recipesData)
      }
      
      // Fetch orders 
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData)
      }
      
      // Fetch customers
      const customersResponse = await fetch('/api/customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(customersData)
      }
      
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Generate order number
  const generateOrderNo = () => {
    const today = new Date()
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '')
    const orderCount = orders.filter(o => o.order_date === today.toISOString().split('T')[0]).length + 1
    return `ORD-${dateStr}-${orderCount.toString().padStart(3, '0')}`
  }

  // Add new order
  const addOrder = async () => {
    if (!newOrder.customer_name || !newOrder.customer_phone || newOrder.items.some(i => !i.recipe_id || i.quantity <= 0)) {
      toast({ 
        title: 'Validasi Error', 
        description: 'Lengkapi semua field yang diperlukan', 
        variant: 'destructive' 
      })
      return
    }

    // Calculate items with total price
    const itemsWithTotal = newOrder.items.map(item => ({
      ...item,
      total_price: item.quantity * item.unit_price
    }))

    const totalAmount = itemsWithTotal.reduce((sum, item) => sum + item.total_price, 0)

    const orderData = {
      order_no: generateOrderNo(),
      order_date: new Date().toISOString().split('T')[0],
      delivery_date: newOrder.delivery_date,
      customer_name: newOrder.customer_name,
      customer_phone: newOrder.customer_phone,
      total_amount: totalAmount,
      status: 'PENDING' as const,
      payment_status: newOrder.payment_status,
      payment_method: newOrder.payment_method,
      notes: newOrder.notes,
      items: itemsWithTotal
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        toast({ 
          title: 'Berhasil!', 
          description: `Pesanan ${orderData.order_no} berhasil dibuat`
        })
        
        // Reset form
        setNewOrder({
          customer_name: '',
          customer_phone: '',
          delivery_date: new Date().toISOString().split('T')[0],
          payment_method: 'CASH',
          payment_status: 'UNPAID',
          notes: '',
          items: [{ recipe_id: '', product_name: '', quantity: 1, unit_price: 0, special_requests: '' }]
        })
        
        setShowAddDialog(false)
        fetchData() // Refresh data
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast({
        title: 'Error',
        description: 'Gagal membuat pesanan',
        variant: 'destructive'
      })
    }
  }

  // Update order status
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status } : order
        ))
        toast({ title: `Status diubah ke ${STATUS_LABELS[status]}` })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive'
      })
    }
  }

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: paymentStatus })
      })

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, payment_status: paymentStatus } : order
        ))
        toast({ title: `Status bayar diubah ke ${PAYMENT_LABELS[paymentStatus]}` })
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast({
        title: 'Error',
        description: 'Gagal mengubah status pembayaran',
        variant: 'destructive'
      })
    }
  }

  // Delete order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('Yakin ingin menghapus pesanan ini?')) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setOrders(prev => prev.filter(order => order.id !== orderId))
        toast({ title: 'Pesanan berhasil dihapus' })
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      toast({
        title: 'Error',
        description: 'Gagal menghapus pesanan',
        variant: 'destructive'
      })
    }
  }

  // Form handlers
  const addItem = () => {
    setNewOrder(prev => ({
      ...prev,
      items: [...prev.items, { recipe_id: '', product_name: '', quantity: 1, unit_price: 0, special_requests: '' }]
    }))
  }

  const removeItem = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: keyof Omit<OrderItem, 'total_price'>, value: string | number) => {
    setNewOrder(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const selectRecipe = (index: number, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    if (recipe) {
      updateItem(index, 'recipe_id', recipeId)
      updateItem(index, 'product_name', recipe.name)
      updateItem(index, 'unit_price', recipe.selling_price)
    }
  }

  const selectCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setNewOrder(prev => ({
        ...prev,
        customer_name: customer.name,
        customer_phone: customer.phone
      }))
    }
  }

  // Utility functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'IN_PROGRESS': return <AlertCircle className="h-4 w-4" />
      case 'READY': return <Package className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <Trash2 className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone.includes(searchTerm) ||
      order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculate total estimate for new order
  const totalEstimate = newOrder.items.reduce((sum, item) => 
    sum + (item.quantity * item.unit_price), 0
  )

  // Stats
  const stats = {
    totalOrders: orders.length,
    todayOrders: orders.filter(o => o.order_date === new Date().toISOString().split('T')[0]).length,
    totalRevenue: orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.total_amount, 0),
    pendingOrders: orders.filter(o => o.status === 'PENDING').length
  }

  // Table columns for data table
  const tableColumns = [
    {
      key: 'order_no' as keyof Order,
      header: 'No. Pesanan',
      sortable: true,
      render: (value: string) => <span className="font-mono text-sm">{value}</span>
    },
    {
      key: 'customer_name' as keyof Order,
      header: 'Pelanggan',
      sortable: true,
      render: (value: string, item: Order) => (
        <div className="space-y-1">
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{item.customer_phone}</div>
        </div>
      )
    },
    {
      key: 'order_date' as keyof Order,
      header: 'Tanggal Order',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value)
        return <div className="text-sm">{date.toLocaleDateString('id-ID')}</div>
      }
    },
    {
      key: 'delivery_date' as keyof Order,
      header: 'Tanggal Selesai',
      sortable: true,
      render: (value: string) => {
        const date = new Date(value)
        return <div className="text-sm">{date.toLocaleDateString('id-ID')}</div>
      }
    },
    {
      key: 'items' as keyof Order,
      header: 'Items',
      render: (value: OrderItem[]) => (
        <div className="space-y-1">
          {value.slice(0, 2).map((item, idx) => (
            <div key={idx} className="text-sm">
              {item.product_name} x{item.quantity}
            </div>
          ))}
          {value.length > 2 && (
            <div className="text-xs text-muted-foreground">+{value.length - 2} lainnya</div>
          )}
        </div>
      )
    },
    {
      key: 'total_amount' as keyof Order,
      header: 'Total',
      sortable: true,
      render: (value: number) => (
        <div className="font-medium text-right">Rp {value.toLocaleString()}</div>
      )
    },
    {
      key: 'status' as keyof Order,
      header: 'Status',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
          STATUS_COLORS[value as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'
        }`}>
          {getStatusIcon(value)}
          {STATUS_LABELS[value as keyof typeof STATUS_LABELS] || value}
        </span>
      )
    },
    {
      key: 'payment_status' as keyof Order,
      header: 'Status Bayar',
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          PAYMENT_STATUS_COLORS[value as keyof typeof PAYMENT_STATUS_COLORS] || 'bg-gray-100 text-gray-800'
        }`}>
          {PAYMENT_LABELS[value as keyof typeof PAYMENT_LABELS] || value}
        </span>
      )
    }
  ]

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Memuat data...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              Pesanan
            </h1>
            <p className="text-muted-foreground mt-1">
              Kelola pesanan pelanggan dengan sistem terintegrasi
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg">
              <Button 
                variant={viewMode === 'grid' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none gap-2"
              >
                <Grid3X3 className="h-4 w-4" />
                Grid
              </Button>
              <Button 
                variant={viewMode === 'table' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none gap-2"
              >
                <List className="h-4 w-4" />
                Tabel
              </Button>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Pesanan Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Pesanan Baru</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Pelanggan</Label>
                      <Select onValueChange={selectCustomer}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pelanggan" />
                        </SelectTrigger>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name} - {customer.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Atau ketik nama baru"
                        value={newOrder.customer_name}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, customer_name: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Nomor Telepon</Label>
                      <Input
                        placeholder="08123456789"
                        value={newOrder.customer_phone}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, customer_phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Tanggal Selesai</Label>
                      <Input
                        type="date"
                        value={newOrder.delivery_date}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, delivery_date: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Metode Bayar</Label>
                      <Select 
                        value={newOrder.payment_method}
                        onValueChange={(value) => setNewOrder(prev => ({ ...prev, payment_method: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Tunai</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Transfer</SelectItem>
                          <SelectItem value="CREDIT_CARD">Kartu</SelectItem>
                          <SelectItem value="DIGITAL_WALLET">E-Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Status Pembayaran</Label>
                      <Select 
                        value={newOrder.payment_status}
                        onValueChange={(value) => setNewOrder(prev => ({ ...prev, payment_status: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UNPAID">Belum Bayar</SelectItem>
                          <SelectItem value="PARTIAL">DP/Sebagian</SelectItem>
                          <SelectItem value="PAID">Lunas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Item Pesanan</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Tambah Item
                      </Button>
                    </div>
                    
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {newOrder.items.map((item, index) => (
                        <div key={index} className="p-3 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Item #{index + 1}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={newOrder.items.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                              <Label className="text-xs">Resep/Produk</Label>
                              <Select 
                                value={item.recipe_id}
                                onValueChange={(value) => selectRecipe(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih resep" />
                                </SelectTrigger>
                                <SelectContent>
                                  {recipes
                                    .filter(recipe => recipe.is_active)
                                    .map((recipe) => (
                                    <SelectItem key={recipe.id} value={recipe.id}>
                                      <div className="flex items-center gap-2">
                                        <ChefHat className="h-4 w-4" />
                                        {recipe.name} - Rp {recipe.selling_price.toLocaleString()}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Jumlah</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Harga Satuan</Label>
                              <Input
                                type="number"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseInt(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Subtotal</Label>
                              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm font-medium">
                                Rp {(item.quantity * item.unit_price).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Catatan Khusus</Label>
                            <Input
                              placeholder="Misal: tanpa gula, extra manis, dll"
                              value={item.special_requests}
                              onChange={(e) => updateItem(index, 'special_requests', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Total */}
                    <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Pesanan:</span>
                        <span className="text-xl font-bold text-primary">
                          Rp {totalEstimate.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Catatan Pesanan</Label>
                    <Textarea
                      placeholder="Catatan khusus untuk pesanan..."
                      value={newOrder.notes}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, notes: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                      Batal
                    </Button>
                    <Button onClick={addOrder} className="flex-1">
                      Buat Pesanan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Pesanan</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hari Ini</p>
                  <p className="text-2xl font-bold">{stats.todayOrders}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendapatan</p>
                  <p className="text-xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Table or Grid View */}
        {viewMode === 'table' ? (
          <SimpleDataTable
            title="Daftar Pesanan"
            description="Kelola pesanan pelanggan dengan fitur pencarian dan filter"
            data={orders}
            columns={tableColumns}
            searchPlaceholder="Cari nama pelanggan, telepon, atau produk..."
            onAdd={() => setShowAddDialog(true)}
            onDelete={(item) => deleteOrder(item.id)}
            addButtonText="Pesanan Baru"
            emptyMessage="Belum ada pesanan. Buat pesanan pertama!"
            exportData={true}
          />
        ) : (
          <>
            {/* Search and Filter untuk Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari nama, telepon, atau produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="PENDING">Menunggu</SelectItem>
                      <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                      <SelectItem value="IN_PROGRESS">Dalam Proses</SelectItem>
                      <SelectItem value="READY">Siap Diambil</SelectItem>
                      <SelectItem value="DELIVERED">Selesai</SelectItem>
                      <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            {/* Orders Grid */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          {order.customer_name}
                          <span className="font-mono text-sm text-muted-foreground">
                            {order.order_no}
                          </span>
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customer_phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Order: {new Date(order.order_date).toLocaleDateString('id-ID')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Selesai: {new Date(order.delivery_date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${STATUS_COLORS[order.status]}`}>
                          {getStatusIcon(order.status)}
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status]}`}>
                          {PAYMENT_LABELS[order.payment_status]}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteOrder(order.id)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Items */}
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Item Pesanan:
                        </h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <div>
                                <span>{item.product_name} x {item.quantity}</span>
                                {item.special_requests && (
                                  <span className="text-muted-foreground ml-2">({item.special_requests})</span>
                                )}
                              </div>
                              <span className="font-medium">Rp {item.total_price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="text-xl font-bold text-primary">
                            Rp {order.total_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.payment_method}
                        </div>
                      </div>

                      {/* Notes */}
                      {order.notes && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">
                            💬 {order.notes}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Select 
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Menunggu</SelectItem>
                            <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                            <SelectItem value="IN_PROGRESS">Dalam Proses</SelectItem>
                            <SelectItem value="READY">Siap Diambil</SelectItem>
                            <SelectItem value="DELIVERED">Selesai</SelectItem>
                            <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select 
                          value={order.payment_status}
                          onValueChange={(value) => updatePaymentStatus(order.id, value as Order['payment_status'])}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UNPAID">Belum Bayar</SelectItem>
                            <SelectItem value="PARTIAL">DP/Sebagian</SelectItem>
                            <SelectItem value="PAID">Lunas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Tidak ada pesanan</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Tidak ditemukan pesanan yang sesuai filter' 
                      : 'Mulai terima pesanan pertama Anda'}
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Pesanan Baru
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
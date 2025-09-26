'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Users,
  Package,
  Eye,
  Phone,
  MapPin,
  Calendar,
  TrendingUp
} from 'lucide-react'

// Sample data
const sampleOrders = [
  {
    id: '1',
    orderNo: 'ORD-20240125-001',
    customerName: 'Ibu Sari Wahyuni',
    customerPhone: '+62 812-3456-7890',
    customerAddress: 'Jl. Mawar No. 15, Jakarta Selatan',
    status: 'PENDING',
    orderDate: '2024-01-25',
    deliveryDate: '2024-01-27',
    deliveryTime: '10:00',
    items: [
      { id: '1', name: 'Roti Tawar Premium', quantity: 3, unitPrice: 15000, total: 45000 },
      { id: '2', name: 'Croissant Butter', quantity: 6, unitPrice: 25000, total: 150000 }
    ],
    subtotal: 195000,
    discount: 10000,
    tax: 0,
    deliveryFee: 15000,
    totalAmount: 200000,
    paidAmount: 0,
    notes: 'Tolong dikemas yang rapi untuk acara ulang tahun',
    paymentMethod: 'CASH',
    priority: 'normal'
  },
  {
    id: '2',
    orderNo: 'ORD-20240125-002',
    customerName: 'PT. Kue Mantap',
    customerPhone: '+62 811-9876-5432',
    customerAddress: 'Jl. Sudirman No. 88, Jakarta Pusat',
    status: 'IN_PROGRESS',
    orderDate: '2024-01-24',
    deliveryDate: '2024-01-26',
    deliveryTime: '08:00',
    items: [
      { id: '3', name: 'Donat Glaze', quantity: 50, unitPrice: 8000, total: 400000 },
      { id: '4', name: 'Roti Tawar Premium', quantity: 10, unitPrice: 15000, total: 150000 }
    ],
    subtotal: 550000,
    discount: 50000,
    tax: 55000,
    deliveryFee: 25000,
    totalAmount: 580000,
    paidAmount: 200000,
    notes: 'Order rutin mingguan, mohon pastikan kualitas tetap terjaga',
    paymentMethod: 'BANK_TRANSFER',
    priority: 'high'
  },
  {
    id: '3',
    orderNo: 'ORD-20240124-003',
    customerName: 'Bpk. Ahmad Rizki',
    customerPhone: '+62 813-5555-1234',
    customerAddress: 'Jl. Melati No. 22, Bekasi',
    status: 'READY',
    orderDate: '2024-01-23',
    deliveryDate: '2024-01-25',
    deliveryTime: '14:30',
    items: [
      { id: '5', name: 'Croissant Butter', quantity: 12, unitPrice: 25000, total: 300000 }
    ],
    subtotal: 300000,
    discount: 0,
    tax: 30000,
    deliveryFee: 20000,
    totalAmount: 350000,
    paidAmount: 350000,
    notes: 'Untuk acara meeting kantor',
    paymentMethod: 'CREDIT_CARD',
    priority: 'normal'
  },
  {
    id: '4',
    orderNo: 'ORD-20240123-004',
    customerName: 'Restoran Bintang',
    customerPhone: '+62 814-7777-8888',
    customerAddress: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
    status: 'DELIVERED',
    orderDate: '2024-01-22',
    deliveryDate: '2024-01-23',
    deliveryTime: '07:00',
    items: [
      { id: '6', name: 'Roti Tawar Premium', quantity: 20, unitPrice: 15000, total: 300000 },
      { id: '7', name: 'Donat Glaze', quantity: 30, unitPrice: 8000, total: 240000 }
    ],
    subtotal: 540000,
    discount: 40000,
    tax: 50000,
    deliveryFee: 0,
    totalAmount: 550000,
    paidAmount: 550000,
    notes: 'Pengiriman pagi untuk stok hari ini',
    paymentMethod: 'BANK_TRANSFER',
    priority: 'high'
  }
]

const orderStatuses = [
  { value: 'PENDING', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' },
  { value: 'IN_PROGRESS', label: 'Sedang Dibuat', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100' },
  { value: 'READY', label: 'Siap', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
  { value: 'DELIVERED', label: 'Terkirim', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100' },
  { value: 'CANCELLED', label: 'Dibatalkan', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' }
]

const priorities = [
  { value: 'low', label: 'Rendah', color: 'bg-gray-100 text-gray-800' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'Tinggi', color: 'bg-red-100 text-red-800' }
]

export default function OrdersPage() {
  const [orders, setOrders] = useState(sampleOrders)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [priorityFilter, setPriorityFilter] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'Semua' || order.status === statusFilter
    const matchesPriority = priorityFilter === 'Semua' || order.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || orderStatuses[0]
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || priorities[1]
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length,
    totalRevenue: orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalAmount, 0),
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length : 0
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pesanan</h1>
            <p className="text-muted-foreground">Kelola pesanan dari pelanggan</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Pesanan Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Buat Pesanan Baru</DialogTitle>
              </DialogHeader>
              <OrderForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">semua pesanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">perlu dikerjakan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">dari pesanan selesai</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.avgOrderValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">per pesanan</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nomor pesanan atau nama pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="Semua">Semua Status</option>
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="Semua">Semua Prioritas</option>
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusInfo(order.status)
            const priorityInfo = getPriorityInfo(order.priority)
            
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.orderNo}</h3>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        {order.priority !== 'normal' && (
                          <Badge variant="outline" className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{order.customerName}</span>
                          <Phone className="h-4 w-4 ml-2" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Pesan: {order.orderDate}</span>
                          <span className="ml-4">Kirim: {order.deliveryDate} {order.deliveryTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate max-w-md">{order.customerAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">Rp {order.totalAmount.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.paidAmount > 0 && (
                          <span className="text-green-600">
                            Dibayar: Rp {order.paidAmount.toLocaleString()}
                          </span>
                        )}
                        {order.totalAmount > order.paidAmount && (
                          <span className="text-red-600 block">
                            Sisa: Rp {(order.totalAmount - order.paidAmount).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{order.items.length} item</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Total qty: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      </div>
                      {order.notes && (
                        <div className="text-muted-foreground truncate max-w-xs">
                          Note: {order.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                      </Button>
                      {order.status === 'PENDING' && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Konfirmasi
                        </Button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                        >
                          Mulai Produksi
                        </Button>
                      )}
                      {order.status === 'IN_PROGRESS' && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'READY')}
                        >
                          Tandai Selesai
                        </Button>
                      )}
                      {order.status === 'READY' && (
                        <Button 
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        >
                          Tandai Terkirim
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada pesanan ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah kata kunci pencarian atau filter
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Pesanan Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan {selectedOrder?.orderNo}</DialogTitle>
            </DialogHeader>
            {selectedOrder && <OrderDetailView order={selectedOrder} />}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

// Order Form Component
function OrderForm({ onClose }: { onClose: () => void }) {
  return (
    <Tabs defaultValue="customer" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="customer">Pelanggan</TabsTrigger>
        <TabsTrigger value="items">Item</TabsTrigger>
        <TabsTrigger value="delivery">Pengiriman</TabsTrigger>
        <TabsTrigger value="payment">Pembayaran</TabsTrigger>
      </TabsList>
      
      <TabsContent value="customer" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Nama Pelanggan</Label>
            <Input id="customerName" placeholder="Contoh: Ibu Sari Wahyuni" />
          </div>
          <div>
            <Label htmlFor="customerPhone">No. Telepon</Label>
            <Input id="customerPhone" placeholder="+62 812-3456-7890" />
          </div>
        </div>
        <div>
          <Label htmlFor="customerAddress">Alamat Lengkap</Label>
          <Textarea id="customerAddress" placeholder="Alamat lengkap pelanggan..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="orderDate">Tanggal Pesan</Label>
            <Input id="orderDate" type="date" />
          </div>
          <div>
            <Label htmlFor="priority">Prioritas</Label>
            <select className="w-full p-2 border border-input rounded-md bg-background">
              <option value="normal">Normal</option>
              <option value="high">Tinggi</option>
              <option value="low">Rendah</option>
            </select>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="items" className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Item Pesanan</h3>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Item
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Klik "Tambah Item" untuk menambahkan produk ke pesanan
        </p>
      </TabsContent>
      
      <TabsContent value="delivery" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="deliveryDate">Tanggal Kirim</Label>
            <Input id="deliveryDate" type="date" />
          </div>
          <div>
            <Label htmlFor="deliveryTime">Waktu Kirim</Label>
            <Input id="deliveryTime" type="time" />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Biaya Kirim</Label>
            <Input id="deliveryFee" type="number" placeholder="15000" />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Catatan Khusus</Label>
          <Textarea id="notes" placeholder="Catatan untuk pesanan ini..." />
        </div>
      </TabsContent>
      
      <TabsContent value="payment" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
            <select className="w-full p-2 border border-input rounded-md bg-background">
              <option value="CASH">Tunai</option>
              <option value="BANK_TRANSFER">Transfer Bank</option>
              <option value="CREDIT_CARD">Kartu Kredit</option>
              <option value="DIGITAL_WALLET">E-Wallet</option>
            </select>
          </div>
          <div>
            <Label htmlFor="discount">Diskon</Label>
            <Input id="discount" type="number" placeholder="10000" />
          </div>
          <div>
            <Label htmlFor="tax">Pajak (%)</Label>
            <Input id="tax" type="number" placeholder="10" />
          </div>
          <div>
            <Label htmlFor="downPayment">Uang Muka</Label>
            <Input id="downPayment" type="number" placeholder="100000" />
          </div>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Ringkasan Pembayaran</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Diskon:</span>
              <span>- Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak:</span>
              <span>Rp 0</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Kirim:</span>
              <span>Rp 0</span>
            </div>
            <hr />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>Rp 0</span>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button>Simpan Pesanan</Button>
      </div>
    </Tabs>
  )
}

// Order Detail View Component
function OrderDetailView({ order }: { order: any }) {
  const statusInfo = getStatusInfo(order.status)
  const priorityInfo = getPriorityInfo(order.priority)

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="items">Item</TabsTrigger>
        <TabsTrigger value="customer">Pelanggan</TabsTrigger>
        <TabsTrigger value="payment">Pembayaran</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Pesanan</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">No. Pesanan:</span>
                  <span className="font-mono">{order.orderNo}</span>
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
                  <span>{order.orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Kirim:</span>
                  <span>{order.deliveryDate} {order.deliveryTime}</span>
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
                  <span>Rp {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Diskon:</span>
                  <span>- Rp {order.discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak:</span>
                  <span>Rp {order.tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Biaya Kirim:</span>
                  <span>Rp {order.deliveryFee.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>Rp {order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Dibayar:</span>
                  <span>Rp {order.paidAmount.toLocaleString()}</span>
                </div>
                {order.totalAmount > order.paidAmount && (
                  <div className="flex justify-between text-red-600">
                    <span>Sisa:</span>
                    <span>Rp {(order.totalAmount - order.paidAmount).toLocaleString()}</span>
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
        <h3 className="font-medium">Item Pesanan ({order.items.length})</h3>
        <div className="space-y-2">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x Rp {item.unitPrice.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {item.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center font-medium">
            <span>Total Item: {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
            <span>Subtotal: Rp {order.subtotal.toLocaleString()}</span>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="customer" className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-3">Informasi Pelanggan</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.customerPhone}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{order.customerAddress}</span>
            </div>
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
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">{order.paymentMethod}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Status Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {order.paidAmount >= order.totalAmount ? 'LUNAS' : 'BELUM LUNAS'}
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

function getStatusInfo(status: string) {
  return orderStatuses.find(s => s.value === status) || orderStatuses[0]
}

function getPriorityInfo(priority: string) {
  return priorities.find(p => p.value === priority) || priorities[1]
}
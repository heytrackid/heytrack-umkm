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
  Users, 
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Star,
  Eye,
  MessageSquare,
  Gift,
  Award
} from 'lucide-react'

// Sample data
const sampleCustomers = [
  {
    id: '1',
    name: 'Ibu Sari Wahyuni',
    email: 'sari.wahyuni@gmail.com',
    phone: '+62 812-3456-7890',
    address: 'Jl. Mawar No. 15, Jakarta Selatan',
    customerType: 'retail',
    registrationDate: '2023-06-15',
    lastOrderDate: '2024-01-25',
    totalOrders: 12,
    totalSpent: 2400000,
    averageOrderValue: 200000,
    status: 'active',
    loyaltyPoints: 240,
    favoriteProducts: ['Roti Tawar Premium', 'Croissant Butter'],
    notes: 'Pelanggan setia, suka pesan untuk acara keluarga',
    rating: 4.8,
    orders: [
      { id: 'ORD-001', date: '2024-01-25', total: 200000, status: 'DELIVERED', items: 3 },
      { id: 'ORD-002', date: '2024-01-20', total: 150000, status: 'DELIVERED', items: 2 },
      { id: 'ORD-003', date: '2024-01-15', total: 300000, status: 'DELIVERED', items: 5 }
    ]
  },
  {
    id: '2',
    name: 'PT. Kue Mantap',
    email: 'procurement@kuemantap.co.id',
    phone: '+62 811-9876-5432',
    address: 'Jl. Sudirman No. 88, Jakarta Pusat',
    customerType: 'wholesale',
    registrationDate: '2023-03-20',
    lastOrderDate: '2024-01-24',
    totalOrders: 45,
    totalSpent: 18500000,
    averageOrderValue: 411111,
    status: 'active',
    loyaltyPoints: 1850,
    favoriteProducts: ['Donat Glaze', 'Roti Tawar Premium'],
    notes: 'Klien B2B, order rutin mingguan dalam jumlah besar',
    rating: 4.9,
    orders: [
      { id: 'ORD-004', date: '2024-01-24', total: 580000, status: 'IN_PROGRESS', items: 8 },
      { id: 'ORD-005', date: '2024-01-17', total: 620000, status: 'DELIVERED', items: 10 },
      { id: 'ORD-006', date: '2024-01-10', total: 480000, status: 'DELIVERED', items: 7 }
    ]
  },
  {
    id: '3',
    name: 'Bpk. Ahmad Rizki',
    email: 'ahmad.rizki88@yahoo.com',
    phone: '+62 813-5555-1234',
    address: 'Jl. Melati No. 22, Bekasi',
    customerType: 'retail',
    registrationDate: '2023-09-10',
    lastOrderDate: '2024-01-23',
    totalOrders: 8,
    totalSpent: 1200000,
    averageOrderValue: 150000,
    status: 'active',
    loyaltyPoints: 120,
    favoriteProducts: ['Croissant Butter'],
    notes: 'Suka pesan untuk meeting kantor, biasanya weekend',
    rating: 4.5,
    orders: [
      { id: 'ORD-007', date: '2024-01-23', total: 350000, status: 'READY', items: 1 },
      { id: 'ORD-008', date: '2024-01-10', total: 200000, status: 'DELIVERED', items: 2 }
    ]
  },
  {
    id: '4',
    name: 'Restoran Bintang',
    email: 'owner@restoranibintang.com',
    phone: '+62 814-7777-8888',
    address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
    customerType: 'wholesale',
    registrationDate: '2023-01-05',
    lastOrderDate: '2024-01-22',
    totalOrders: 52,
    totalSpent: 15600000,
    averageOrderValue: 300000,
    status: 'active',
    loyaltyPoints: 1560,
    favoriteProducts: ['Roti Tawar Premium', 'Donat Glaze', 'Croissant Butter'],
    notes: 'Klien restoran, order pagi untuk stok harian',
    rating: 4.7,
    orders: [
      { id: 'ORD-009', date: '2024-01-22', total: 550000, status: 'DELIVERED', items: 6 },
      { id: 'ORD-010', date: '2024-01-19', total: 450000, status: 'DELIVERED', items: 4 }
    ]
  },
  {
    id: '5',
    name: 'Ibu Dewi Sartika',
    email: 'dewi.sartika@gmail.com',
    phone: '+62 815-1111-2222',
    address: 'Jl. Anggrek No. 33, Depok',
    customerType: 'retail',
    registrationDate: '2023-11-20',
    lastOrderDate: '2023-12-15',
    totalOrders: 3,
    totalSpent: 450000,
    averageOrderValue: 150000,
    status: 'inactive',
    loyaltyPoints: 45,
    favoriteProducts: ['Roti Tawar Premium'],
    notes: 'Pelanggan baru, belum order lagi sejak Desember',
    rating: 4.0,
    orders: [
      { id: 'ORD-011', date: '2023-12-15', total: 180000, status: 'DELIVERED', items: 2 },
      { id: 'ORD-012', date: '2023-12-01', total: 160000, status: 'DELIVERED', items: 2 }
    ]
  }
]

const customerTypes = ['Semua', 'retail', 'wholesale']
const customerStatuses = ['Semua', 'active', 'inactive']

export default function CustomersPage() {
  const [customers, setCustomers] = useState(sampleCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [statusFilter, setStatusFilter] = useState('Semua')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm)
    const matchesType = typeFilter === 'Semua' || customer.customerType === typeFilter
    const matchesStatus = statusFilter === 'Semua' || customer.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retail': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
      case 'wholesale': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'retail': return 'Retail'
      case 'wholesale': return 'Grosir'
      default: return 'Unknown'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif'
      case 'inactive': return 'Tidak Aktif'
      default: return 'Unknown'
    }
  }

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsViewDialogOpen(true)
  }

  // Calculate stats
  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgCustomerValue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pelanggan</h1>
            <p className="text-muted-foreground">Kelola data dan riwayat pelanggan</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
              </DialogHeader>
              <CustomerForm onClose={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">terdaftar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pelanggan Aktif</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% dari total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">dari semua pelanggan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.avgCustomerValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">per pelanggan</p>
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
                    placeholder="Cari nama, email, atau telepon..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  {customerTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'Semua' ? 'Semua Tipe' : getTypeLabel(type)}
                    </option>
                  ))}
                </select>
                <select
                  className="px-3 py-1.5 border border-input rounded-md bg-background text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  {customerStatuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'Semua' ? 'Semua Status' : getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold truncate">{customer.name}</h3>
                      <div className="flex gap-1">
                        <Badge className={getTypeColor(customer.customerType)}>
                          {getTypeLabel(customer.customerType)}
                        </Badge>
                        <Badge className={getStatusColor(customer.status)}>
                          {getStatusLabel(customer.status)}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{customer.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Pesanan</p>
                    <p className="font-medium">{customer.totalOrders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Belanja</p>
                    <p className="font-medium">Rp {customer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rata-rata</p>
                    <p className="font-medium">Rp {customer.averageOrderValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Poin Loyalitas</p>
                    <div className="flex items-center gap-1">
                      <Gift className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">{customer.loyaltyPoints}</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Rating Pelanggan</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{customer.rating}</span>
                  </div>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground mb-1">Terakhir Pesan</p>
                  <p className="font-medium">{customer.lastOrderDate}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewCustomer(customer)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Detail
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-3 w-3 mr-1" />
                    Hubungi
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Tidak ada pelanggan ditemukan</h3>
              <p className="text-muted-foreground mb-4">
                Coba ubah kata kunci pencarian atau filter
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Pelanggan Pertama
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Customer Detail Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            </DialogHeader>
            {selectedCustomer && <CustomerDetailView customer={selectedCustomer} />}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}

// Customer Form Component
function CustomerForm({ onClose }: { onClose: () => void }) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Info Dasar</TabsTrigger>
        <TabsTrigger value="additional">Info Tambahan</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nama Pelanggan</Label>
            <Input id="name" placeholder="Contoh: Ibu Sari Wahyuni" />
          </div>
          <div>
            <Label htmlFor="customerType">Tipe Pelanggan</Label>
            <select className="w-full p-2 border border-input rounded-md bg-background">
              <option value="retail">Retail</option>
              <option value="wholesale">Grosir</option>
            </select>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="sari.wahyuni@gmail.com" />
          </div>
          <div>
            <Label htmlFor="phone">No. Telepon</Label>
            <Input id="phone" placeholder="+62 812-3456-7890" />
          </div>
        </div>
        <div>
          <Label htmlFor="address">Alamat Lengkap</Label>
          <Textarea id="address" placeholder="Alamat lengkap pelanggan..." />
        </div>
      </TabsContent>
      
      <TabsContent value="additional" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="registrationDate">Tanggal Registrasi</Label>
            <Input id="registrationDate" type="date" />
          </div>
          <div>
            <Label htmlFor="loyaltyPoints">Poin Loyalitas</Label>
            <Input id="loyaltyPoints" type="number" placeholder="0" />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Catatan</Label>
          <Textarea id="notes" placeholder="Catatan tentang pelanggan..." />
        </div>
      </TabsContent>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button>Simpan Pelanggan</Button>
      </div>
    </Tabs>
  )
}

// Customer Detail View Component
function CustomerDetailView({ customer }: { customer: any }) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="orders">Pesanan</TabsTrigger>
        <TabsTrigger value="analytics">Analitik</TabsTrigger>
        <TabsTrigger value="notes">Catatan</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Informasi Kontak</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{customer.address}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Status & Tipe</h3>
              <div className="mt-2 flex gap-2">
                <Badge className={getTypeColor(customer.customerType)}>
                  {getTypeLabel(customer.customerType)}
                </Badge>
                <Badge className={getStatusColor(customer.status)}>
                  {getStatusLabel(customer.status)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Statistik Pelanggan</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pesanan:</span>
                  <span className="font-medium">{customer.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Belanja:</span>
                  <span className="font-medium">Rp {customer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rata-rata Order:</span>
                  <span className="font-medium">Rp {customer.averageOrderValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Poin Loyalitas:</span>
                  <div className="flex items-center gap-1">
                    <Gift className="h-3 w-3 text-yellow-500" />
                    <span className="font-medium">{customer.loyaltyPoints}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{customer.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Produk Favorit</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {customer.favoriteProducts.map((product: string, index: number) => (
              <Badge key={index} variant="outline">{product}</Badge>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium">Timeline</h3>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terdaftar:</span>
              <span>{customer.registrationDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Terakhir Order:</span>
              <span>{customer.lastOrderDate}</span>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="orders" className="space-y-4">
        <h3 className="font-medium">Riwayat Pesanan ({customer.orders.length})</h3>
        <div className="space-y-2">
          {customer.orders.map((order: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  {order.date} • {order.items} item
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {order.total.toLocaleString()}</p>
                <Badge 
                  className={
                    order.status === 'DELIVERED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Frekuensi Order</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{customer.totalOrders}</p>
              <p className="text-xs text-muted-foreground">total pesanan</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Nilai Pelanggan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">Rp {customer.totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">total belanja</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Loyalitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">{customer.loyaltyPoints}</span>
              </div>
              <p className="text-xs text-muted-foreground">poin terkumpul</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Trend Pembelian</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Grafik trend pembelian akan ditampilkan di sini
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="notes" className="space-y-4">
        <div>
          <h3 className="font-medium">Catatan Pelanggan</h3>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm">{customer.notes}</p>
          </div>
        </div>
        <div>
          <Label htmlFor="newNote">Tambah Catatan Baru</Label>
          <Textarea id="newNote" placeholder="Tulis catatan baru..." />
          <Button className="mt-2" size="sm">
            <MessageSquare className="h-3 w-3 mr-1" />
            Simpan Catatan
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function getTypeColor(type: string) {
  switch (type) {
    case 'retail': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
    case 'wholesale': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
    case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'retail': return 'Retail'
    case 'wholesale': return 'Grosir'
    default: return 'Unknown'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'active': return 'Aktif'
    case 'inactive': return 'Tidak Aktif'
    default: return 'Unknown'
  }
}
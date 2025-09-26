'use client'

import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

// Sample data - in real app, this would come from your database
const stats = [
  {
    title: 'Total Penjualan Hari Ini',
    value: 'Rp 2.450.000',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign
  },
  {
    title: 'Pesanan Aktif',
    value: '24',
    change: '+3',
    trend: 'up',
    icon: ShoppingCart
  },
  {
    title: 'Produk Terjual',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: Package
  },
  {
    title: 'Pelanggan Baru',
    value: '12',
    change: '+2',
    trend: 'up',
    icon: Users
  }
]

const lowStockItems = [
  { name: 'Tepung Terigu', stock: 8, minStock: 10, unit: 'kg' },
  { name: 'Telur Ayam', stock: 2, minStock: 5, unit: 'kg' },
  { name: 'Mentega', stock: 1, minStock: 2, unit: 'kg' }
]

const recentOrders = [
  { id: 'ORD20240101-001', customer: 'Ibu Sari', status: 'PENDING', total: 125000 },
  { id: 'ORD20240101-002', customer: 'Pak Budi', status: 'IN_PROGRESS', total: 450000 },
  { id: 'ORD20240101-003', customer: 'Toko Roti Mawar', status: 'READY', total: 850000 }
]

const getStatusBadge = (status: string) => {
  const statusMap = {
    'PENDING': { label: 'Menunggu', variant: 'secondary' as const },
    'IN_PROGRESS': { label: 'Proses', variant: 'default' as const },
    'READY': { label: 'Siap', variant: 'default' as const },
    'DELIVERED': { label: 'Terkirim', variant: 'secondary' as const }
  }
  return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const }
}

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di sistem manajemen toko roti</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Stok Menipis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Stok: {item.stock} {item.unit} / Min: {item.minStock} {item.unit}
                      </p>
                    </div>
                    <Badge variant="destructive">Rendah</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-blue-500" />
                <span>Pesanan Terbaru</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => {
                  const status = getStatusBadge(order.status)
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <p className="text-sm font-medium mt-1">
                          Rp {order.total.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <button className="flex flex-col items-center space-y-2 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                <ShoppingCart className="h-8 w-8 text-blue-500" />
                <span className="font-medium text-foreground">Pesanan Baru</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                <Package className="h-8 w-8 text-green-500" />
                <span className="font-medium text-foreground">Tambah Resep</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <span className="font-medium text-foreground">Hitung HPP</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                <CheckCircle className="h-8 w-8 text-orange-500" />
                <span className="font-medium text-foreground">Update Stok</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

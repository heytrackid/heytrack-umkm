'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SmartNotificationCenter } from '@/components/automation/smart-notification-center'
import { useSupabaseData } from '@/hooks/useSupabaseCRUD'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react'


const getStatusBadge = (status: string) => {
  const statusMap = {
    'PENDING': { label: 'Menunggu', variant: 'secondary' as const },
    'IN_PROGRESS': { label: 'Proses', variant: 'default' as const },
    'READY': { label: 'Siap', variant: 'default' as const },
    'DELIVERED': { label: 'Terkirim', variant: 'secondary' as const }
  }
  return statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Dashboard() {
  // Fetch real data from database
  const { data: ingredients, loading: ingredientsLoading } = useSupabaseData('ingredients')
  const { data: orders, loading: ordersLoading } = useSupabaseData('orders', {
    orderBy: { column: 'created_at', ascending: false },
    limit: 5
  })
  const { data: customers, loading: customersLoading } = useSupabaseData('customers')
  const { data: recipes, loading: recipesLoading } = useSupabaseData('recipes')
  
  const [stats, setStats] = useState({
    totalSales: 0,
    activeOrders: 0,
    productsSold: 0,
    newCustomers: 0
  })

  // Calculate real stats from data
  useEffect(() => {
    if (!ordersLoading && orders) {
      const today = new Date().toDateString()
      const todaysOrders = orders.filter(order => 
        new Date(order.created_at).toDateString() === today
      )
      
      const totalSales = todaysOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const activeOrders = orders.filter(order => 
        ['PENDING', 'IN_PROGRESS'].includes(order.status)
      ).length
      
      setStats({
        totalSales,
        activeOrders,
        productsSold: todaysOrders.reduce((sum, order) => sum + 1, 0), // Simple count for now
        newCustomers: customers?.length || 0
      })
    }
  }, [orders, ordersLoading, customers])
  
  // Low stock items
  const lowStockItems = ingredients?.filter(ingredient => 
    ingredient.current_stock <= ingredient.min_stock
  ) || []
  
  // Chart data
  const inventoryChartData = ingredients?.slice(0, 5).map(ingredient => ({
    name: ingredient.name.substring(0, 10) + '...',
    stock: ingredient.current_stock,
    min: ingredient.min_stock
  })) || []
  
  const categoryData = ingredients?.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Lainnya'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const pieData = categoryData ? Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count
  })) : []
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di sistem manajemen toko roti</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penjualan Hari Ini</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rp {stats.totalSales.toLocaleString('id-ID')}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+12.5%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Aktif</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeOrders}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+{stats.activeOrders > 0 ? '3' : '0'}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bahan Baku</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredients?.length || 0}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-orange-500">{lowStockItems.length} menipis</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resep</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes?.length || 0}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-green-500">+2</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart Notifications */}
        <SmartNotificationCenter />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Stok Menipis ({lowStockItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.length > 0 ? (
                  lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stok: {item.current_stock} {item.unit} / Min: {item.min_stock} {item.unit}
                        </p>
                      </div>
                      <Badge variant={item.current_stock <= item.min_stock * 0.5 ? "destructive" : "secondary"}>
                        {item.current_stock <= item.min_stock * 0.5 ? 'Kritis' : 'Rendah'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2" />
                    <p>Semua stok dalam kondisi baik</p>
                  </div>
                )}
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
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => {
                    const status = getStatusBadge(order.status)
                    return (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{order.order_no}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_name || 'Walk-in customer'}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <p className="text-sm font-medium mt-1">
                            Rp {(order.total_amount || 0).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                    <p>Belum ada pesanan</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inventory Stock Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Stok Bahan Baku</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {inventoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inventoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="stock" fill="#8884d8" name="Stok Saat Ini" />
                      <Bar dataKey="min" fill="#ff7300" name="Minimum" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                      <p>Belum ada data stok</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Kategori Bahan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p>Belum ada data kategori</p>
                    </div>
                  </div>
                )}
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

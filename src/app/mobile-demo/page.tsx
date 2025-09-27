'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  PullToRefresh, 
  InfiniteScroll, 
  SwipeActions,
  PullToRefreshInfiniteScroll 
} from '@/components/ui/mobile-gestures'
import {
  MobileLineChart,
  MobileAreaChart,
  MobileBarChart,
  MobilePieChart,
  MiniChart
} from '@/components/ui/mobile-charts'
import { MobileTable } from '@/components/ui/mobile-table'
import {
  MobileForm,
  MobileInput,
  MobileTextarea,
  MobileNumberInput,
  MobileSelect,
  MobileCheckbox
} from '@/components/ui/mobile-forms'
import { useResponsive } from '@/hooks/use-mobile'
import {
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Share2,
  Edit,
  Trash2,
  Star,
  Heart,
  ShoppingCart,
  User,
  TrendingUp,
  DollarSign,
  Package,
  Users
} from 'lucide-react'

// Demo data
const chartData = [
  { name: 'Jan', sales: 4000, orders: 2400, customers: 240 },
  { name: 'Feb', sales: 3000, orders: 1398, customers: 221 },
  { name: 'Mar', sales: 2000, orders: 9800, customers: 229 },
  { name: 'Apr', sales: 2780, orders: 3908, customers: 200 },
  { name: 'May', sales: 1890, orders: 4800, customers: 218 },
  { name: 'Jun', sales: 2390, orders: 3800, customers: 250 },
]

const pieData = [
  { name: 'Roti', value: 400, fill: '#3b82f6' },
  { name: 'Kue', value: 300, fill: '#10b981' },
  { name: 'Pastry', value: 300, fill: '#f59e0b' },
  { name: 'Minuman', value: 200, fill: '#ef4444' },
]

const tableData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Produk ${i + 1}`,
  category: ['Roti', 'Kue', 'Pastry', 'Minuman'][Math.floor(Math.random() * 4)],
  price: Math.floor(Math.random() * 100000) + 10000,
  stock: Math.floor(Math.random() * 100),
  status: Math.random() > 0.3 ? 'available' : 'out_of_stock',
  created_at: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
}))

export default function MobileDemoPage() {
  const { isMobile, isTablet, screenSize, orientation } = useResponsive()
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`))

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setItems(Array.from({ length: 10 }, (_, i) => `Refreshed Item ${i + 1}`))
    setRefreshing(false)
  }, [])

  const handleLoadMore = useCallback(() => {
    if (loading) return
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newItems = Array.from({ length: 5 }, (_, i) => 
        `Item ${items.length + i + 1}`
      )
      setItems(prev => [...prev, ...newItems])
      setLoading(false)
      
      // Stop loading more after 50 items
      if (items.length >= 50) {
        setHasMore(false)
      }
    }, 1000)
  }, [loading, items.length])

  const swipeActions = [
    {
      id: 'favorite',
      label: 'Favorit',
      icon: <Star className="h-4 w-4" />,
      color: 'yellow' as const,
      onClick: () => console.log('Favorited')
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      color: 'blue' as const,
      onClick: () => console.log('Edit')
    },
    {
      id: 'delete',
      label: 'Hapus',
      icon: <Trash2 className="h-4 w-4" />,
      color: 'red' as const,
      onClick: () => console.log('Delete')
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Mobile UX Demo</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {isMobile ? <Smartphone className="h-3 w-3" /> : 
                 isTablet ? <Tablet className="h-3 w-3" /> : 
                 <Monitor className="h-3 w-3" />}
                {screenSize?.width}x{screenSize?.height} • {orientation}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-4 space-y-6">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="gestures">Gestures</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Penjualan
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 45,231,890</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% dari bulan lalu
                  </p>
                  <MiniChart 
                    data={chartData}
                    type="area"
                    dataKey="sales"
                    color="#10b981"
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pesanan
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-xs text-muted-foreground">
                    +15% dari bulan lalu
                  </p>
                  <MiniChart 
                    data={chartData}
                    type="bar"
                    dataKey="orders"
                    color="#3b82f6"
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Produk Aktif
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    +8 produk baru
                  </p>
                  <MiniChart 
                    data={chartData}
                    type="line"
                    dataKey="customers"
                    color="#f59e0b"
                    className="mt-3"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pelanggan
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +180 pelanggan baru
                  </p>
                  <div className="mt-3 w-full bg-secondary h-2 rounded-full">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Table */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>
                  Tabel responsif dengan aksi swipe pada mobile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileTable
                  data={tableData.slice(0, 10)}
                  columns={[
                    { 
                      key: 'name', 
                      label: 'Nama',
                      accessor: 'name',
                      render: (value, row) => (
                        <div>
                          <div className="font-medium">{value}</div>
                          <div className="text-sm text-muted-foreground">
                            {row.category}
                          </div>
                        </div>
                      )
                    },
                    { 
                      key: 'price', 
                      label: 'Harga',
                      accessor: 'price',
                      render: (value) => `Rp ${value.toLocaleString()}`
                    },
                    { 
                      key: 'stock', 
                      label: 'Stok',
                      accessor: 'stock',
                      render: (value) => value.toString()
                    },
                    { 
                      key: 'status', 
                      label: 'Status',
                      accessor: 'status',
                      render: (value) => (
                        <Badge variant={value === 'available' ? 'default' : 'secondary'}>
                          {value === 'available' ? 'Tersedia' : 'Habis'}
                        </Badge>
                      )
                    }
                  ]}
                  actions={[
                    {
                      label: 'Edit',
                      icon: <Edit className="h-4 w-4" />,
                      onClick: (row) => console.log('Edit', row.id)
                    },
                    {
                      label: 'Hapus',
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: (row) => console.log('Delete', row.id),
                      variant: 'destructive'
                    }
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Line Chart */}
              <MobileLineChart
                title="Tren Penjualan"
                description="Data penjualan bulanan"
                data={chartData}
                xKey="name"
                lines={[
                  { key: 'sales', name: 'Penjualan', color: '#3b82f6' },
                  { key: 'orders', name: 'Pesanan', color: '#10b981' }
                ]}
                trend={{
                  value: 12.5,
                  direction: 'up',
                  label: 'vs bulan lalu'
                }}
                showDownload
                showShare
              />

              {/* Area Chart */}
              <MobileAreaChart
                title="Pertumbuhan Pelanggan"
                description="Akuisisi pelanggan bulanan"
                data={chartData}
                xKey="name"
                areas={[
                  { key: 'customers', name: 'Pelanggan', color: '#f59e0b' }
                ]}
                trend={{
                  value: 8.2,
                  direction: 'up'
                }}
              />

              {/* Bar Chart */}
              <MobileBarChart
                title="Performa Produk"
                description="Penjualan berdasarkan kategori"
                data={pieData}
                xKey="name"
                bars={[
                  { key: 'value', name: 'Penjualan', color: '#3b82f6' }
                ]}
              />

              {/* Pie Chart */}
              <MobilePieChart
                title="Distribusi Kategori"
                description="Pembagian penjualan per kategori"
                data={pieData}
                valueKey="value"
                nameKey="name"
                innerRadius={60}
              />
            </div>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Mobile-Friendly</CardTitle>
                <CardDescription>
                  Form yang dioptimalkan untuk penggunaan mobile dengan touch targets yang besar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MobileForm className="space-y-4">
                  <MobileInput
                    label="Nama Produk"
                    placeholder="Masukkan nama produk"
                    hint="Nama produk harus unik"
                  />
                  <MobileTextarea
                    label="Deskripsi"
                    placeholder="Masukkan deskripsi produk"
                    hint="Maksimal 500 karakter"
                  />
                  <MobileNumberInput
                    label="Harga"
                    placeholder="0"
                    min={0}
                    step={1000}
                    formatCurrency
                  />
                  <MobileSelect
                    label="Kategori"
                    placeholder="Pilih kategori"
                    options={[
                      { value: 'roti', label: 'Roti' },
                      { value: 'kue', label: 'Kue' },
                      { value: 'pastry', label: 'Pastry' },
                      { value: 'minuman', label: 'Minuman' }
                    ]}
                  />
                  <MobileCheckbox label="Produk unggulan" />
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1">Simpan</Button>
                    <Button variant="outline" className="flex-1">Batal</Button>
                  </div>
                </MobileForm>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestures Tab */}
          <TabsContent value="gestures" className="space-y-6">
            {/* Pull to Refresh */}
            <Card>
              <CardHeader>
                <CardTitle>Pull to Refresh</CardTitle>
                <CardDescription>
                  Tarik ke bawah untuk memperbarui data (hanya pada mobile)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PullToRefresh onRefresh={handleRefresh} disabled={refreshing}>
                  <div className="space-y-3">
                    {items.slice(0, 5).map((item, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <div className="font-medium">{item}</div>
                        <div className="text-sm text-muted-foreground">
                          Terakhir diperbarui: {new Date().toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </PullToRefresh>
              </CardContent>
            </Card>

            {/* Swipe Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Swipe Actions</CardTitle>
                <CardDescription>
                  Geser item ke kiri untuk menampilkan aksi (hanya pada mobile)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {['Item dengan Swipe Action', 'Geser ke kiri untuk aksi', 'Touch friendly interactions'].map((item, index) => (
                  <SwipeActions key={index} actions={swipeActions}>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="font-medium">{item}</div>
                      <div className="text-sm text-muted-foreground">
                        Swipe untuk melihat aksi yang tersedia
                      </div>
                    </div>
                  </SwipeActions>
                ))}
              </CardContent>
            </Card>

            {/* Infinite Scroll */}
            <Card>
              <CardHeader>
                <CardTitle>Infinite Scroll + Pull to Refresh</CardTitle>
                <CardDescription>
                  Scroll ke bawah untuk memuat lebih banyak data, atau tarik ke atas untuk refresh
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PullToRefreshInfiniteScroll
                  onRefresh={handleRefresh}
                  onLoadMore={handleLoadMore}
                  hasMore={hasMore}
                  loading={loading}
                  refreshing={refreshing}
                >
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <div className="font-medium">{item}</div>
                        <div className="text-sm text-muted-foreground">
                          Index: {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </PullToRefreshInfiniteScroll>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
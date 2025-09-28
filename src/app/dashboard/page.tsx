'use client'

import React, { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useResponsive } from '@/hooks/use-mobile'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  ChefHat,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  Target,
  Zap
} from 'lucide-react'

// Sample data - in real app, this would come from API
const sampleStats = {
  totalSales: 15420000,
  totalOrders: 148,
  totalCustomers: 89,
  totalIngredients: 45,
  salesGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  ingredientsLow: 5
}

const recentOrders = [
  { id: 1, customer: 'Budi Santoso', items: ['Roti Coklat', 'Kue Ulang Tahun'], total: 350000, status: 'completed' },
  { id: 2, customer: 'Sari Dewi', items: ['Croissant', 'Coffee Cake'], total: 180000, status: 'processing' },
  { id: 3, customer: 'Ahmad Rahman', items: ['Birthday Cake Custom'], total: 750000, status: 'pending' },
  { id: 4, customer: 'Lisa Putri', items: ['Donat Glazed', 'Muffin Blueberry'], total: 120000, status: 'completed' },
]

const lowStockItems = [
  { name: 'Tepung Terigu', current: 5, minimum: 10, unit: 'kg', status: 'critical' },
  { name: 'Gula Pasir', current: 12, minimum: 15, unit: 'kg', status: 'warning' },
  { name: 'Telur Ayam', current: 18, minimum: 20, unit: 'butir', status: 'warning' },
  { name: 'Mentega', current: 2, minimum: 8, unit: 'kg', status: 'critical' },
]

export default function Dashboard() {
  const { isMobile } = useResponsive()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dashboard HeyTrack
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentTime.toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <Zap className="h-3 w-3 mr-1" />
              Development Mode
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(sampleStats.totalSales)}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{sampleStats.salesGrowth}% dari bulan lalu
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleStats.totalOrders}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{sampleStats.ordersGrowth}% dari bulan lalu
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pelanggan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleStats.totalCustomers}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{sampleStats.customersGrowth}% dari bulan lalu
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bahan Baku</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sampleStats.totalIngredients}</div>
              <div className="flex items-center text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                {sampleStats.ingredientsLow} stok menipis
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pesanan Terbaru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(order.total)}</div>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status === 'completed' ? 'Selesai' : 
                       order.status === 'processing' ? 'Diproses' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Lihat Semua Pesanan
              </Button>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Peringatan Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant={item.status === 'critical' ? 'destructive' : 'default'}>
                      {item.status === 'critical' ? 'Kritis' : 'Peringatan'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Sisa: {item.current} {item.unit}</span>
                    <span>Min: {item.minimum} {item.unit}</span>
                  </div>
                  <Progress 
                    value={(item.current / item.minimum) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Package className="h-4 w-4 mr-2" />
                Kelola Inventory
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/resep">
                  <ChefHat className="h-6 w-6" />
                  <span>Resep & HPP</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/inventory">
                  <Package className="h-6 w-6" />
                  <span>Inventory</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/orders">
                  <ShoppingCart className="h-6 w-6" />
                  <span>Pesanan</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/reports">
                  <BarChart3 className="h-6 w-6" />
                  <span>Laporan</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

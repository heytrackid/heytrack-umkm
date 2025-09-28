'use client'

import { useCallback } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useResponsive } from '@/hooks/use-mobile'
import Link from 'next/link'
import NotificationCenter from '@/components/ui/notification-center'
import { useDashboardStats, useWeeklySales, useTopProducts } from '@/hooks/api/useDashboard'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Plus,
  ChefHat,
  Calculator,
  Receipt,
  FileText,
  ArrowRight,
  Clock,
  Star,
  Zap,
  Target,
  Flame,
  Calendar,
  Percent,
  RefreshCw
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

// Simple pages quick access data
interface QuickActionCard {
  title: string
  href: string
  icon: React.ElementType
  description: string
  stats?: { label: string; value: string | number }
  color: string
  bgGradient: string
}

// Dynamic quick actions that use real-time stats
const getQuickActions = (stats: any): QuickActionCard[] => [
  {
    title: 'Bahan Baku',
    href: '/inventory',
    icon: Package,
    description: 'Stok & inventory management',
    stats: { 
      label: 'Items', 
      value: 0
    },
    color: 'text-gray-900 dark:text-white',
    bgGradient: 'bg-white dark:bg-black'
  },
  {
    title: 'Biaya Operasional',
    href: '/operational-costs',
    icon: Receipt,
    description: 'Catat biaya operasional',
    stats: { 
      label: 'Hari ini', 
      value: 0
    },
    color: 'text-gray-900 dark:text-white',
    bgGradient: 'bg-white dark:bg-black'
  },
  {
    title: 'Resep',
    href: '/resep',
    icon: ChefHat,
    description: 'Koleksi resep & panduan',
    stats: { label: 'Total', value: 0 },
    color: 'text-gray-900 dark:text-white',
    bgGradient: 'bg-white dark:bg-black'
  },
  {
    title: 'HPP Calculator',
    href: '/hpp',
    icon: Calculator,
    description: 'Hitung harga pokok produksi',
    stats: { 
      label: 'Ready', 
      value: '✓'
    },
    color: 'text-gray-900 dark:text-white',
    bgGradient: 'bg-white dark:bg-black'
  }
]

// Dynamic recent activities from real data
const getRecentActivities = (stats: any) => {
  const activities: any[] = []
  
  // Add recent orders
  if (stats?.orders?.recent) {
    stats.orders.recent.slice(0, 2).forEach((order: any) => {
      activities.push({
        icon: Plus,
        text: `Pesanan baru dari ${order.customer} - Rp ${parseFloat(order.amount || 0).toLocaleString('id-ID')}`,
        time: new Date(order.time).toLocaleString('id-ID', { 
          timeStyle: 'short',
          dateStyle: 'short' 
        }),
        color: 'text-gray-600'
      })
    })
  }
  
  // Add inventory alerts
  if (stats?.inventory?.lowStock > 0) {
    activities.push({
      icon: AlertTriangle,
      text: `${stats.inventory.lowStock} bahan baku stok menipis`,
      time: 'Real-time',
      color: 'text-gray-600'
    })
  }
  
  // Add system updates
  activities.push({
    icon: CheckCircle,
    text: `Dashboard diperbarui dengan ${stats?.orders?.total || 0} total pesanan`,
    time: new Date(stats?.lastUpdated || Date.now()).toLocaleTimeString('id-ID'),
    color: 'text-gray-600'
  })
  
  // Add profit info if positive
  if (stats?.expenses?.netProfit > 0) {
    activities.push({
      icon: TrendingUp,
      text: `Profit hari ini: Rp ${stats.expenses.netProfit.toLocaleString('id-ID')}`,
      time: 'Hari ini',
      color: 'text-gray-600'
    })
  }
  
  return activities.slice(0, 4) // Max 4 activities
}

export default function Dashboard() {
  const { isMobile } = useResponsive()
  
  // Use TanStack Query for data fetching
  const { 
    data: dashboardStats, 
    isLoading, 
    error: statsError, 
    refetch: refetchStats 
  } = useDashboardStats()
  
  const { 
    data: weeklySales, 
    isLoading: isLoadingWeeklySales 
  } = useWeeklySales()
  
  const { 
    data: topProducts, 
    isLoading: isLoadingTopProducts 
  } = useTopProducts()

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    refetchStats()
  }, [refetchStats])

  // Loading skeleton
  if (isLoading && !dashboardStats) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="text-center space-y-2">
            <div className="h-8 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded animate-pulse"></div>
          </div>
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className={`font-bold text-foreground ${
            isMobile ? 'text-2xl' : 'text-4xl'
          }`}>Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            Selamat datang di HeyTrack Bakery Management
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-gray-600" />
              <span>Real-time Data</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Update: {new Date(dashboardStats?.lastUpdated || Date.now()).toLocaleTimeString('id-ID')}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-2 p-1 rounded-full hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Key Metrics for UMKM */}
        <div className={`grid gap-4 ${
          isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'
        }`}>
          {/* Revenue Today with Target Progress */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Omzet Hari Ini</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    Rp {(dashboardStats?.revenue?.today || 0).toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="p-3 bg-green-200 dark:bg-green-800 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 dark:text-green-400">Target: Rp {(dashboardStats?.revenue?.target || 1000000).toLocaleString('id-ID')}</span>
                  <span className="text-green-700 dark:text-green-300 font-medium">
                    {Math.round(((dashboardStats?.revenue?.today || 0) / (dashboardStats?.revenue?.target || 1000000)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((dashboardStats?.revenue?.today || 0) / (dashboardStats?.revenue?.target || 1000000)) * 100} 
                  className="h-2 bg-green-200 dark:bg-green-800"
                />
              </div>
            </CardContent>
          </Card>

          {/* HPP & Profit Margin */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Margin Profit</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {(dashboardStats?.profit?.margin || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-full">
                  <Percent className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">HPP Rata-rata:</span>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Rp {(dashboardStats?.hpp?.average || 0).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 dark:text-blue-400">Profit Hari Ini:</span>
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    Rp {(dashboardStats?.profit?.today || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Selling Product */}
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Produk Terlaris</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100 truncate">
                    {dashboardStats?.products?.bestSeller?.name || 'Belum ada data'}
                  </p>
                </div>
                <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-full">
                  <Flame className="h-6 w-6 text-orange-700 dark:text-orange-300" />
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-orange-600 dark:text-orange-400">Terjual hari ini:</span>
                  <span className="text-orange-700 dark:text-orange-300 font-medium">
                    {dashboardStats?.products?.bestSeller?.sold || 0} unit
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-600 dark:text-orange-400">Revenue:</span>
                  <span className="text-orange-700 dark:text-orange-300 font-medium">
                    Rp {((dashboardStats?.products?.bestSeller?.sold || 0) * (dashboardStats?.products?.bestSeller?.price || 0)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Alert */}
          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Alert Inventory</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {dashboardStats?.inventory?.alerts || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-200 dark:bg-red-800 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-700 dark:text-red-300" />
                </div>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-red-600 dark:text-red-400">Stok Habis:</span>
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {dashboardStats?.inventory?.outOfStock || 0} item
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600 dark:text-red-400">Stok Menipis:</span>
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {dashboardStats?.inventory?.lowStock || 0} item
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Analytics for UMKM */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Sales Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Penjualan 7 Hari Terakhir
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingWeeklySales ? (
                <div className="space-y-4">
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {(weeklySales || []).map((data, index) => {
                    const maxRevenue = Math.max(...(weeklySales || []).map(d => d.revenue), 1000000)
                    const percentage = Math.max((data.revenue / maxRevenue) * 100, 5) // Minimum 5% width
                  
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-10 text-sm font-medium ${
                          data.isToday ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {data.day}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 bg-secondary/30 rounded-lg h-8 relative overflow-hidden">
                              <div 
                                className={`h-full rounded-lg transition-all duration-700 flex items-center px-3 ${
                                  data.isToday 
                                    ? 'bg-gradient-to-r from-primary to-primary/80' 
                                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                                }`}
                                style={{ width: `${percentage}%` }}
                              >
                                {percentage > 20 && data.revenue > 0 && (
                                  <span className="text-xs font-bold text-white">
                                    Rp {Math.round(data.revenue / 1000)}k
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ml-3 min-w-[80px] text-right">
                              <span className="text-sm font-medium">
                                {data.revenue > 0 ? `Rp ${Math.round(data.revenue / 1000)}k` : 'Rp 0'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
              {!isLoadingWeeklySales && weeklySales && weeklySales.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total 7 hari:</span>
                      <div className="font-bold text-lg">
                        Rp {weeklySales.reduce((sum, day) => sum + day.revenue, 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rata-rata:</span>
                      <div className="font-bold text-lg">
                        Rp {Math.round(weeklySales.reduce((sum, day) => sum + day.revenue, 0) / 7 / 1000)}k/hari
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>Hari ini</span>
                    <div className="w-2 h-2 rounded-full bg-blue-500 ml-4"></div>
                    <span>Hari sebelumnya</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Produk Terlaris Minggu Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTopProducts ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : topProducts && topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => {
                    const maxSold = Math.max(...topProducts.map(p => p.sold), 1)
                    const percentage = Math.max((product.sold / maxSold) * 100, 10) // Minimum 10% width
                  
                    return (
                      <div key={index} className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm">{product.name}</span>
                              <div className="text-right">
                                <div className="text-sm font-medium">{product.sold} unit</div>
                                <div className="text-xs text-muted-foreground">
                                  Rp {Math.round(product.revenue / 1000)}k
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-secondary/50 rounded-full h-3 overflow-hidden">
                                <div 
                                  className={`bg-gradient-to-r ${product.color} h-full rounded-full transition-all duration-700 shadow-sm`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground min-w-[35px] text-right">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Belum ada data produk terlaris</p>
                  <p className="text-sm">Data akan muncul setelah ada pesanan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HPP Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Analisis HPP & Profitabilitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-6 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-3'
            }`}>
              {/* Cost Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold">Breakdown Biaya</h4>
                {[
                  { label: 'Bahan Baku', value: 45, amount: 450000, color: 'bg-blue-500' },
                  { label: 'Tenaga Kerja', value: 25, amount: 250000, color: 'bg-green-500' },
                  { label: 'Overhead', value: 15, amount: 150000, color: 'bg-yellow-500' },
                  { label: 'Profit Margin', value: 15, amount: 150000, color: 'bg-purple-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">{item.value}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Rp {item.amount.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Margin Analysis */}
              <div className="space-y-4">
                <h4 className="font-semibold">Analisis Margin</h4>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="text-sm font-medium text-green-800 dark:text-green-200">Margin Sehat</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Target: 20-30% • Saat ini: 25.5%
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-200">Bahan Baku Naik</div>
                    <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      +5% dari minggu lalu
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">Optimasi Tersedia</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Review supplier & porsi
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="space-y-4">
                <h4 className="font-semibold">Rekomendasi</h4>
                <div className="space-y-3">
                  <Link href="/hpp">
                    <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <Calculator className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium group-hover:text-blue-600">Hitung Ulang HPP</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Update harga & recipe terbaru
                      </div>
                    </div>
                  </Link>
                  <Link href="/inventory">
                    <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium group-hover:text-green-600">Review Supplier</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Cari harga bahan lebih baik
                      </div>
                    </div>
                  </Link>
                  <Link href="/operational-costs">
                    <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer group">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium group-hover:text-orange-600">Optimasi Biaya</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Review biaya operasional
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions - Main Feature */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Quick Actions</h2>
              <p className="text-muted-foreground">Akses cepat ke semua fitur utama dengan SimpleDataTable</p>
            </div>
          </div>
          
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'
          }`}>
            {getQuickActions(dashboardStats).map((action) => {
              const IconComponent = action.icon
              return (
                <Link key={action.href} href={action.href}>
                  <Card className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${action.bgGradient} border-gray-200 dark:border-gray-800 cursor-pointer group`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <div>
                            <h3 className={`font-bold text-lg ${action.color}`}>
                              {action.title}
                            </h3>
                            <p className={`text-sm ${action.color}`}>
                              {action.description}
                            </p>
                          </div>
                          {action.stats && (
                            <div className={`text-xs ${action.color} bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full inline-block`}>
                              {action.stats.label}: <span className="font-semibold">{action.stats.value}</span>
                            </div>
                          )}
                        </div>
                        <ArrowRight className={`h-5 w-5 ${action.color} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getRecentActivities(dashboardStats).map((activity, index) => {
                    const IconComponent = activity.icon
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.text}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications */}
          <div>
            <NotificationCenter showUnreadOnly={false} />
          </div>
        </div>
        
        {/* Quick Links */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              Laporan Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'
            }`}>
              <Link href="/laporan-simple" className="block">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Laporan Harian</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Performa hari ini</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
              
              <Link href="/ingredients-simple" className="block">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Inventory</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Kelola stok detail</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
              
              <Link href="/finance" className="block">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Finance</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Analisa keuangan</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
              
              <Link href="/production" className="block">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-all group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Production</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Jadwal produksi</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pro Tips */}
        <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 dark:text-white">Tips Produktivitas</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Gunakan <strong>Table View</strong> untuk data analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Switch ke <strong>Grid View</strong> untuk quick overview</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Export data ke <strong>CSV</strong> untuk backup</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Gunakan <strong>filters</strong> untuk mencari data cepat</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

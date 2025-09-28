'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { useResponsive } from '@/hooks/use-mobile'
import Link from 'next/link'
import NotificationCenter from '@/components/ui/notification-center'
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
  Zap
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
  const [dashboardStats, setDashboardStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch real-time dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      
      if (response.ok) {
        setDashboardStats(data)
        setLastUpdated(new Date())
      } else {
        console.error('Error fetching dashboard data:', data.error)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboardData])

  // Manual refresh handler
  const handleRefresh = () => {
    setLoading(true)
    fetchDashboardData()
  }

  // Loading skeleton
  if (loading && !dashboardStats) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-7xl mx-auto">
          <div className="text-center space-y-2">
            <div className="h-8 bg-black rounded animate-pulse"></div>
            <div className="h-4 bg-black rounded animate-pulse"></div>
          </div>
          <div className={`grid gap-4 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-black rounded animate-pulse"></div>
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
              <Clock className="h-4 w-4 text-gray-600" />
              <span>Update: {lastUpdated.toLocaleTimeString('id-ID')}</span>
            </div>
            <button
              onClick={handleRefresh}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              <Zap className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`grid gap-4 ${
          isMobile ? 'grid-cols-2' : 'grid-cols-4'
        }`}>
          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pendapatan Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    Rp {dashboardStats?.revenue?.today?.toLocaleString('id-ID') || '0'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {dashboardStats?.revenue?.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardStats?.revenue?.growth > 0 ? '+' : ''}{dashboardStats?.revenue?.growth || '0'}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pesanan Aktif</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.orders?.active || 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardStats?.orders?.today || 0} hari ini
                    </span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Pelanggan</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.customers?.total || 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {dashboardStats?.customers?.vip || 0} VIP
                    </span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-black border-gray-200 dark:border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stok Menipis</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.inventory?.lowStock || 0}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(dashboardStats?.inventory?.lowStock || 0) > 0 ? 'Perlu restok' : 'Stock OK'}
                    </span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

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

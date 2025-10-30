'use client'

import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DashboardHeaderSkeleton,
  RecentOrdersSkeleton,
  StatsCardSkeleton,
  StockAlertSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { usePagePreloading } from '@/providers/PreloadingProvider'
import {
  BarChart3,
  ChefHat,
  Package,
  ShoppingCart,
  Target,
  Calculator
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiLogger } from '@/lib/logger'

// Import lightweight components normally - no need for lazy loading
import StatsCardsSection from './components/StatsCardsSection'
import RecentOrdersSection from './components/RecentOrdersSection'
import StockAlertsSection from './components/StockAlertsSection'
import HppDashboardWidget from './components/HppDashboardWidget'

// Dashboard data structure
interface DashboardData {
  stats: {
    totalSales: number
    totalOrders: number
    totalCustomers: number
    totalIngredients: number
    salesGrowth: number
    ordersGrowth: number
    customersGrowth: number
    ingredientsLow: number
  }
  orders: {
    recent: Array<{
      id: string
      customer: string
      amount: number | null
      status: string | null
      time: string | null
    }>
  }
  inventory: {
    lowStockAlerts: Array<{
      id: string
      name: string
      currentStock: number
      reorderPoint: number
    }>
  }
}

// Parallel data fetching function
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Fetch all data in parallel
  const [statsResponse, ordersResponse, inventoryResponse] = await Promise.all([
    fetch('/api/dashboard/stats'),
    fetch('/api/orders/recent'),
    fetch('/api/inventory/low-stock')
  ])

  // Check if all responses are successful
  const results = await Promise.all([
    statsResponse.ok ? statsResponse.json() : Promise.reject(new Error('Stats API failed')),
    ordersResponse.ok ? ordersResponse.json() : Promise.reject(new Error('Orders API failed')),
    inventoryResponse.ok ? inventoryResponse.json() : Promise.reject(new Error('Inventory API failed'))
  ])

  return {
    stats: results[0],
    orders: results[1],
    inventory: results[2]
  }
}

export default function Dashboard() {
  const { formatCurrency } = useCurrency()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Parallel data loading with React Query
  const {
    data: dashboardData,
    isLoading: isDataLoading,
    error
  } = useQuery({
    queryKey: ['dashboard', 'all-data'],
    queryFn: fetchDashboardData,
    staleTime: 60000, // 1 minute
    retry: 2,
    refetchOnWindowFocus: false
  })

  // Enable smart preloading for dashboard
  usePagePreloading('dashboard')

  // Handle session expiry
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      void router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <DashboardHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentOrdersSkeleton />
            <StockAlertSkeleton />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    apiLogger.error({ error }, 'Dashboard data loading error')
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Gagal Memuat Dashboard</h2>
          <p className="text-muted-foreground mb-6">
            Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi.
          </p>
          <Button onClick={() => window.location.reload()}>Muat Ulang</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        {isDataLoading ? (
          <DashboardHeaderSkeleton />
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Beranda
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentTime.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {user && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selamat datang kembali, {user.email?.split('@')[0]}! 👋
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main Dashboard Content - Single Suspense boundary to prevent cascading loading */}
        <Suspense fallback={
          <div className="space-y-6">
            {/* Stats Cards Loading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
            
            {/* Recent Orders & Stock Alerts Loading */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentOrdersSkeleton />
              <StockAlertSkeleton />
            </div>
            
            {/* HPP Widget Loading */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  HPP & Costing Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-gray-200 rounded" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                  <div className="h-32 bg-gray-200 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        }>
          {/* Stats Cards */}
          {isDataLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCardsSection 
                stats={dashboardData?.stats ? {
                  revenue: {
                    total: dashboardData.stats.totalSales,
                    growth: dashboardData.stats.salesGrowth.toString(),
                    trend: dashboardData.stats.salesGrowth >= 0 ? 'up' : 'down'
                  },
                  orders: {
                    total: dashboardData.stats.totalOrders,
                    active: dashboardData.stats.totalOrders // Placeholder - need to determine active orders
                  },
                  customers: {
                    total: dashboardData.stats.totalCustomers,
                    vip: 0 // Placeholder - need to determine VIP customers
                  },
                  inventory: {
                    total: dashboardData.stats.totalIngredients,
                    lowStock: dashboardData.stats.ingredientsLow
                  }
                } : undefined} 
                formatCurrency={formatCurrency} 
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            {isDataLoading ? (
              <RecentOrdersSkeleton />
            ) : (
              <RecentOrdersSection orders={dashboardData?.orders?.recent} />
            )}

            {/* Low Stock Alert */}
            {isDataLoading ? (
              <StockAlertSkeleton />
            ) : (
              <StockAlertsSection lowStockItems={dashboardData?.inventory?.lowStockAlerts} />
            )}
          </div>

          {/* HPP Dashboard Widget */}
          <HppDashboardWidget />
        </Suspense>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Menu Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/orders">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm font-medium">Pesanan</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/recipes">
                  <ChefHat className="h-6 w-6" />
                  <span className="text-sm font-medium">Resep</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/ingredients">
                  <Package className="h-6 w-6" />
                  <span className="text-sm font-medium">Bahan Baku</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/hpp">
                  <Calculator className="h-6 w-6" />
                  <span className="text-sm font-medium">Biaya Produksi</span>
                </a>
              </Button>
              <Button className="h-20 flex-col space-y-2" variant="outline" asChild>
                <a href="/reports">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm font-medium">Laporan</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

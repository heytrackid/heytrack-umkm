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
import { LOADING_KEYS, useLoading } from '@/hooks/loading'
import { usePagePreloading } from '@/providers/PreloadingProvider'
import {
  BarChart3,
  ChefHat,
  Package,
  ShoppingCart,
  Target,
  Calculator
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'



const StatsCardsSection = dynamic(
  () => import(/* webpackChunkName: "dashboard-stats-cards" */ './components/StatsCardsSection'),
  {
    loading: () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    ),
  }
)

const RecentOrdersSection = dynamic(
  () => import(/* webpackChunkName: "dashboard-recent-orders" */ './components/RecentOrdersSection'),
  {
    loading: () => <RecentOrdersSkeleton />
  }
)

const StockAlertsSection = dynamic(
  () => import(/* webpackChunkName: "dashboard-stock-alerts" */ './components/StockAlertsSection'),
  {
    loading: () => <StockAlertSkeleton />
  }
)

const HppDashboardWidget = dynamic(
  () => import(/* webpackChunkName: "dashboard-hpp-widget" */ './components/HppDashboardWidget'),
  {
    loading: () => (
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
    )
  })

// Sample data removed - now using real data from API
// const sampleStats = {
//   totalSales: 15420000,
//   totalOrders: 148,
//   totalCustomers: 89,
//   totalIngredients: 45,
//   salesGrowth: 12.5,
//   ordersGrowth: 8.3,
//   customersGrowth: 15.2,
//   ingredientsLow: 5
// }

// Placeholder data until API integration
const placeholderStats = {
  totalSales: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalIngredients: 0,
  salesGrowth: 0,
  ordersGrowth: 0,
  customersGrowth: 0,
  ingredientsLow: 0
}

export default function Dashboard() {
  const { formatCurrency } = useCurrency()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { setLoading, isLoading } = useLoading({
    [LOADING_KEYS.DASHBOARD_STATS]: true,
    [LOADING_KEYS.RECENT_ORDERS]: true,
    [LOADING_KEYS.STOCK_ALERTS]: true
  })
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

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

  // Simulate loading states
  useEffect(() => {
    // Simulate dashboard stats loading
    const statsTimer = setTimeout(() => {
      void setLoading(LOADING_KEYS.DASHBOARD_STATS, false)
    }, 1500)

    // Simulate recent orders loading
    const ordersTimer = setTimeout(() => {
      void setLoading(LOADING_KEYS.RECENT_ORDERS, false)
    }, 2000)

    // Simulate stock alerts loading  
    const stockTimer = setTimeout(() => {
      void setLoading(LOADING_KEYS.STOCK_ALERTS, false)
    }, 1800)

    return () => {
      clearTimeout(statsTimer)
      clearTimeout(ordersTimer)
      clearTimeout(stockTimer)
    }
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        {isLoading(LOADING_KEYS.DASHBOARD_STATS) ? (
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

        {/* Stats Cards (Suspense + dynamic) */}
        {isLoading(LOADING_KEYS.DASHBOARD_STATS) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
          }>
            <StatsCardsSection formatCurrency={formatCurrency} stats={placeholderStats} />
          </Suspense>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders (Suspense + dynamic) */}
          {isLoading(LOADING_KEYS.RECENT_ORDERS) ? (
            <RecentOrdersSkeleton />
          ) : (
            <Suspense fallback={<RecentOrdersSkeleton />}>
              <RecentOrdersSection />
            </Suspense>
          )}

          {/* Low Stock Alert (Suspense + dynamic) */}
          {isLoading(LOADING_KEYS.STOCK_ALERTS) ? (
            <StockAlertSkeleton />
          ) : (
            <Suspense fallback={<StockAlertSkeleton />}>
              <StockAlertsSection />
            </Suspense>
          )}
        </div>

        {/* HPP Dashboard Widget */}
        <Suspense fallback={
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
        }>
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

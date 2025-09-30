'use client'

import React, { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useResponsive } from '@/hooks/use-mobile'
import { useCurrency } from '@/hooks/useCurrency'

// Dynamic import to reduce bundle size
const ExcelExportButton = dynamic(() => import('@/components/ui/ExcelExportButton'), {
  ssr: false,
  loading: () => <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
})
import { useLoading, LOADING_KEYS } from '@/hooks/useLoading'
import { usePagePreloading } from '@/providers/PreloadingProvider'
import { SmartLink, SmartActionButton, SmartQuickActions } from '@/components/navigation/SmartNavigation'
import { 
  StatsCardSkeleton,
  DashboardHeaderSkeleton,
  RecentOrdersSkeleton,
  StockAlertSkeleton,
  QuickActionsSkeleton
} from '@/components/ui/skeletons/dashboard-skeletons'
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

const StatsCardsSection = dynamic(() => import('./components/StatsCardsSection'), {
  loading: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  ),
})
const RecentOrdersSection = dynamic(() => import('./components/RecentOrdersSection'), { loading: () => <RecentOrdersSkeleton /> })
const StockAlertsSection = dynamic(() => import('./components/StockAlertsSection'), { loading: () => <StockAlertSkeleton /> })

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

const recentOrders: any[] = []

const lowStockItems: any[] = []

export default function Dashboard() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { loading, setLoading, isLoading } = useLoading({
    [LOADING_KEYS.DASHBOARD_STATS]: true,
    [LOADING_KEYS.RECENT_ORDERS]: true,
    [LOADING_KEYS.STOCK_ALERTS]: true
  })
  
  // Enable smart preloading for dashboard
  usePagePreloading('dashboard')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate loading states
  useEffect(() => {
    // Simulate dashboard stats loading
    const statsTimer = setTimeout(() => {
      setLoading(LOADING_KEYS.DASHBOARD_STATS, false)
    }, 1500)

    // Simulate recent orders loading
    const ordersTimer = setTimeout(() => {
      setLoading(LOADING_KEYS.RECENT_ORDERS, false)
    }, 2000)

    // Simulate stock alerts loading  
    const stockTimer = setTimeout(() => {
      setLoading(LOADING_KEYS.STOCK_ALERTS, false)
    }, 1800)

    return () => {
      clearTimeou""
      clearTimeou""
      clearTimeou""
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'processing': return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
      case 'pending': return 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
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
                {"Placeholder"} HeyTrack
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
              <ExcelExportButton size="sm" variant="outline" />
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
            <StatsCardsSection t={t} formatCurrency={formatCurrency} stats={placeholderStats} />
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {"Placeholder"}
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

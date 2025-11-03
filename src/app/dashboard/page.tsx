'use client'
 

import AppLayout from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardHeaderSkeleton, RecentOrdersSkeleton, StatsCardSkeleton, StockAlertSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'
import { queryLogger } from '@/lib/client-logger'
import { usePagePreloading } from '@/providers/PreloadingProvider'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, Calculator, ChefHat, Package, ShoppingCart, Sparkles, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

// Import lightweight components normally - no need for lazy loading
import HppDashboardWidget from './components/HppDashboardWidget'
import RecentOrdersSection from './components/RecentOrdersSection'
import StatsCardsSection from './components/StatsCardsSection'
import StockAlertsSection from './components/StockAlertsSection'

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

// Optimized data fetching - single API call
const fetchDashboardData = async (): Promise<DashboardData> => {
  // ✅ FIX: Use single API call instead of 3 parallel calls
  const response = await fetch('/api/dashboard/stats')

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data')
  }

  const data = await response.json()

  // Transform API response to match DashboardData structure
  return {
    stats: {
      totalSales: data.revenue?.total ?? 0,
      totalOrders: data.orders?.total ?? 0,
      totalCustomers: data.customers?.total ?? 0,
      totalIngredients: data.inventory?.total ?? 0,
      salesGrowth: parseFloat(data.revenue?.growth ?? '0'),
      ordersGrowth: 0, // Not provided by API yet
      customersGrowth: 0, // Not provided by API yet
      ingredientsLow: data.inventory?.lowStock ?? 0
    },
    orders: {
      recent: data.orders?.recent ?? []
    },
    inventory: {
      lowStockAlerts: data.inventory?.lowStockAlerts ?? []
    }
  }
}

// Dashboard Skeleton Component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats Cards Loading */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          <BarChart3 className="h-5 w-5" />
          Analisis HPP
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </CardContent>
    </Card>
  </div>
)

const Dashboard = () => {
  const { formatCurrency } = useCurrency()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // ✅ OPTIMIZED: Single API call with better caching
  const {
    data: dashboardData,
    isLoading: isDataLoading,
    error
  } = useQuery({
    queryKey: ['dashboard', 'all-data'],
    queryFn: fetchDashboardData,
    staleTime: 30000, // 30 seconds - faster refresh
    gcTime: 300000, // 5 minutes cache
    retry: 1, // Reduce retry attempts
    refetchOnWindowFocus: false,
    refetchOnMount: false // Don't refetch if data is fresh
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, isAuthenticated])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ✅ FIX: Combine loading states to prevent double skeleton
  const isLoading = isAuthLoading || isDataLoading

  // Show loading state while initializing
  if (isLoading && !dashboardData) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <DashboardHeaderSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <StatsCardSkeleton key={`skeleton-${i}`} />
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
    // Log error using client-safe logger
    queryLogger.error('Dashboard data loading error')

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

  // Check if user has no data yet (empty state) - memoized to prevent unnecessary re-renders
  const hasNoData = useMemo(() => {
    if (!dashboardData) return false
    return dashboardData.stats.totalOrders === 0 &&
      dashboardData.stats.totalIngredients === 0 &&
      dashboardData.stats.totalCustomers === 0
  }, [dashboardData])

  // Show onboarding for new users
  useEffect(() => {
    if (hasNoData && !isLoading) {
      const hasSkipped = localStorage.getItem('heytrack_onboarding_skipped')
      const hasCompleted = localStorage.getItem('heytrack_onboarding_completed')
      if (!hasSkipped && !hasCompleted) {
        setShowOnboarding(true)
      }
    }
  }, [hasNoData, isLoading])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Onboarding Wizard */}
        <OnboardingWizard 
          open={showOnboarding} 
          onOpenChange={setShowOnboarding}
        />

        {/* Header - Always visible */}
        <PageHeader
          title="Beranda"
          description={`${currentTime.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}${user ? `, Selamat datang kembali, ${user.email?.split('@')[0]}! 👋` : ''}`}
        />

        {/* Enhanced Empty State - Show when user has no data */}
        {hasNoData && (
          <Card className="border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center animate-pulse">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">
                    Selamat Datang di HeyTrack! 🎉
                  </h3>
                  <p className="text-muted-foreground text-base max-w-xl mx-auto mb-4">
                    Sistem manajemen kuliner yang membantu Anda menghitung HPP, 
                    kelola stok, dan maksimalkan keuntungan dengan mudah.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mari mulai dengan setup sederhana dalam 4 langkah 👇
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="flex flex-col items-center gap-3 pt-2">
                  <Button 
                    size="lg"
                    onClick={() => setShowOnboarding(true)}
                    className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Sparkles className="h-5 w-5" />
                    Mulai Setup (5 menit)
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    Atau langsung ke:
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
                  <Button variant="outline" asChild className="h-24 flex-col gap-2">
                    <a href="/ingredients">
                      <Package className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-medium">Bahan Baku</span>
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="h-24 flex-col gap-2">
                    <a href="/recipes">
                      <ChefHat className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-medium">Resep</span>
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="h-24 flex-col gap-2">
                    <a href="/hpp">
                      <Calculator className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-medium">Hitung HPP</span>
                    </a>
                  </Button>
                  <Button variant="outline" asChild className="h-24 flex-col gap-2">
                    <a href="/orders">
                      <ShoppingCart className="h-6 w-6 text-orange-600" />
                      <span className="text-sm font-medium">Pesanan</span>
                    </a>
                  </Button>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 text-left">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Calculator className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">HPP Otomatis</h4>
                      <p className="text-xs text-muted-foreground">
                        Hitung biaya produksi real-time
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Analisis Profit</h4>
                      <p className="text-xs text-muted-foreground">
                        Lacak keuntungan per produk
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Kelola Stok</h4>
                      <p className="text-xs text-muted-foreground">
                        Alert otomatis stok menipis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content - Single Suspense boundary to prevent cascading loading */}
        <Suspense fallback={<DashboardSkeleton />}>
          {/* Stats Cards */}
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <RecentOrdersSection orders={dashboardData?.orders?.recent} />

            {/* Low Stock Alert */}
            <StockAlertsSection lowStockItems={dashboardData?.inventory?.lowStockAlerts} />
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

export default Dashboard

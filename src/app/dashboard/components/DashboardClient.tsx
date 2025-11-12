'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart3, Calculator, ChefHat, Package, Plus, Settings, ShoppingCart, Sparkles, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

import { LoadingButton } from '@/components/ui/loading-button'
import { DashboardHeaderSkeleton, RecentOrdersSkeleton, StatsCardSkeleton, StockAlertSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'

import { useAuth } from '@/hooks/index'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'

import { FinancialTrendsChart } from '@/modules/charts/components/FinancialTrendsChart'
import { InventoryTrendsChart } from '@/modules/charts/components/InventoryTrendsChart'
import { usePagePreloading } from '@/providers/PreloadingProvider'

interface DashboardData {
  revenue: {
    today: number
    total: number
    growth: string
    trend: 'up' | 'down'
  }
  orders: {
    active: number
    total: number
    today: number
    recent: Array<{
      id: string
      customer: string
      amount: number | null
      status: string | null
      created_at: string | null
    }>
  }
  customers: {
    total: number
    vip: number
    regular: number
  }
  inventory: {
    total: number
    lowStock: number
    lowStockAlerts: Array<{
      id: string
      name: string
      currentStock: number
      reorderPoint: number
    }>
  }
}

interface DashboardClientProps {
  initialData?: DashboardData
}

// Lazy load OnboardingWizard - only needed for new users
const OnboardingWizard = dynamic(
  () => import('@/components/onboarding/OnboardingWizard').then(mod => ({ default: mod.OnboardingWizard })),
  {
    loading: () => <div className="animate-pulse bg-muted rounded-lg h-64 sm:h-96" />
  }
)

// Dynamically import heavy dashboard components to improve initial page load

// Use the stable lazy loading wrapper instead of direct dynamic import
import { HppDashboardWidgetWithSuspense, RecentOrdersSectionWithSuspense, StatsCardsSectionWithSuspense, StockAlertsSectionWithSuspense } from './lazy-dashboard-components'

// Optimized data fetching - single API call
const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch('/api/dashboard/stats', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Gagal memuat data dashboard')
  }

  return response.json()
}

function renderLoadingState(): JSX.Element {
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

const renderErrorState = (router: ReturnType<typeof useRouter>): JSX.Element => (
  <AppLayout>
    <div className="text-center py-12">
      <p className="text-muted-foreground">Terjadi kesalahan saat memuat data dashboard</p>
      <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-primary text-white rounded">
        Kembali ke Beranda
      </button>
    </div>
  </AppLayout>
)

const renderEmptyState = (): JSX.Element => (
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

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-2">
          <Link href="/ingredients">
            <LoadingButton variant="outline" className="h-24 flex-col gap-2">
              <Package className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Bahan Baku</span>
            </LoadingButton>
          </Link>
          <Link href="/recipes">
            <LoadingButton variant="outline" className="h-24 flex-col gap-2">
              <ChefHat className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Resep</span>
            </LoadingButton>
          </Link>
          <LoadingButton variant="outline" asChild className="h-24 flex-col gap-2">
            <a href="/hpp">
              <Calculator className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-medium">Hitung HPP</span>
            </a>
          </LoadingButton>
          <LoadingButton variant="outline" asChild className="h-24 flex-col gap-2">
            <a href="/orders">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Pesanan</span>
            </a>
          </LoadingButton>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6 text-left">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-muted dark:bg-muted flex items-center justify-center flex-shrink-0">
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">HPP Otomatis</h4>
              <p className="text-xs text-muted-foreground">
                Hitung biaya produksi real-time
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-muted dark:bg-muted flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Analisis Profit</h4>
              <p className="text-xs text-muted-foreground">
                Lacak keuntungan per produk
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-muted dark:bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 text-muted-foreground" />
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
)

const renderQuickActions = (router: ReturnType<typeof useRouter>): JSX.Element => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        Aksi Cepat
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <LoadingButton
          variant="default"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center bg-primary hover:bg-primary/90"
          onClick={() => router.push('/orders/new')}
        >
          <Plus className="h-6 w-6" />
          <div>
            <div className="font-medium text-sm">Buat Order Baru</div>
            <div className="text-xs opacity-80">Tambah pesanan</div>
          </div>
        </LoadingButton>
        <LoadingButton
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => router.push('/recipes/ai-generator')}
        >
          <ChefHat className="h-6 w-6" />
          <div>
            <div className="font-medium text-sm">Generate Resep</div>
            <div className="text-xs opacity-80">Buat resep AI</div>
          </div>
        </LoadingButton>
        <LoadingButton
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => router.push('/inventory')}
        >
          <Package className="h-6 w-6" />
          <div>
            <div className="font-medium text-sm">Tambah Bahan</div>
            <div className="text-xs opacity-80">Perbarui Inventori</div>
          </div>
        </LoadingButton>
        <LoadingButton
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => router.push('/reports')}
        >
          <BarChart3 className="h-6 w-6" />
          <div>
            <div className="font-medium text-sm">Lihat Laporan</div>
            <div className="text-xs opacity-80">Analisis performa</div>
          </div>
        </LoadingButton>
        <LoadingButton
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => router.push('/suppliers')}
        >
          <Users className="h-6 w-6" />
          <div>
            <div className="font-medium text-sm">Kelola Supplier</div>
            <div className="text-xs opacity-80">Data vendor</div>
          </div>
        </LoadingButton>
        <LoadingButton
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2 text-center"
          onClick={() => router.push('/hpp/calculator')}
        >
          <Calculator className="h-6 w-6" />
          <div>
            <div className="font-medium text-sm">Kalkulator HPP</div>
            <div className="text-xs opacity-80">Biaya produksi</div>
          </div>
        </LoadingButton>
      </div>
    </CardContent>
  </Card>
)

export const DashboardClient = ({ initialData }: DashboardClientProps) => {
  const { formatCurrency } = useCurrency()
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [widgetVisibility, setWidgetVisibility] = useState({
    statsCards: true,
    recentOrders: true,
    stockAlerts: true,
    financialChart: true,
    inventoryChart: true,
    hppWidget: true,
    quickActions: true
  })

  // Use server-fetched data as initial data, then refresh with client-side query
  const {
    data: dashboardData,
    isLoading: isDataLoading,
    error
  } = useQuery({
    queryKey: ['dashboard', 'all-data'],
    queryFn: fetchDashboardData,
    initialData,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  // Enable smart preloading for dashboard
  usePagePreloading('dashboard')

  // Clean up old login timestamp on mount if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const lastLogin = sessionStorage.getItem('auth:login_time')
      if (lastLogin) {
        const timeSinceLogin = Date.now() - parseInt(lastLogin)
        // If timestamp is older than 5 minutes, remove it
        if (timeSinceLogin > 300000) {
          console.log('Removing stale login timestamp')
          sessionStorage.removeItem('auth:login_time')
        }
      }
    }
  }, [isAuthenticated])

  // Handle session expiry - but be more careful to avoid redirect loops
  useEffect(() => {
    // Only redirect if we're sure there's no authentication
    // Give time for session recovery after login
    const timer = setTimeout(() => {
      if (!isAuthLoading && !isAuthenticated) {
        // Check if we just logged in (within last 5 minutes)
        const lastLogin = sessionStorage.getItem('auth:login_time')
        const timeSinceLogin = lastLogin ? Date.now() - parseInt(lastLogin) : Infinity

        // Only redirect if:
        // 1. More than 5 minutes since login (or no login timestamp)
        // 2. Still not authenticated after loading is done
        // This gives plenty of time for session recovery and avoids false positives
        if (timeSinceLogin > 300000) { // 5 minutes (300 seconds)
          console.log('Session expired, redirecting to login', {
            timeSinceLogin,
            lastLogin,
            isAuthLoading,
            isAuthenticated
          })
          
          // Clear the stale timestamp
          sessionStorage.removeItem('auth:login_time')
          
          toast({
            title: 'Sesi berakhir',
            description: 'Sesi Anda telah berakhir. Silakan login kembali.',
            variant: 'destructive',
          })
          router.push('/auth/login?session_expired=true')
        } else if (lastLogin) {
          console.log('Not redirecting - recent login detected', {
            timeSinceLogin: Math.round(timeSinceLogin / 1000) + 's',
            lastLogin
          })
        }
      }
    }, 5000) // Wait 5 seconds before checking to give session time to recover

    return () => clearTimeout(timer)
  }, [isAuthLoading, isAuthenticated, toast, router])

  // Don't redirect if authenticated but user is null - this can happen during session recovery
  useEffect(() => {
    if (isAuthenticated && !user && !isAuthLoading) {
      console.log('Authenticated but no user object - waiting for session recovery')
      // Don't redirect immediately, give time for session recovery
    }
  }, [isAuthenticated, user, isAuthLoading])

  const isLoading = isAuthLoading || isDataLoading

  // Check if user has no data yet (empty state)
  const hasNoData = useMemo(() => {
    if (!dashboardData) return false
    return (dashboardData.revenue.total ?? 0) === 0 &&
      (dashboardData.orders.total ?? 0) === 0 &&
      (dashboardData.inventory.total ?? 0) === 0 &&
      (dashboardData.customers.total ?? 0) === 0
  }, [dashboardData])

  // Show onboarding for new users
  useEffect(() => {
    if (!hasNoData || isLoading) return

    const hasSkipped = localStorage.getItem('heytrack_onboarding_skipped')
    const hasCompleted = localStorage.getItem('heytrack_onboarding_completed')

    if (hasSkipped !== null || hasCompleted !== null) return

    const t = setTimeout(() => setShowOnboarding(true), 0)
    return () => clearTimeout(t)
  }, [hasNoData, isLoading])

  // Show loading state while initializing
  if (isLoading && !dashboardData) {
    return renderLoadingState()
  }

  if (error) {
    return renderErrorState(router)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Onboarding Wizard */}
        <OnboardingWizard
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
        />

        {/* Header */}
        <div className="flex items-center justify-between">
          <PageHeader
            title="Beranda"
            description={`Selamat datang di dashboard${user?.email ? `, ${user.email.split('@')[0] ?? 'User'}` : ''}`}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="ml-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Pengaturan
          </Button>
        </div>

        {/* Empty State */}
        {hasNoData && renderEmptyState()}

        {/* Main Dashboard Content */}
        <div className="space-y-6">
          {/* Stats Cards */}
          {widgetVisibility.statsCards && (
            <Suspense fallback={
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }, (_, i) => (
                  <StatsCardSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            }>
              <StatsCardsSectionWithSuspense
                stats={{
                  revenue: {
                    total: dashboardData?.revenue?.total ?? 0,
                    growth: dashboardData?.revenue?.growth ?? '0',
                    trend: dashboardData?.revenue?.trend ?? 'up'
                  },
                  orders: {
                    total: dashboardData?.orders?.total ?? 0,
                    active: dashboardData?.orders?.active ?? 0
                  },
                  customers: {
                    total: dashboardData?.customers?.total ?? 0,
                    vip: dashboardData?.customers?.vip ?? 0
                  },
                  inventory: {
                    total: dashboardData?.inventory?.total ?? 0,
                    lowStock: dashboardData?.inventory?.lowStock ?? 0
                  }
                }}
                formatCurrency={formatCurrency}
              />
            </Suspense>
          )}

          {(widgetVisibility.recentOrders || widgetVisibility.stockAlerts) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              {widgetVisibility.recentOrders && (
                <Suspense fallback={<RecentOrdersSkeleton />}>
                  <RecentOrdersSectionWithSuspense orders={dashboardData?.orders?.recent ?? []} />
                </Suspense>
              )}

              {/* Low Stock Alert */}
              {widgetVisibility.stockAlerts && (
                <Suspense fallback={<StockAlertSkeleton />}>
                  <StockAlertsSectionWithSuspense lowStockItems={dashboardData?.inventory?.lowStockAlerts ?? []} />
                </Suspense>
              )}
            </div>
          )}

          {/* Financial Trends Chart */}
          {widgetVisibility.financialChart && (
            <Suspense fallback={
              <div className="space-y-3">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
              </div>
            }>
              <FinancialTrendsChart days={90} />
            </Suspense>
          )}

          {/* Inventory Trends Chart */}
          {widgetVisibility.inventoryChart && (
            <Suspense fallback={
              <div className="space-y-3">
                <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
              </div>
            }>
              <InventoryTrendsChart days={30} />
            </Suspense>
          )}

          {/* HPP Dashboard Widget */}
          {widgetVisibility.hppWidget && (
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analisis HPP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted animate-pulse rounded-lg" />
                </CardContent>
              </Card>
            }>
              <HppDashboardWidgetWithSuspense />
            </Suspense>
          )}
        </div>

        {/* Quick Actions */}
        {widgetVisibility.quickActions && renderQuickActions(router)}

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Pengaturan Dashboard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="stats-cards">Kartu Statistik</Label>
                <Switch
                  id="stats-cards"
                  checked={widgetVisibility.statsCards}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, statsCards: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="financial-chart">Chart Keuangan</Label>
                <Switch
                  id="financial-chart"
                  checked={widgetVisibility.financialChart}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, financialChart: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="inventory-chart">Chart Inventori</Label>
                <Switch
                  id="inventory-chart"
                  checked={widgetVisibility.inventoryChart}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, inventoryChart: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="recent-orders">Pesanan Terbaru</Label>
                <Switch
                  id="recent-orders"
                  checked={widgetVisibility.recentOrders}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, recentOrders: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="stock-alerts">Alert Stok</Label>
                <Switch
                  id="stock-alerts"
                  checked={widgetVisibility.stockAlerts}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, stockAlerts: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hpp-widget">Widget HPP</Label>
                <Switch
                  id="hpp-widget"
                  checked={widgetVisibility.hppWidget}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, hppWidget: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="quick-actions">Aksi Cepat</Label>
                <Switch
                  id="quick-actions"
                  checked={widgetVisibility.quickActions}
                  onCheckedChange={(checked) =>
                    setWidgetVisibility(prev => ({ ...prev, quickActions: checked }))
                  }
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}
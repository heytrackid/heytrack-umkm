'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart3, Calculator, ChefHat, Package, ShoppingCart, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { DashboardHeaderSkeleton, RecentOrdersSkeleton, StatsCardSkeleton, StockAlertSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'

// Toast hook available for future use
// import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useCurrency } from '@/hooks/useCurrency'

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { FinancialTrendsChart } from '@/modules/charts/components/FinancialTrendsChart'
import { InventoryTrendsChart } from '@/modules/charts/components/InventoryTrendsChart'
import HppDashboardWidget from './components/HppDashboardWidget'
import RecentOrdersSection from './components/RecentOrdersSection'
import StatsCardsSection from './components/StatsCardsSection'
import StockAlertsSection from './components/StockAlertsSection'

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

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await fetch('/api/dashboard/stats', {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Gagal memuat data dashboard')
  }

  return response.json()
}

const DashboardPage = () => {
  const { formatCurrency } = useCurrency()
  const { user, isLoading: isAuthLoading } = useAuth()
  // const { toast } = useToast()
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const {
    data: dashboardData,
    isLoading: isDataLoading,
    error
  } = useQuery({
    queryKey: ['dashboard', 'all-data'],
    queryFn: fetchDashboardData,
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  const isLoading = isAuthLoading || isDataLoading

  const hasNoData = useMemo(() => {
    if (!dashboardData) return false
    return (dashboardData.revenue.total ?? 0) === 0 &&
      (dashboardData.orders.total ?? 0) === 0 &&
      (dashboardData.inventory.total ?? 0) === 0 &&
      (dashboardData.customers.total ?? 0) === 0
  }, [dashboardData])

  useEffect(() => {
    if (!hasNoData || isLoading) return

    const hasSkipped = localStorage.getItem('heytrack_onboarding_skipped')
    const hasCompleted = localStorage.getItem('heytrack_onboarding_completed')

    if (hasSkipped !== null || hasCompleted !== null) return

    const t = setTimeout(() => setShowOnboarding(true), 0)
    return () => clearTimeout(t)
  }, [hasNoData, isLoading])

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
    return (
      <AppLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Terjadi kesalahan saat memuat data dashboard</p>
          <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-primary text-white rounded">
            Kembali ke Beranda
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <OnboardingWizard
          open={showOnboarding}
          onOpenChange={setShowOnboarding}
        />

        <PageHeader
          title="Beranda"
          description={`Selamat datang di dashboard${user?.email ? `, ${user.email.split('@')[0] ?? 'User'}` : ''}`}
        />

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
                </div>

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
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <StatsCardsSection
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentOrdersSection orders={dashboardData?.orders?.recent ?? []} />
            <StockAlertsSection lowStockItems={dashboardData?.inventory?.lowStockAlerts ?? []} />
          </div>

          <FinancialTrendsChart days={90} />
          <InventoryTrendsChart days={30} />
          <HppDashboardWidget />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Aksi Cepat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Button
                variant="default"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => router.push('/orders/new')}
              >
                <ShoppingCart className="h-6 w-6" />
                <div className="text-sm font-medium">Buat Order</div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => router.push('/recipes/ai-generator')}
              >
                <ChefHat className="h-6 w-6" />
                <div className="text-sm font-medium">Generate Resep</div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => router.push('/inventory')}
              >
                <Package className="h-6 w-6" />
                <div className="text-sm font-medium">Tambah Bahan</div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => router.push('/reports')}
              >
                <BarChart3 className="h-6 w-6" />
                <div className="text-sm font-medium">Lihat Laporan</div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => router.push('/suppliers')}
              >
                <Users className="h-6 w-6" />
                <div className="text-sm font-medium">Kelola Supplier</div>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2 text-center"
                onClick={() => router.push('/hpp/calculator')}
              >
                <Calculator className="h-6 w-6" />
                <div className="text-sm font-medium">Kalkulator HPP</div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default DashboardPage
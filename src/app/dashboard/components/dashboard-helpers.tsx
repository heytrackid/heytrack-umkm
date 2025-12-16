import { Calculator, ChefHat, Package, Plus } from '@/components/icons'


import { Card, CardContent } from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { StatsSkeleton } from '@/components/ui/skeleton-loader'
import { DashboardHeaderSkeleton, RecentOrdersSkeleton, StockAlertSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useCurrency } from '@/hooks/useCurrency'

import type { useRouter } from 'next/navigation'
import type { JSX } from 'react'

export const StatsCardsGridSkeleton = (): JSX.Element => (
  <div className="mb-8">
    <StatsSkeleton count={4} />
  </div>
)

export const renderLoadingState = (): JSX.Element => (
  <div className="space-y-8">
    <DashboardHeaderSkeleton />
    <StatsCardsGridSkeleton />
    <div className="grid grid-cols-1 grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <RecentOrdersSkeleton />
      </div>
      <div>
        <StockAlertSkeleton />
      </div>
    </div>
  </div>
)

export const renderErrorState = (router: ReturnType<typeof useRouter>): JSX.Element => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground mb-6">Gagal memuat data dashboard. Silakan coba lagi.</p>
      <LoadingButton onClick={() => router.refresh()}>
        Coba Lagi
      </LoadingButton>
    </div>
  </div>
)

export const renderEmptyState = (
  _router: ReturnType<typeof useRouter>
): JSX.Element => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground mb-2">Selamat Datang!</h2>
      <p className="text-muted-foreground mb-6">
        Mari mulai mengelola bisnis kuliner Anda dengan HeyTrack.
      </p>

    </div>
  </div>
)

export const QuickActionsCard = ({ router }: { router: ReturnType<typeof useRouter> }): JSX.Element => {
  useCurrency()

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-3">
          <LoadingButton
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => router.push('/orders/new')}
          >
            <Plus className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Pesanan Baru</div>
              <div className="text-xs opacity-80">Buat pesanan</div>
            </div>
          </LoadingButton>
          <LoadingButton
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => router.push('/recipes')}
          >
            <ChefHat className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Resep Baru</div>
              <div className="text-xs opacity-80">Tambah resep</div>
            </div>
          </LoadingButton>
          <LoadingButton
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => router.push('/inventory')}
          >
            <Package className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Stok Bahan</div>
              <div className="text-xs opacity-80">Kelola inventori</div>
            </div>
          </LoadingButton>
          <LoadingButton
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
            onClick={() => router.push('/hpp/calculator')}
          >
            <Calculator className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Kalkulator HPP</div>
              <div className="text-xs opacity-80">Biaya produksi</div>
            </div>
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}

export const renderQuickActions = (router: ReturnType<typeof useRouter>): JSX.Element => (
  <QuickActionsCard router={router} />
)
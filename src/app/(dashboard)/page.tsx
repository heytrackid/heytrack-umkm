'use client'

import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/api/useDashboard'
import {
    AlertTriangle,
    DollarSign,
    Package,
    Plus,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function DashboardPage(): JSX.Element {
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const { data: stats, isLoading: statsLoading } = useDashboardStats()

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const _getStatusBadge = (status: string): JSX.Element => {
    const variants: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pending', className: 'bg-yellow-500/10 text-yellow-600' },
      PROCESSING: { label: 'Diproses', className: 'bg-blue-500/10 text-blue-600' },
      COMPLETED: { label: 'Selesai', className: 'bg-green-500/10 text-green-600' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-500/10 text-red-600' },
    }

    const variant = variants[status] || variants['PENDING']

    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    )
  }

  return (
    <>
      <OnboardingWizard open={onboardingOpen} onOpenChange={setOnboardingOpen} />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di HeyTrack - Kelola bisnis kuliner Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/orders/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Pesanan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pesanan</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.pendingOrders} pending
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.completedOrders} selesai
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pelanggan</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pelanggan aktif
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stok Rendah</p>
                <p className="text-2xl font-bold text-foreground">{stats.lowStockItems}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.totalRecipes} resep
                </p>
              </div>
              {stats.lowStockItems > 0 ? (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              ) : (
                <Package className="h-8 w-8 text-primary" />
              )}
            </div>
          </Card>
        </div>
      )}

      <Separator className="my-6" />

      {/* Cash Flow Summary */}
      {!statsLoading && stats && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Ringkasan Arus Kas (30 Hari Terakhir)</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-green-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.cashFlow.totalIncome)}
              </p>
            </div>
            <div className="p-4 bg-red-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.cashFlow.totalExpense)}
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Arus Kas Bersih</p>
              <p className={`text-xl font-bold ${stats.cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.cashFlow.netCashFlow)}
              </p>
            </div>
          </div>
          <Link href="/cash-flow">
            <Button variant="outline" className="mt-4">
              Lihat Detail Arus Kas
            </Button>
          </Link>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Aksi Cepat</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <Link href="/orders/new">
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buat Pesanan
            </Button>
          </Link>
          <Link href="/ingredients">
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              Kelola Bahan
            </Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="h-4 w-4 mr-2" />
              Lihat Resep
            </Button>
          </Link>
          <Link href="/hpp">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Hitung HPP
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">Pesanan Terbaru</h2>
          <Link href="/orders">
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </div>

        {statsLoading ? (
          <p className="text-muted-foreground">Memuat...</p>
        ) : stats?.orders.recent && stats.orders.recent.length > 0 ? (
          <div className="space-y-3">
            {stats.orders.recent.map((order, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-foreground">Order #{index + 1}</p>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.customer} • {formatDate(order.time)}
                  </p>
                </div>
                <p className="font-semibold text-foreground">
                  {formatCurrency(order.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Belum ada pesanan</p>
            <Link href="/orders/new">
              <Button className="mt-3">Buat Pesanan Pertama</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Low Stock Alert */}
      {!statsLoading && stats && stats.lowStockItems > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Peringatan Stok Rendah</AlertTitle>
          <AlertDescription>
            Ada {stats.lowStockItems} bahan dengan stok rendah. Segera lakukan pembelian
            untuk menghindari kehabisan stok.
            <Link href="/ingredients">
              <Button variant="outline" size="sm" className="mt-3">
                Lihat Bahan
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}
      </div>
    </>
  )
}

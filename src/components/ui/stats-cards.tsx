import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'
import type { ComponentType, ReactNode } from 'react'

/**
 * Shared Stats Cards Components
 * Reusable statistics display components
 */


export interface StatCardData {
  title: ReactNode
  value: ReactNode
  valueClassName?: string
  description?: string
   icon?: ComponentType<{ className?: string }>
  iconWrapperClassName?: string
  iconClassName?: string
  cardClassName?: string
  footer?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'destructive' | 'secondary'
}

interface StatsCardsProps {
  stats: StatCardData[]
  className?: string
  gridClassName?: string
}

/**
 * Standardized stats cards grid component
 */
export const StatsCards = ({ stats, className, gridClassName = "grid grid-cols-1 sm:grid-cols-2 gap-3 lg:grid-cols-4" }: StatsCardsProps) => (
  <div className={cn(gridClassName, className, "w-full max-w-full overflow-hidden")}>
    {stats.map((stat, index) => (
      <div key={index} className="min-w-0 w-full max-w-full">
        <StatCard {...stat} />
      </div>
    ))}
  </div>
)

/**
 * Individual stat card component
 */
export const StatCard = ({
  title,
  value,
  valueClassName,
  description,
  icon: Icon,
  iconWrapperClassName,
  iconClassName,
  cardClassName,
  footer,
  trend,
  variant: _variant = 'default'
}: StatCardData) => (
  <Card className={cn(cardClassName, "max-w-full overflow-hidden")}>
    <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
      <CardTitle className="text-sm font-medium min-w-0 whitespace-normal break-words max-w-full">
        {title}
      </CardTitle>
      {Icon && (
        iconWrapperClassName
          ? (
            <div className={cn('shrink-0', iconWrapperClassName)}>
              <Icon className={cn('h-4 w-4', iconClassName)} />
            </div>
          )
          : (
            <Icon className={cn('h-4 w-4 text-muted-foreground shrink-0', iconClassName)} />
          )
      )}
    </CardHeader>
    <CardContent className="max-w-full overflow-hidden">
      <div className={cn(
        'text-lg sm:text-2xl font-bold leading-tight whitespace-normal break-words max-w-full overflow-hidden',
        valueClassName
      )}>
        {value}
      </div>
      {(description || trend) && (
        <div className="flex items-center justify-between max-w-full">
          {description && (
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          )}
          {trend && (
            <Badge
              variant={trend.isPositive ? 'default' : 'destructive'}
              className="text-xs shrink-0"
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </Badge>
          )}
        </div>
      )}
      {footer && (
        <div className={cn((description || trend) ? 'mt-1' : 'mt-2', "max-w-full overflow-hidden")}>
          {footer}
        </div>
      )}
    </CardContent>
  </Card>
)

/**
 * Common stat card patterns for different entities
 */
export const StatCardPatterns = {
  ingredients: (stats: {
    total: number
    lowStock: number
    outOfStock: number
    totalValue: number
  }) => [
      {
        title: "Total Bahan",
        value: stats.total,
        description: "Jenis bahan baku terdaftar",
        icon: ({ className }: { className?: string }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      },
      {
        title: "Stok Rendah",
        value: stats.lowStock,
        description: "Perlu segera dipesan",
        variant: stats.lowStock > 0 ? 'destructive' : 'default' as 'default' | 'destructive'
      },
      {
        title: "Stok Habis",
        value: stats.outOfStock,
        description: "Bahan tidak tersedia",
        variant: stats.outOfStock > 0 ? 'destructive' : 'default' as 'default' | 'destructive'
      },
      {
        title: "Nilai Total",
        value: `Rp ${stats.totalValue.toLocaleString('id-ID')}`,
        description: "Total nilai inventori"
      }
    ],

  orders: (stats: {
    total: number
    pending: number
    completed: number
    revenue: number
  }) => [
      {
        title: "Total Pesanan",
        value: stats.total,
        description: "Semua pesanan",
        icon: ({ className }: { className?: string }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      },
      {
        title: "Menunggu",
        value: stats.pending,
        description: "Pesanan pending",
        variant: stats.pending > 0 ? 'secondary' : 'default' as 'default' | 'secondary'
      },
      {
        title: "Selesai",
        value: stats.completed,
        description: "Pesanan selesai"
      },
      {
        title: "Total Pendapatan",
        value: `Rp ${stats.revenue.toLocaleString('id-ID')}`,
        description: "Dari semua pesanan"
      }
    ],

  production: (stats: {
    total: number
    planned: number
    inProgress: number
    completed: number
    totalCost: number
    formatCurrency?: (amount: number) => string
  }) => [
      {
        title: "Total Batch",
        value: stats.total,
        description: "Semua batch produksi"
      },
      {
        title: "Direncanakan",
        value: stats.planned,
        description: "Batch direncanakan"
      },
      {
        title: "Sedang Produksi",
        value: stats.inProgress,
        description: "Batch aktif",
        variant: stats.inProgress > 0 ? 'secondary' : 'default' as 'default' | 'secondary'
      },
      {
        title: "Selesai",
        value: stats.completed,
        description: "Batch selesai"
      },
      {
        title: "Total Cost",
        value: stats.formatCurrency ? stats.formatCurrency(stats.totalCost) : `Rp ${stats.totalCost.toLocaleString('id-ID')}`,
        description: "Biaya produksi"
      }
    ],

  cashFlow: (stats: {
    totalIncome: number
    totalExpenses: number
    netCashFlow: number
    transactionCount: number
    formatCurrency?: (amount: number) => string
  }) => [
      {
        title: "Total Pemasukan",
        value: stats.formatCurrency ? stats.formatCurrency(stats.totalIncome) : `Rp ${stats.totalIncome.toLocaleString('id-ID')}`,
        description: "Semua pemasukan",
        variant: 'default' as const
      },
      {
        title: "Total Pengeluaran",
        value: stats.formatCurrency ? stats.formatCurrency(stats.totalExpenses) : `Rp ${stats.totalExpenses.toLocaleString('id-ID')}`,
        description: "Semua pengeluaran",
        variant: 'destructive' as const
      },
      {
        title: "Arus Kas Bersih",
        value: stats.formatCurrency ? stats.formatCurrency(stats.netCashFlow) : `Rp ${stats.netCashFlow.toLocaleString('id-ID')}`,
        description: stats.netCashFlow >= 0 ? "Positif" : "Negatif",
        variant: stats.netCashFlow >= 0 ? 'default' : 'destructive' as 'default' | 'destructive'
      },
      {
        title: "Total Transaksi",
        value: stats.transactionCount,
        description: "Jumlah transaksi"
      }
    ],

  suppliers: (stats: {
    total: number
    active: number
    preferred: number
    totalSpent: number
    formatCurrency?: (amount: number) => string
  }) => [
      {
        title: "Total Supplier",
        value: stats.total,
        description: `${stats.active} aktif, ${stats.preferred} preferred`
      },
      {
        title: "Total Pembelian",
        value: stats.formatCurrency ? stats.formatCurrency(stats.totalSpent) : `Rp ${stats.totalSpent.toLocaleString('id-ID')}`,
        description: "Total nilai pembelian"
      },
      {
        title: "Supplier Aktif",
        value: stats.active,
        description: "Supplier aktif"
      },
      {
        title: "Preferred",
        value: stats.preferred,
        description: "Supplier preferred"
      }
    ]
}

// Import React for type checking

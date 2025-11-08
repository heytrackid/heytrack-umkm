import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { ComponentType } from 'react'

/**
 * Shared Stats Cards Components
 * Reusable statistics display components
 */


export interface StatCardData {
  title: string
  value: number | string
  description?: string
  icon?: ComponentType<{ className?: string | undefined }>
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
export const StatsCards = ({ stats, className, gridClassName = "grid gap-4 md:grid-cols-2 lg:grid-cols-4" }: StatsCardsProps) => (
  <div className={`${gridClassName} ${className ?? ''}`}>
    {stats.map((stat, index) => (
      <StatCard key={index} {...stat} />
    ))}
  </div>
)

/**
 * Individual stat card component
 */
export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant: _variant = 'default'
}: StatCardData) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">
        {title}
      </CardTitle>
      {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className="flex items-center justify-between">
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {trend && (
          <Badge
            variant={trend.isPositive ? 'default' : 'secondary'}
            className="text-xs"
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </Badge>
        )}
      </div>
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
        value: `Rp ${stats.totalValue.toLocaleString()}`,
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
        value: `Rp ${stats.revenue.toLocaleString()}`,
        description: "Dari semua pesanan"
      }
    ]
}

// Import React for type checking

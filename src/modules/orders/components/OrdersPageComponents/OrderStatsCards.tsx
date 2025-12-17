'use client'

import { BarChart3, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'

import type { OrderStats } from './types'

interface OrderStatsCardsProps {
  stats: OrderStats
  formatCurrency: (amount: number) => string
}

export function OrderStatsCards({ stats, formatCurrency }: OrderStatsCardsProps) {
  const cards: StatCardData[] = [
    {
      title: 'Total Pesanan',
      value: stats.total_orders,
      description: 'Rata-rata nilai per pesanan',
      icon: ShoppingCart,
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(stats.total_revenue),
      description: `${stats.revenue_growth}% dari periode sebelumnya`,
      icon: DollarSign,
    },
    {
      title: 'Rata-rata Nilai',
      value: formatCurrency(stats.average_order_value),
      description: 'per pesanan',
      icon: BarChart3,
    },
    {
      title: 'Pendapatan Tertunda',
      value: formatCurrency(stats.pending_revenue),
      description: 'belum dibayar',
      icon: Clock,
    },
  ]

  return (
    <UiStatsCards stats={cards} gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
  )
}

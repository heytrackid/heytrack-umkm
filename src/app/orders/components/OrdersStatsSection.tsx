'use client'

import { Clock, DollarSign, Package, ShoppingCart } from '@/components/icons'

import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'



interface OrdersStatsSectionProps {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  pendingRevenue: number
  formatCurrency: (value: number) => string
}

const OrdersStatsSection = ({
  totalOrders,
  totalRevenue,
  averageOrderValue,
  pendingRevenue,
  formatCurrency,
}: OrdersStatsSectionProps): JSX.Element => (
  <UiStatsCards
    stats={([
      {
        title: 'Total Pesanan',
        value: totalOrders,
        description: '18.7% dari periode sebelumnya',
        icon: ShoppingCart,
      },
      {
        title: 'Total Pendapatan',
        value: formatCurrency(totalRevenue),
        description: '23.2% dari periode sebelumnya',
        icon: DollarSign,
      },
      {
        title: 'Rata-rata Nilai',
        value: formatCurrency(averageOrderValue),
        description: 'per pesanan',
        icon: Package,
      },
      {
        title: 'Pendapatan Pending',
        value: formatCurrency(pendingRevenue),
        description: 'belum dibayar',
        icon: Clock,
      },
    ] satisfies StatCardData[])}
    gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4"
  />
)

export { OrdersStatsSection }

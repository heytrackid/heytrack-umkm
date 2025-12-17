// Customer Stats Component - Lazy Loaded
// Displays customer statistics and metrics cards

import { UserPlus, Users } from '@/components/icons'

import { StatsSkeleton } from '@/components/ui/skeleton-loader'
import { StatsCards as UiStatsCards, type StatCardData } from '@/components/ui/stats-cards'
import { useSettings } from '@/contexts/settings-context'
import { cn } from '@/lib/utils'

import type { Row } from '@/types/database'

type Customer = Row<'customers'>

interface CustomerStatsProps {
  customers: Customer[]
  isLoading: boolean
  isMobile: boolean
}

interface CustomerStatsData {
  total: number
  active: number
  averageSpent: number
  averageOrders: number
}

const CustomerStats = ({
  customers,
  isLoading,
  isMobile
}: CustomerStatsProps): JSX.Element => {
  const { formatCurrency, formatCompactCurrency, settings } = useSettings()

  const CurrencyIcon = ({ className }: { className?: string }): JSX.Element => (
    <span className={cn('flex items-center justify-center font-bold', className)}>
      {settings.currency.symbol}
    </span>
  )

  const HashIcon = ({ className }: { className?: string }): JSX.Element => (
    <span className={cn('flex items-center justify-center font-bold', className)}>#</span>
  )

  // Ensure customers is always an array
  const customerArray = Array.isArray(customers) ? customers : []

  const stats: CustomerStatsData = {
    total: customerArray.length,
    active: customerArray.filter(c => c.is_active).length,
    averageSpent: customerArray.length > 0
      ? customerArray.reduce((sum, c) => sum + (c.total_spent ?? 0), 0) / customerArray.length
      : 0,
    averageOrders: customerArray.length > 0
      ? customerArray.reduce((sum, c) => sum + (c.total_orders ?? 0), 0) / customerArray.length
      : 0
  }

  if (isLoading) {
    return <StatsSkeleton count={4} />
  }

  const cards: StatCardData[] = [
    {
      title: 'Total',
      value: stats.total,
      ...(!isMobile ? { description: 'Terdaftar di sistem' } : {}),
      icon: Users,
      iconWrapperClassName: 'shrink-0 p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-200/20',
      iconClassName: 'h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400',
      valueClassName: 'text-xl sm:text-2xl lg:text-3xl tracking-tight',
    },
    {
      title: 'Aktif',
      value: stats.active,
      ...(!isMobile ? { description: 'Status aktif' } : {}),
      icon: UserPlus,
      iconWrapperClassName: 'shrink-0 p-1.5 sm:p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-200/20',
      iconClassName: 'h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400',
      valueClassName: 'text-xl sm:text-2xl lg:text-3xl tracking-tight',
    },
    {
      title: 'Avg Belanja',
      value: isMobile ? formatCompactCurrency(stats.averageSpent) : formatCurrency(stats.averageSpent),
      ...(!isMobile ? { description: 'Per pelanggan' } : {}),
      icon: CurrencyIcon,
      iconWrapperClassName: 'shrink-0 p-1.5 sm:p-2 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-200/20',
      iconClassName: 'h-3 w-3 sm:h-4 sm:w-4 text-violet-600 dark:text-violet-400 text-xs sm:text-sm',
      valueClassName: 'text-lg sm:text-xl lg:text-2xl tracking-tight',
    },
    {
      title: 'Avg Order',
      value: Math.round(stats.averageOrders),
      ...(!isMobile ? { description: 'Per pelanggan' } : {}),
      icon: HashIcon,
      iconWrapperClassName: 'shrink-0 p-1.5 sm:p-2 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg border border-orange-200/20',
      iconClassName: 'h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400 text-xs sm:text-sm',
      valueClassName: 'text-xl sm:text-2xl lg:text-3xl tracking-tight',
    },
  ]

  return (
    <UiStatsCards
      stats={cards}
      gridClassName="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    />
  )
}

export { CustomerStats }

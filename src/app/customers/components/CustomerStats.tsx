// Customer Stats Component - Lazy Loaded
// Displays customer statistics and metrics cards

import { UserPlus, Users } from '@/components/icons'

import { Card, CardContent } from '@/components/ui/card'
import { StatsSkeleton } from '@/components/ui/skeleton-loader'
import { useSettings } from '@/contexts/settings-context'

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
  const { formatCurrency, settings } = useSettings()

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Total Pelanggan</p>
            <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg border border-blue-200/20">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground">
              Terdaftar di sistem
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Pelanggan Aktif</p>
            <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-lg border border-emerald-200/20">
              <UserPlus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">
              Status aktif saat ini
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Rata-rata Belanja</p>
            <div className="p-2 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-lg border border-violet-200/20">
              <span className="h-4 w-4 flex items-center justify-center font-bold text-violet-600 dark:text-violet-400">
                {settings.currency.symbol}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <div className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {formatCurrency(stats.averageSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per pelanggan
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <p className="text-sm font-medium text-muted-foreground">Rata-rata Order</p>
            <div className="p-2 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-lg border border-orange-200/20">
              <span className="h-4 w-4 flex items-center justify-center font-bold text-orange-600 dark:text-orange-400">#</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className={`font-bold tracking-tight ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
              {Math.round(stats.averageOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              Transaksi per pelanggan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { CustomerStats }

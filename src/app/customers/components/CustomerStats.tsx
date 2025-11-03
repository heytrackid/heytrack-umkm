// Customer Stats Component - Lazy Loaded
// Displays customer statistics and metrics cards

import { Card, CardContent } from '@/components/ui/card'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useSettings } from '@/contexts/settings-context'
import { UserPlus, Users } from 'lucide-react'
import type { CustomersTable } from '@/types/database'

type Customer = CustomersTable

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
}: CustomerStatsProps) => {
  const { formatCurrency, settings } = useSettings()

  const stats: CustomerStatsData = {
    total: customers.length,
    active: customers.filter(c => c.is_active).length,
    averageSpent: customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.total_spent ?? 0), 0) / customers.length
      : 0,
    averageOrders: customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.total_orders ?? 0), 0) / customers.length
      : 0
  }

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
        {Array.from({ length: 4 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'md:grid-cols-4'}`}>
      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {stats.total}
          </div>
          <p className="text-sm text-muted-foreground">Total Pelanggan</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <UserPlus className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {stats.active}
          </div>
          <p className="text-sm text-muted-foreground">Pelanggan Aktif</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="h-8 w-8 text-blue-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">
            {settings.currency.symbol}
          </div>
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {formatCurrency(stats.averageSpent)}
          </div>
          <p className="text-sm text-muted-foreground">Rata-rata Belanja</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-center">
          <div className="h-8 w-8 text-orange-600 mx-auto mb-2 flex items-center justify-center font-bold text-lg">#</div>
          <div className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {Math.round(stats.averageOrders)}
          </div>
          <p className="text-sm text-muted-foreground">Rata-rata Order</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CustomerStats

// Sales Report Component
// Handles sales data filtering, calculations, and display

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/supabase/useSupabaseCRUD'
import type { OrdersTable } from '@/types/database'

type Order = OrdersTable

interface SalesReportProps {
  dateRange: {
    start: string
    end: string
  }
}

export default function SalesReport({ dateRange }: SalesReportProps) {
  const { formatCurrency } = useCurrency()
  const { data: orders } = useSupabaseCRUD<'orders'>('orders')

  // Calculate sales report
  const salesData = (orders ?? []).filter((order): order is Order & { created_at: string } => {
    if (!order.created_at) { return false }
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    return orderDate >= dateRange.start && orderDate <= dateRange.end
  })

  const salesStats = salesData.reduce<{ totalOrders: number; totalRevenue: number; completedOrders: number; pendingOrders: number }>(
    (stats, order) => {
      stats.totalOrders += 1
      stats.totalRevenue += order.total_amount ?? 0

      if (order.status === 'DELIVERED') {
        stats.completedOrders += 1
      }

      if (order.status === 'PENDING' || order.status === 'CONFIRMED') {
        stats.pendingOrders += 1
      }

      return stats
    },
    { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 }
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pesanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{salesStats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pendapatan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{salesStats.completedOrders}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{salesStats.pendingOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detail Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {salesData.slice(0, 10).map((order) => (
              <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{order.order_no}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(order.total_amount ?? 0)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

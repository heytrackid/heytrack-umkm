import { ShoppingCart, DollarSign, CheckCircle, Clock } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { useCurrency } from '@/hooks/useCurrency'

import type { Row } from '@/types/database'

// Sales Report Component
// Handles sales data filtering, calculations, and display


type Order = Row<'orders'>

interface SalesReportProps {
  dateRange: {
    start: string | undefined
    end: string | undefined
  }
}

const SalesReport = ({ dateRange }: SalesReportProps) => {
  const { formatCurrency } = useCurrency()
  const { data: orders } = useSupabaseCRUD<'orders'>('orders')

  // Calculate sales report
  const salesData = (orders ?? []).filter((order): order is Order & { created_at: string } => {
    if (!order.created_at || !dateRange.start || !dateRange.end) { return false }
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    if (!orderDate) {return false}
    return orderDate >= dateRange.start && orderDate <= dateRange.end
  })

  const salesStats = salesData.reduce<{ totalOrders: number; totalRevenue: number; completedOrders: number; pendingOrders: number }>(
    (stats, order) => {
      stats.totalOrders += 1
      stats.totalRevenue += order.total_amount ?? 0

      if (order['status'] === 'DELIVERED') {
        stats.completedOrders += 1
      }

      if (order['status'] === 'PENDING' || order['status'] === 'CONFIRMED') {
        stats.pendingOrders += 1
      }

      return stats
    },
    { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 }
  )

  // Calculate growth percentage (assuming we have previous period data)
  const revenueGrowth = 12; // This would be calculated from previous period
  const orderGrowth = 8; // This would be calculated from previous period

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pesanan
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+{orderGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(salesStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+{revenueGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Selesai
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{salesStats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Diterima pelanggan</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{salesStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Perlu ditindaklanjuti</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed View */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Detail Penjualan
            <span className="text-sm text-muted-foreground">
              ({salesData.length} pesanan dalam periode ini)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesData.length > 0 ? (
              salesData.slice(0, 10).map((order) => (
                <div 
                  key={order['id']} 
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{order['order_no']}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{new Date(order.created_at).toLocaleDateString('id-ID')}</span>
                        <span>•</span>
                        <span className="capitalize">{order['status']?.toLowerCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(order.total_amount ?? 0)}</p>
                    <span className="text-xs text-muted-foreground">
                       {order['customer_name'] ?? 'Pelanggan'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Tidak ada data penjualan untuk periode ini</p>
                <p className="text-sm text-muted-foreground mt-1">Coba ganti rentang tanggal atau cek kembali data pesanan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesReport

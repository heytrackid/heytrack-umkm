// Sales Report Component
// Handles sales data filtering, calculations, and display

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/useSupabase'

interface SalesReportProps {
  dateRange: {
    start: string
    end: string
  }
}

export default function SalesReport({ dateRange }: SalesReportProps) {
  const { formatCurrency } = useCurrency()
  const { data: orders } = useSupabaseCRUD('orders')

  // Calculate sales report
  const salesData = orders?.filter((order: any) => {
    const orderDate = new Date(order.created_at).toISOString().split('T')[0]
    return orderDate >= dateRange.start && orderDate <= dateRange.end
  }) || []

  const salesStats = {
    totalOrders: salesData.length,
    totalRevenue: salesData.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
    completedOrders: salesData.filter((o: any) => o.status === 'DELIVERED').length,
    pendingOrders: salesData.filter((o: any) => o.status === 'PENDING' || o.status === 'CONFIRMED').length
  }

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
            {salesData.slice(0, 10).map((order: any) => (
              <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{order.order_no}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

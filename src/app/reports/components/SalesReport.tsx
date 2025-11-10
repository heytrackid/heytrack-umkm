import { ShoppingCart, DollarSign, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createLogger } from '@/lib/logger'

interface SalesReportProps {
  dateRange: {
    start: string | undefined
    end: string | undefined
  }
}

// Server-side data fetching
async function fetchSalesData(dateRange: { start: string | undefined; end: string | undefined }) {
  const logger = createLogger('SalesReport')

  if (!dateRange.start || !dateRange.end) {
    return { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 }
  }

  try {
    const params = new URLSearchParams({
      start_date: dateRange.start,
      end_date: dateRange.end,
      limit: '1000' // Get all data for the period
    })

    const response = await fetch(`${process.env['NEXT_PUBLIC_SITE_URL'] || 'http://localhost:3000'}/api/sales?${params}`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch sales data')
    }

    const result = await response.json()
    const sales = result.data || []

    // Calculate stats from API data
    const stats = sales.reduce(
      (acc: { totalOrders: number; totalRevenue: number; completedOrders: number; pendingOrders: number }, sale: any) => {
        acc.totalOrders += 1
        acc.totalRevenue += sale.amount ?? 0
        // Note: The sales API returns financial_records, not orders, so status-based counting may not apply
        return acc
      },
      { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 }
    )

    return stats
  } catch (error) {
    logger.error({ error }, 'Failed to fetch sales data')
    return { totalOrders: 0, totalRevenue: 0, completedOrders: 0, pendingOrders: 0 }
  }
}

export async function SalesReport({ dateRange }: SalesReportProps) {
  const salesStats = await fetchSalesData(dateRange)

  // Calculate growth percentage (assuming we have previous period data)
  const revenueGrowth = 12; // This would be calculated from previous period
  const orderGrowth = 8; // This would be calculated from previous period

  // Format currency function (simplified for server component)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

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
              ({salesStats.totalOrders} transaksi dalam periode ini)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Detail transaksi akan ditampilkan di versi lengkap</p>
            <p className="text-sm text-muted-foreground mt-1">Fitur ini sedang dalam pengembangan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

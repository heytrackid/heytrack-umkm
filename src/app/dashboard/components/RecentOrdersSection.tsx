'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { useRouter } from 'next/navigation'

interface RecentOrdersSectionProps {
  orders?: Array<{
    id: string
    customer: string
    amount: number | null
    status: string | null
    time: string | null
  }>
}

const RecentOrdersSection = ({ orders = [] }: RecentOrdersSectionProps) => {
  const { formatCurrency } = useCurrency()
  const router = useRouter()

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      PENDING: { label: 'Pending', variant: 'secondary' },
      CONFIRMED: { label: 'Dikonfirmasi', variant: 'default' },
      IN_PROGRESS: { label: 'Diproses', variant: 'default' },
      COMPLETED: { label: 'Selesai', variant: 'outline' },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' }
    }

    const statusInfo = statusMap[status || 'PENDING'] || statusMap.PENDING
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  // Show skeleton if orders is undefined
  if (orders === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Pesanan Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
            <p>Belum ada pesanan terbaru</p>
            <p className="text-sm">Pesanan akan muncul di sini ketika ada data</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-wrap-mobile">{order.customer}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(order.amount || 0)}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full" onClick={() => router.push('/orders')}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Lihat Semua Pesanan
        </Button>
      </CardContent>
    </Card>
  )
}

export default RecentOrdersSection

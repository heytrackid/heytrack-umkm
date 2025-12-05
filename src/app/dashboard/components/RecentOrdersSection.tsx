'use client'

import { ShoppingCart } from '@/components/icons'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { useCurrency } from '@/hooks/useCurrency'

interface RecentOrdersSectionProps {
  orders?: Array<{
    id: string
    customer: string
    amount: number | null
    status: string | null
    created_at: string | null
  }>
}

const RecentOrdersSection = ({
  orders = []
}: RecentOrdersSectionProps): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  
  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
      IN_PROGRESS: { label: 'Diproses', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
      READY: { label: 'Siap', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
      DELIVERED: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800' }
    }

    const statusInfo = statusMap[status ?? 'PENDING'] ?? statusMap['PENDING'] ?? { label: 'Unknown', className: 'bg-gray-100 text-gray-700' }
    
    return (
      <Badge variant="outline" className={cn("font-medium border shadow-sm", statusInfo.className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-60" />
        {statusInfo.label}
      </Badge>
    )
  }

  // Helper to generate consistent avatar colors from name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
      'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
      'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
      'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
      'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
      'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
      'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
      'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
    ]
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  // Use all orders (date filtering removed)
  const filteredOrders = orders

  // Show skeleton if orders is undefined
  if (orders === undefined) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            Pesanan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            Pesanan Terbaru
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary" onClick={() => router.push('/orders')}>
            Lihat Semua
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-muted-foreground">Belum ada pesanan</p>
              <p className="text-sm text-muted-foreground/60">Pesanan terbaru akan muncul di sini</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push('/orders/new')} className="mt-2">
              Buat Pesanan Baru
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredOrders.map((order) => (
              <div
                key={order['id']}
                className="group flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                onClick={() => router.push(`/orders/${order['id']}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    router.push(`/orders/${order['id']}`)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {/* Avatar */}
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm",
                  getAvatarColor(order.customer)
                )}>
                  {getInitials(order.customer)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {order.customer}
                    </span>
                    <span className="font-bold text-sm tabular-nums">
                      {formatCurrency(order.amount ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                      {order.created_at && (
                        <span>
                          {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="truncate max-w-[120px]">
                        Order #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="scale-90 origin-right">
                      {getStatusBadge(order['status'])}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {filteredOrders.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/50">
            <Button variant="outline" className="w-full group" onClick={() => router.push('/orders')}>
              <ShoppingCart className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
              Kelola Semua Pesanan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default RecentOrdersSection

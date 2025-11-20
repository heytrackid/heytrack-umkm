'use client'


import type { DateRange } from 'react-day-picker'

import { Calendar, Filter, ShoppingCart, X } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useCurrency } from '@/hooks/useCurrency'

interface RecentOrdersSectionProps {
  orders?: Array<{
    id: string
    customer: string
    amount: number | null
    status: string | null
    created_at: string | null
  }>
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
  showDateFilter?: boolean
}

const RecentOrdersSection = ({ 
  orders = [], 
  onDateRangeChange,
  showDateFilter = false 
}: RecentOrdersSectionProps): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const router = useRouter()
  
  // Date range filter state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [showDatePicker, setShowDatePicker] = useState(false)



  const clearDateFilter = () => {
    setDateRange(undefined)
    onDateRangeChange?.(undefined)
    setShowDatePicker(false)
  }

  const getStatusBadge = (status: string | null) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }> = {
      PENDING: { label: 'Pending', variant: 'secondary' },
      CONFIRMED: { label: 'Dikonfirmasi', variant: 'default' },
      IN_PROGRESS: { label: 'Diproses', variant: 'default' },
      COMPLETED: { label: 'Selesai', variant: 'outline' },
      CANCELLED: { label: 'Dibatalkan', variant: 'destructive' }
    }

    const statusInfo = statusMap[status ?? 'PENDING'] ?? statusMap['PENDING']
    if (!statusInfo) {return <Badge variant="secondary">Unknown</Badge>}
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  // Filter orders based on date range
  const filteredOrders = orders.filter((order) => {
    if (!dateRange?.from || !order.created_at) {return true}
    
    const orderDate = new Date(order.created_at)
    const fromDate = new Date(dateRange.from)
    const toDate = dateRange.to ? new Date(dateRange.to) : new Date()
    
    fromDate.setHours(0, 0, 0, 0)
    toDate.setHours(23, 59, 59, 999)
    
    return orderDate >= fromDate && orderDate <= toDate
  })

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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pesanan Terbaru
            {showDateFilter && dateRange?.from && (
              <Badge variant="outline" className="ml-2">
                {dateRange.from.toLocaleDateString('id-ID')} - {dateRange.to?.toLocaleDateString('id-ID') ?? 'Sekarang'}
              </Badge>
            )}
          </CardTitle>
          
          {showDateFilter && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1"
              >
                <Calendar className="h-4 w-4" />
                Filter Tanggal
              </Button>
              
              {dateRange?.from && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateFilter}
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Hapus
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Date Range Picker */}
        {showDateFilter && showDatePicker && dateRange && (
          <div 
            className="mt-4 p-4 border rounded-lg bg-muted/20" 
            role="region" 
            aria-label="Date range picker"
          >
             <div className="w-full md:w-auto">

             </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filter info */}
        {showDateFilter && dateRange?.from && (
          <div className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Menampilkan {filteredOrders.length} dari {orders.length} pesanan
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateFilter}
              className="h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Hapus Filter
            </Button>
          </div>
        )}
        
        {(() => {
          if (filteredOrders.length === 0 && orders.length === 0) {
            return (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2" />
                <p>Belum ada pesanan terbaru</p>
                <p className="text-sm">Pesanan akan muncul di sini ketika ada data</p>
              </div>
            )
          }
          if (filteredOrders.length === 0 && orders.length > 0) {
            return (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>Tidak ada pesanan pada periode ini</p>
                <p className="text-sm">Coba ubah rentang tanggal atau hapus filter</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearDateFilter}
                  className="mt-3"
                >
                  <X className="h-4 w-4 mr-2" />
                  Hapus Filter Tanggal
                </Button>
              </div>
            )
          }
          return (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order['id']}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => router.push(`/orders/${order['id']}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      router.push(`/orders/${order['id']}`)
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-wrap-mobile">{order.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(order.amount ?? 0)}
                      {order.created_at && (
                        <span className="ml-2">
                          • {new Date(order.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(order['status'])}
                  </div>
                </div>
              ))}
            </div>
          )
        })()}
        
        <Button variant="outline" className="w-full" onClick={() => router.push('/orders')}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Lihat Semua Pesanan
        </Button>
      </CardContent>
    </Card>
  )
}

export default RecentOrdersSection

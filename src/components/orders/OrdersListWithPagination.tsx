 
'use client'
import { Package, Plus, Search } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useOrders } from '@/hooks/api/useOrders'
import type { OrderListItem } from '@/types/database'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { useSettings } from '@/contexts/settings-context'
import { usePagination } from '@/hooks/usePagination'
import type { Order, OrderStatus } from '@/types/database'

import { VirtualizedOrderCards } from '@/components/orders/VirtualizedOrderCards'

export const OrdersListWithPagination = (): JSX.Element => {
    const router = useRouter()

    const { formatCurrency } = useSettings()
    // const _supabase = createClient()

    // State for filters
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')

    // Pagination
    const pagination = usePagination({
        initialPageSize: 10,
        totalItems: 0, // Will be set by the hook
    })

    // React Query hook for orders
    const { data: orders = [], isLoading: loading } = useOrders()

    // Client-side filtering and pagination
    const filteredOrders = orders.filter((order) => {
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            return (order as unknown as OrderListItem).order_no?.toLowerCase().includes(term) || 
                   order.customer_id?.toLowerCase().includes(term)
        }
        return true
    })

    const totalItems = filteredOrders.length





    // Handlers
    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value)
        pagination.setPage(1) // Reset to first page on search
    }, [pagination])

    const handleStatusFilter = useCallback((value: string) => {
        setStatusFilter(value as OrderStatus | 'all')
        pagination.setPage(1) // Reset to first page on filter
    }, [pagination])



    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Pesanan</h1>
                    <p className="text-muted-foreground mt-1">
                        Kelola pesanan pelanggan Anda
                    </p>
                </div>
                <Button onClick={() => router.push('/orders/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Pesanan Baru
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nomor pesanan atau nama pelanggan..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter as string} onValueChange={handleStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="CONFIRMED">Dikonfirmasi</SelectItem>
                                <SelectItem value="IN_PROGRESS">Produksi</SelectItem>
                                <SelectItem value="READY">Siap</SelectItem>
                                <SelectItem value="DELIVERED">Terkirim</SelectItem>
                                <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-muted rounded animate-pulse" />
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Tidak ada pesanan</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Tidak ada pesanan yang sesuai dengan filter'
                                : 'Mulai dengan membuat pesanan pertama'}
                        </p>
                        <Button onClick={() => router.push('/orders/new')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Buat Pesanan
                        </Button>
                    </CardContent>
                </Card>
             ) : orders.length > 20 ? (
                 // Virtual scrolling for large lists (>20 items)
                  <VirtualizedOrderCards orders={orders as unknown as Order[]} onOrderClick={(orderId) => router.push(`/orders/${orderId}`)} formatCurrency={formatCurrency} />
             ) : (
                 <div className="space-y-3">
                       {orders.map((order) => (
                          <Card
                              key={(order as unknown as OrderListItem).id}
                              className="transition-all cursor-pointer"
                              onClick={() => router.push(`/orders/${(order as unknown as OrderListItem).id}`)}
                          >
                              <CardContent className="p-6">
                                  <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                          <p className="font-medium text-sm">#{(order as unknown as OrderListItem).order_no}</p>
                                          <p className="text-sm text-muted-foreground">{(order as unknown as OrderListItem).customer_name}</p>
                                      </div>
                                      <div className="text-right space-y-1">
                                          <p className="text-sm text-muted-foreground">
                                              {(order as unknown as OrderListItem).order_date ? format(new Date((order as unknown as OrderListItem).order_date!), 'dd MMM yyyy', { locale: idLocale }) : '-'}
                                          </p>
                                          <Badge variant="default">
                                              {(order as unknown as OrderListItem).status || 'PENDING'}
                                          </Badge>
                                      </div>
                                  </div>
                                  <div className="mt-4 flex items-center justify-between">
                                      <div className="text-sm text-muted-foreground">
                                          0 items
                                      </div>
                                      <div className="font-medium">
                                          {formatCurrency((order as unknown as OrderListItem).total_amount || 0)}
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                     ))}
                 </div>
             )}

            {/* Pagination */}
            {orders.length > 0 && (
                <SimplePagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    totalPages={pagination.totalPages}
                    totalItems={totalItems}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={pagination.setPageSize}
                    canNextPage={pagination.canNextPage}
                    canPrevPage={pagination.canPrevPage}
                    pageSizeOptions={[10, 20, 50]}
                />
            )}
        </div>
    )
}

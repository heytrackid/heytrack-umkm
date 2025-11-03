'use client'

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { usePagination } from '@/hooks/usePagination'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Package, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/contexts/settings-context'
import type { OrdersTable, OrderStatus } from '@/types/database'
import type { PaginatedResponse } from '@/lib/validations/pagination'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

type Order = OrdersTable

interface OrderWithItems extends Order {
    items?: Array<{
        id: string
        product_name: string | null
        quantity: number
        unit_price: number
        total_price: number
    }>
}

export const OrdersListWithPagination = () => {
    const router = useRouter()
    const { toast } = useToast()
    const { formatCurrency } = useSettings()
    // const _supabase = createClient()

    // State
    const [orders, setOrders] = useState<OrderWithItems[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
    const [totalItems, setTotalItems] = useState(0)

    // Pagination
    const pagination = usePagination({
        initialPageSize: 10,
        totalItems,
    })

    // Fetch orders
    const fetchOrders = async () => {
        try {
            setLoading(true)

            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.pageSize.toString(),
            })

            if (searchTerm) {
                params.append('search', searchTerm)
            }

            if (statusFilter !== 'all') {
                params.append('status', statusFilter)
            }

            const response = await fetch(`/api/orders?${params.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch orders')
            }

            const result: PaginatedResponse<OrderWithItems> = await response.json()

            setOrders(result.data)
            setTotalItems(result.meta.total)
        } catch (_error) {
            toast({
                title: 'Error',
                description: 'Gagal memuat data pesanan',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    // Fetch on mount and when pagination/filters change
    useEffect(() => {
        void fetchOrders()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, pagination.pageSize, searchTerm, statusFilter])

    // Handlers
    const handleSearch = (value: string) => {
        setSearchTerm(value)
        pagination.setPage(1) // Reset to first page on search
    }

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value as OrderStatus | 'all')
        pagination.setPage(1) // Reset to first page on filter
    }

    const getStatusBadge = (status: OrderStatus) => {
        const statusConfig: Record<OrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
            PENDING: { label: 'Pending', icon: Clock, className: 'bg-gray-100 text-gray-700' },
            CONFIRMED: { label: 'Dikonfirmasi', icon: CheckCircle, className: 'bg-gray-100 text-gray-700' },
            IN_PROGRESS: { label: 'Sedang Diproses', icon: Package, className: 'bg-gray-100 text-gray-700' },
            READY: { label: 'Siap', icon: CheckCircle, className: 'bg-gray-100 text-gray-700' },
            DELIVERED: { label: 'Terkirim', icon: CheckCircle, className: 'bg-gray-100 text-gray-700' },
            CANCELLED: { label: 'Dibatalkan', icon: XCircle, className: 'bg-gray-100 text-gray-700' },
        }

        const config = statusConfig[status] || statusConfig.PENDING
        const Icon = config.icon

        return (
            <Badge className={config.className}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

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
                                onChange={(e) => handleSearch(e.target.value)}
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
                    {[...Array(5)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
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
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <Card
                            key={order.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/orders/${order.id}`)}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-lg">#{order.order_no}</h3>
                                            {getStatusBadge(order.status ?? 'PENDING')}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Pelanggan: {order.customer_name}</p>
                                            <p>Tanggal: {order.order_date ? new Date(order.order_date).toLocaleDateString('id-ID') : 'No date set'}</p>
                                            {order.delivery_date && (
                                                <p>Pengiriman: {new Date(order.delivery_date).toLocaleDateString('id-ID')}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(order.total_amount ?? 0)}
                                        </p>
                                        {order.items && order.items.length > 0 && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {order.items.length} item
                                            </p>
                                        )}
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

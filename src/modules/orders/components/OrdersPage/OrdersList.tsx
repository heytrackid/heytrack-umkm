'use client'

import { Package, Plus, XCircle } from 'lucide-react'

import type { Order, OrderStatus } from '@/app/orders/types/orders.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { OrderCard } from '@/modules/orders/components/OrdersPage/OrderCard'





/**
 * Orders List Component
 * List view of all orders
 */



interface OrdersListProps {
    orders: Order[]
    hasFilters: boolean
    onCreateOrder: () => void
    onViewOrder: (order: Order) => void
    onEditOrder: (order: Order) => void
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void
    onClearFilters: () => void
}

export const OrdersList = ({
    orders,
    hasFilters,
    onCreateOrder,
    onViewOrder,
    onEditOrder,
    onUpdateStatus,
    onClearFilters
}: OrdersListProps) => {
    if (orders.length === 0) {
        return (
            <Card>
                <CardContent className="py-16">
                    <div className="text-center">
                        <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold mb-2">
                            {hasFilters ? 'Tidak Ada Pesanan yang Cocok' : 'Belum Ada Pesanan'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            {hasFilters
                                ? 'Coba ubah filter atau kata kunci pencarian'
                                : 'Klik tombol "Pesanan Baru" untuk membuat pesanan pertama'}
                        </p>
                        {hasFilters ? (
                            <Button variant="outline" onClick={onClearFilters}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Hapus Filter
                            </Button>
                        ) : (
                            <Button onClick={onCreateOrder}>
                                <Plus className="h-4 w-4 mr-2" />
                                Buat Pesanan Pertama
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCard
                    key={order['id']}
                    order={order}
                    onView={onViewOrder}
                    onEdit={onEditOrder}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </div>
    )
}

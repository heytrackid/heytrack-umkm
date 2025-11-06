'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrency } from '@/hooks/useCurrency'
import { ORDER_STATUS_CONFIG, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/modules/orders/constants'
import type { Order } from '@/modules/orders/types'
import type { OrderStatus, PaymentStatus } from '@/types/database'
import { Edit, Eye } from 'lucide-react'



/**
 * Order Card Component
 * Single order display card
 */



interface OrderCardProps {
    order: Order
    onView: (order: Order) => void
    onEdit: (order: Order) => void
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void
}

export const OrderCard = ({ order, onView, onEdit, onUpdateStatus }: OrderCardProps) => {
    const { formatCurrency } = useCurrency()

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })

    const getStatusColor = (status: OrderStatus | null) => {
        if (!status) { return 'bg-gray-100 text-gray-800' }
        const config = ORDER_STATUS_CONFIG[status]
        if (!config) { return 'bg-gray-100 text-gray-800' }
        return config.color
    }

    const getPaymentStatusColor = (_status: PaymentStatus | null) => 'bg-gray-100 text-gray-800'

    const paymentStatusLabel = order.payment_status && order.payment_status in PAYMENT_STATUS_LABELS
        ? PAYMENT_STATUS_LABELS[order.payment_status as keyof typeof PAYMENT_STATUS_LABELS]
        : 'N/A'

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <div className="font-semibold text-lg">{order.order_no}</div>
                        <div className="text-sm text-muted-foreground">
                            {order.customer_name ?? 'N/A'} • {order.order_date ? formatDate(order.order_date) : 'N/A'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(order.status)}>
                            {order.status ? ORDER_STATUS_LABELS[order.status] : 'N/A'}
                        </Badge>
                        <Badge
                            className={getPaymentStatusColor(
                                (order.payment_status as PaymentStatus) ?? null
                            )}
                        >
                            {paymentStatusLabel}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <div className="text-sm text-muted-foreground">Item</div>
                        <div className="font-medium">N/A</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Total Tagihan</div>
                        <div className="font-medium text-lg">{formatCurrency(order.total_amount ?? 0)}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Tanggal Kirim</div>
                        <div className="font-medium">{order.delivery_date ? formatDate(order.delivery_date) : '-'}</div>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => onView(order)}>
                        <Eye className="h-3 w-3 mr-1" />
                        Detail
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                    </Button>
                    {order.status && ORDER_STATUS_CONFIG[order.status]?.nextStatuses && ORDER_STATUS_CONFIG[order.status].nextStatuses.length > 0 && (
                        <Select
                            value={order.status}
                            onValueChange={(newStatus) => onUpdateStatus(order.id, newStatus as OrderStatus)}
                        >
                            <SelectTrigger className="w-full sm:w-[200px] h-8 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={order.status || 'PENDING'} disabled>
                                    {order.status ? ORDER_STATUS_LABELS[order.status] : 'Status Tidak Diketahui'}
                                </SelectItem>
                                {ORDER_STATUS_CONFIG[order.status]?.nextStatuses?.map((status: OrderStatus) => (
                                    <SelectItem key={status} value={status}>
                                        {ORDER_STATUS_LABELS[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
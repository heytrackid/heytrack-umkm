'use client'

import { Edit, Eye } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrency } from '@/hooks/useCurrency'
import { ORDER_STATUS_CONFIG, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/modules/orders/constants'

import type { Order } from '@/modules/orders/types'
import type { OrderStatus } from '@/types/database'

import { cn } from '@/lib/utils'

type PaymentStatus = string

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
        if (!status) { return 'bg-muted text-muted-foreground' }
        const _config = ORDER_STATUS_CONFIG[status]
        if (!_config) { return 'bg-muted text-muted-foreground' }
        return _config.color
    }

    const getPaymentStatusColor = (_status: PaymentStatus | null) => 'bg-muted text-muted-foreground'

    const paymentStatusLabel = order.payment_status && order.payment_status in PAYMENT_STATUS_LABELS
        ? PAYMENT_STATUS_LABELS[order.payment_status as keyof typeof PAYMENT_STATUS_LABELS]
        : 'N/A'

    return (
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50">
            <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg tracking-tight">{order['order_no']}</span>
                            <Badge variant="outline" className={cn("font-medium border shadow-sm", getStatusColor(order['status']))}>
                                {order['status'] ? ORDER_STATUS_LABELS[order['status']] : 'N/A'}
                            </Badge>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                            <span className="font-medium text-foreground">{order['customer_name'] ?? 'N/A'}</span>
                            <span>•</span>
                            <span>{order.order_date ? formatDate(order.order_date) : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="secondary"
                            className={cn(
                                "font-medium",
                                getPaymentStatusColor((order.payment_status as PaymentStatus) ?? null)
                            )}
                        >
                            {paymentStatusLabel}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 p-4 bg-muted/30 rounded-lg border border-border/50">
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Total Tagihan</div>
                        <div className="font-bold text-lg text-primary">{formatCurrency(order.total_amount ?? 0)}</div>
                    </div>
                    <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Tanggal Kirim</div>
                        <div className="font-medium text-sm">{order.delivery_date ? formatDate(order.delivery_date) : '-'}</div>
                    </div>
                    <div className="col-span-2 md:col-span-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Update Status</div>
                        {order['status'] && ORDER_STATUS_CONFIG[order['status']]?.nextStatuses && ORDER_STATUS_CONFIG[order['status']].nextStatuses.length > 0 ? (
                            <Select
                                value={order['status']}
                                onValueChange={(newStatus) => onUpdateStatus(order['id'], newStatus as OrderStatus)}
                            >
                                <SelectTrigger className="w-full h-8 text-sm bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={order['status'] || 'PENDING'} disabled>
                                        {order['status'] ? ORDER_STATUS_LABELS[order['status']] : 'Status Tidak Diketahui'}
                                    </SelectItem>
                                    {ORDER_STATUS_CONFIG[order['status']]?.nextStatuses?.map((status: OrderStatus) => (
                                        <SelectItem key={status} value={status}>
                                            {ORDER_STATUS_LABELS[status]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">Tidak ada aksi tersedia</div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => onView(order)} className="hover:bg-primary/10 hover:text-primary">
                        <Eye className="h-4 w-4 mr-1.5" />
                        Detail
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onEdit(order)}>
                        <Edit className="h-4 w-4 mr-1.5" />
                        Edit
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

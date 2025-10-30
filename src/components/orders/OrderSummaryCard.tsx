// ✅ OPTIMIZED: Memoized to prevent unnecessary re-renders in lists
'use client'

import { memo } from 'react'
import type { OrderWithRelations } from '@/app/orders/types/orders.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Package,
    Calendar,
    Clock,
    User,
    Phone,
    MapPin,
    AlertCircle
} from 'lucide-react'
import type { Order } from './types'
import { getStatusInfo, getPaymentInfo, getPriorityInfo } from './utils'
import { useCurrency } from '@/hooks/useCurrency'

interface OrderSummaryCardProps {
    order: Order
    onClick?: () => void
    showActions?: boolean
}

// ✅ OPTIMIZED: Memoized component
const OrderSummaryCard = memo(({
    order,
    onClick,
    showActions: _showActions = false
}: OrderSummaryCardProps) => {
    const { formatCurrency } = useCurrency()
    const statusInfo = getStatusInfo(order.status)
    const paymentInfo = getPaymentInfo(order.payment_status)
    const priorityInfo = getPriorityInfo(order.priority)

    return (
        <Card
            className={`hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{order.order_no}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at || '').toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                        <Badge className={statusInfo.color}>
                            {statusInfo.label}
                        </Badge>
                        {order.priority === 'high' && (
                            <Badge className={priorityInfo.color} variant="outline">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Prioritas Tinggi
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Customer Info */}
                <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{order.customer_name}</span>
                </div>

                {order.customer_phone && (
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{order.customer_phone}</span>
                    </div>
                )}

                {/* Delivery Info */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                        {new Date(order.delivery_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                        })}
                    </span>
                    {order.delivery_time && (
                        <>
                            <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                            <span>{order.delivery_time}</span>
                        </>
                    )}
                </div>

                {order.customer_address && (
                    <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-wrap-mobile">{order.customer_address}</span>
                    </div>
                )}

                {/* Order Summary */}
                <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>{(order as OrderWithRelations).items?.length || 0} item</span>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-lg">
                                {formatCurrency(order.total_amount || 0)}
                            </div>
                            <Badge className={paymentInfo.color} variant="outline" className="text-xs">
                                {paymentInfo.label}
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}, (prevProps, nextProps) => {
    // Custom comparison - only re-render if order data actually changed
    return (
        prevProps.order.id === nextProps.order.id &&
        prevProps.order.status === nextProps.order.status &&
        prevProps.order.payment_status === nextProps.order.payment_status &&
        prevProps.order.total_amount === nextProps.order.total_amount &&
        prevProps.order.updated_at === nextProps.order.updated_at &&
        prevProps.showActions === nextProps.showActions
    )
})

OrderSummaryCard.displayName = 'OrderSummaryCard'

export default OrderSummaryCard

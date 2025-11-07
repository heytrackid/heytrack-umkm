'use client'

import { BarChart3, Clock, Plus, ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { ORDER_STATUS_CONFIG } from '@/modules/orders/constants'
import { ORDER_STATUS_LABELS } from '@/modules/orders/types'

import type { Order } from '@/app/orders/types/orders.types'



/**
 * Dashboard View Component
 * Overview dashboard with recent orders and charts
 */



interface DashboardViewProps {
    orders: Order[]
    onCreateOrder?: () => void
}

export const DashboardView = ({ orders, onCreateOrder }: DashboardViewProps) => {
    const { formatCurrency } = useCurrency()

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })

    const getStatusColor = (status: string | null) => {
        if (!status) { return 'bg-gray-100 text-gray-800' }
        const _config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG]
        if (!_config) { return 'bg-gray-100 text-gray-800' }
        return _config.color
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Orders */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Pesanan Terbaru
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mb-3" />
                            <h3 className="font-semibold text-lg mb-1">Belum Ada Pesanan</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Mulai buat pesanan pertama Anda
                            </p>
                            {onCreateOrder && (
                                <Button
                                    onClick={onCreateOrder}
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Buat Pesanan
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 5).map((order) => (
                                <div key={order['id']} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{order['order_no']}</div>
                                        <div className="text-sm text-muted-foreground">{order['customer_name'] ?? 'N/A'}</div>
                                        <div className="text-xs text-muted-foreground">{order.order_date ? formatDate(order.order_date) : 'N/A'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(order.total_amount ?? 0)}</div>
                                        <Badge className={`text-xs ${getStatusColor(order['status'])}`}>
                                            {order['status'] ? ORDER_STATUS_LABELS[order['status']] : 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Status Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Distribusi Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => {
                            const count = orders.filter(o => o['status'] === status).length
                            const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0

                            return (
                                <div key={status} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span>{config.label}</span>
                                        <span>{count} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${config.color.replace('text-', 'bg-')}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

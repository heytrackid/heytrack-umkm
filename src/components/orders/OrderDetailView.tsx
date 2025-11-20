'use client'

import {
    ArrowLeft,
    Edit,
    Trash2,
    Phone,
    MapPin,
    Calendar,
    Clock,
    User,
    Package,
    DollarSign,
    FileText,
    AlertCircle,
    Printer,
    Share2
} from '@/components/icons'
import { useState } from 'react'

import type { OrderWithRelations } from '@/app/orders/types/orders.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCurrency } from '@/hooks/useCurrency'

import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline'
import { getStatusInfo, getPaymentInfo, getPriorityInfo } from '@/components/orders/utils'

import type { Order, OrderStatus, PaymentStatus, Priority } from '@/components/orders/types'

interface OrderDetailViewProps {
    order: Order
    onEdit: () => void
    onDelete: () => void
    onBack: () => void
    onUpdateStatus: (status: OrderStatus) => void
}

export const OrderDetailView = ({
    order,
    onEdit,
    onDelete,
    onBack,
    onUpdateStatus
}: OrderDetailViewProps) => {
    const { formatCurrency } = useCurrency()
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete()
        } else {
            setShowDeleteConfirm(true)
            setTimeout(() => setShowDeleteConfirm(false), 3000)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    const handleShare = async () => {
        const shareData = {
            title: `Pesanan ${order['order_no']}`,
            text: `Detail pesanan untuk ${order['customer_name']}`,
            url: window.location.href
        }

        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch {
                // User cancelled or error occurred
            }
        }
    }

    const statusInfo = getStatusInfo(order['status'] ?? 'PENDING')
    const paymentInfo = getPaymentInfo((order.payment_status ?? 'UNPAID') as PaymentStatus)
    const priorityInfo = getPriorityInfo((order.priority ?? 'normal') as Priority)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className={`font-bold ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                            {order['order_no']}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Dibuat {new Date(order.created_at ?? '').toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {!isMobile && (
                        <>
                            <Button variant="outline" size="sm" onClick={handlePrint}>
                                <Printer className="h-4 w-4 mr-2" />
                                Cetak
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleShare}>
                                <Share2 className="h-4 w-4 mr-2" />
                                Bagikan
                            </Button>
                        </>
                    )}
                    <Button variant="default" size="sm" onClick={onEdit}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button
                        variant={showDeleteConfirm ? "destructive" : "outline"}
                        size="sm"
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {showDeleteConfirm ? 'Konfirmasi?' : 'Hapus'}
                    </Button>
                </div>
            </div>

            {/* Status Cards */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${statusInfo.color} bg-opacity-10`}>
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status Pesanan</p>
                                <Badge className={statusInfo.color}>
                                    {statusInfo.label}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${paymentInfo.color} bg-opacity-10`}>
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status Pembayaran</p>
                                <Badge className={paymentInfo.color}>
                                    {paymentInfo.label}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-full ${priorityInfo.color} bg-opacity-10`}>
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Prioritas</p>
                                <Badge className={priorityInfo.color}>
                                    {priorityInfo.label}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Status Timeline */}
            <OrderStatusTimeline
                currentStatus={order['status'] ?? 'PENDING'}
                onStatusChange={onUpdateStatus}
            />

            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Pelanggan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Nama</p>
                                    <p className="font-medium">{order['customer_name']}</p>
                                </div>
                            </div>

                            {order.customer_phone && (
                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Telepon</p>
                                        <a
                                            href={`tel:${order.customer_phone}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {order.customer_phone}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Email field removed - not in database schema */}

                            {order.customer_address && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Alamat Pengiriman</p>
                                        <p className="font-medium">{order.customer_address}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Informasi Pengiriman
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Tanggal Pengiriman</p>
                                    <p className="font-medium">
                                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        }) : 'No date set'}
                                    </p>
                                </div>
                            </div>

                            {order.delivery_time && (
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Waktu Pengiriman</p>
                                        <p className="font-medium">{order.delivery_time}</p>
                                    </div>
                                </div>
                            )}

                            {order.notes && (
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Catatan</p>
                                        <p className="font-medium">{order.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Order Items */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Item Pesanan ({(order as OrderWithRelations).items?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {(order as OrderWithRelations).items?.map(item => (
                            <div key={item['id']} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium">{item.product_name}</h4>
                                                {item.special_requests && (
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {item.special_requests}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant="outline" className="ml-2">
                                                {item.quantity}x
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">
                                            {formatCurrency(item.unit_price)} / item
                                        </p>
                                        <p className="font-bold">
                                            {formatCurrency(item.unit_price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Separator className="my-4" />

                        {/* Total */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-lg">
                                <span className="font-medium">Subtotal</span>
                                <span className="font-medium">
                                    {formatCurrency(order.total_amount ?? 0)}
                                </span>
                            </div>
                            <div className="flex justify-between text-2xl font-bold">
                                <span>Total</span>
                                <span className="text-primary">
                                    {formatCurrency(order.total_amount ?? 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions for Mobile */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <div className="flex gap-2">
                        <Button variant="outline" size="lg" onClick={handlePrint} className="flex-1">
                            <Printer className="h-4 w-4 mr-2" />
                            Cetak
                        </Button>
                        <Button variant="outline" size="lg" onClick={handleShare} className="flex-1">
                            <Share2 className="h-4 w-4 mr-2" />
                            Bagikan
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}


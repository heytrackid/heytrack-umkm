'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Clock, Package, Truck, XCircle } from 'lucide-react'
import type { OrderStatus } from './types'
import { useResponsive } from '@/hooks/useResponsive'



interface OrderStatusTimelineProps {
    currentStatus: OrderStatus
    onStatusChange?: (status: OrderStatus) => void
}

const statusFlow: Array<{
    status: OrderStatus
    label: string
    icon: React.ReactNode
    description: string
}> = [
        {
            status: 'PENDING',
            label: 'Menunggu',
            icon: <Clock className="h-5 w-5" />,
            description: 'Pesanan baru masuk'
        },
        {
            status: 'CONFIRMED',
            label: 'Dikonfirmasi',
            icon: <CheckCircle2 className="h-5 w-5" />,
            description: 'Pesanan dikonfirmasi'
        },
        {
            status: 'IN_PROGRESS',
            label: 'Dalam Proses',
            icon: <Package className="h-5 w-5" />,
            description: 'Sedang diproduksi'
        },
        {
            status: 'READY',
            label: 'Siap',
            icon: <CheckCircle2 className="h-5 w-5" />,
            description: 'Siap untuk dikirim'
        },
        {
            status: 'DELIVERED',
            label: 'Terkirim',
            icon: <Truck className="h-5 w-5" />,
            description: 'Pesanan terkirim'
        }
    ]

const OrderStatusTimeline = ({
    currentStatus,
    onStatusChange
}: OrderStatusTimelineProps) => {
    const { isMobile } = useResponsive()

    const currentIndex = statusFlow.findIndex(s => s.status === currentStatus)
    const isCancelled = currentStatus === 'CANCELLED'

    const getStatusColor = (index: number) => {
        if (isCancelled) { return 'text-destructive' }
        if (index < currentIndex) { return 'text-foreground' }
        if (index === currentIndex) { return 'text-primary' }
        return 'text-muted-foreground'
    }

    const getLineColor = (index: number) => {
        if (isCancelled) { return 'bg-destructive/20' }
        if (index < currentIndex) { return 'bg-border' }
        return 'bg-border'
    }

    const handleStatusClick = (status: OrderStatus) => {
        if (onStatusChange && !isCancelled) {
            onStatusChange(status)
        }
    }

    if (isMobile) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Status Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {isCancelled ? (
                            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                                <XCircle className="h-6 w-6 text-red-500" />
                                <div>
                                    <p className="font-medium text-red-700">Pesanan Dibatalkan</p>
                                    <p className="text-sm text-red-600">Pesanan ini telah dibatalkan</p>
                                </div>
                            </div>
                        ) : (
                            statusFlow.map((step, index) => {
                                const isActive = index === currentIndex
                                const isCompleted = index < currentIndex
                                const isClickable = onStatusChange && index <= currentIndex + 1

                                return (
                                    <div key={step.status} className="relative">
                                        <div
                                            className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${isActive
                                                ? 'border-primary bg-primary/5'
                                                : isCompleted
                                                    ? 'border-border bg-muted'
                                                    : 'border-gray-200'
                                                } ${isClickable ? 'cursor-pointer hover:border-primary' : ''}`}
                                            onClick={() => isClickable && handleStatusClick(step.status)}
                                        >
                                            <div className={`mt-0.5 ${getStatusColor(index)}`}>
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-6 w-6" />
                                                ) : (
                                                    step.icon
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {step.description}
                                                </p>
                                            </div>
                                            {isActive && (
                                                <div className="flex items-center">
                                                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                        {index < statusFlow.length - 1 && (
                                            <div className="ml-6 h-8 w-0.5 bg-gray-200" />
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {onStatusChange && !isCancelled && (
                        <div className="mt-4 pt-4 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusClick('CANCELLED')}
                                className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Batalkan Pesanan
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    // Desktop view
    return (
        <Card>
            <CardHeader>
                <CardTitle>Timeline Status</CardTitle>
            </CardHeader>
            <CardContent>
                {isCancelled ? (
                    <div className="flex items-center justify-center gap-3 p-6 bg-red-50 rounded-lg border border-red-200">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="font-medium text-red-700 text-lg">Pesanan Dibatalkan</p>
                            <p className="text-sm text-red-600">Pesanan ini telah dibatalkan</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div className="flex justify-between items-start">
                            {statusFlow.map((step, index) => {
                                const isActive = index === currentIndex
                                const isCompleted = index < currentIndex
                                const isClickable = onStatusChange && index <= currentIndex + 1

                                return (
                                    <div key={step.status} className="flex-1 relative">
                                        <div className="flex flex-col items-center">
                                            {/* Icon */}
                                            <button
                                                onClick={() => isClickable && handleStatusClick(step.status)}
                                                disabled={!isClickable}
                                                className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${isActive
                                                    ? 'border-primary bg-primary text-white scale-110'
                                                    : isCompleted
                                                        ? 'border-foreground bg-foreground text-background'
                                                        : 'border-gray-300 bg-white text-gray-400'
                                                    } ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle2 className="h-6 w-6" />
                                                ) : (
                                                    step.icon
                                                )}
                                            </button>

                                            {/* Label */}
                                            <div className="mt-3 text-center">
                                                <p className={`font-medium text-sm ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                    {step.label}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Connecting Line */}
                                        {index < statusFlow.length - 1 && (
                                            <div
                                                className={`absolute top-6 left-1/2 w-full h-0.5 ${getLineColor(index)}`}
                                                style={{ transform: 'translateY(-50%)' }}
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {onStatusChange && (
                            <div className="mt-6 pt-6 border-t flex justify-center">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleStatusClick('CANCELLED')}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Batalkan Pesanan
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default OrderStatusTimeline

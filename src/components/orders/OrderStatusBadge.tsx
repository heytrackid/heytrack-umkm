'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Clock,
    CheckCircle,
    Loader2,
    Package,
    XCircle,
    Truck
} from 'lucide-react'
import { cn } from '@/lib/utils'

type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'completed' | 'cancelled' | 'delivered'

interface OrderStatusBadgeProps {
    status: OrderStatus
    showNextAction?: boolean
    onNextAction?: () => void
    compact?: boolean
    className?: string
}

const statusConfig = {
    pending: {
        label: 'Menunggu Konfirmasi',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        nextAction: 'Konfirmasi Order',
        nextActionVariant: 'default' as const,
        description: 'Order baru masuk, perlu dikonfirmasi'
    },
    confirmed: {
        label: 'Siap Produksi',
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800 border-blue-300',
        nextAction: 'Mulai Produksi',
        nextActionVariant: 'default' as const,
        description: 'Order sudah dikonfirmasi, siap diproduksi'
    },
    in_production: {
        label: 'Sedang Diproduksi',
        icon: Loader2,
        color: 'bg-purple-100 text-purple-800 border-purple-300',
        nextAction: 'Tandai Selesai',
        nextActionVariant: 'default' as const,
        description: 'Sedang dalam proses produksi',
        animate: true
    },
    completed: {
        label: 'Selesai',
        icon: Package,
        color: 'bg-green-100 text-green-800 border-green-300',
        nextAction: 'Kirim ke Customer',
        nextActionVariant: 'outline' as const,
        description: 'Produksi selesai, siap dikirim'
    },
    delivered: {
        label: 'Terkirim',
        icon: Truck,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        nextAction: null,
        description: 'Order sudah diterima customer'
    },
    cancelled: {
        label: 'Dibatalkan',
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-300',
        nextAction: null,
        description: 'Order dibatalkan'
    }
}

export const OrderStatusBadge = ({
    status,
    showNextAction = false,
    onNextAction,
    compact = false,
    className
}: OrderStatusBadgeProps) => {
    const config = statusConfig[status]
    const Icon = config.icon

    if (compact) {
        return (
            <Badge
                variant="outline"
                className={cn(config.color, 'font-medium', className)}
            >
                <Icon className={cn(
                    'w-3 h-3 mr-1',
                    config.animate && 'animate-spin'
                )} />
                {config.label}
            </Badge>
        )
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center gap-2">
                <Badge
                    variant="outline"
                    className={cn(config.color, 'font-medium px-3 py-1')}
                >
                    <Icon className={cn(
                        'w-4 h-4 mr-2',
                        config.animate && 'animate-spin'
                    )} />
                    {config.label}
                </Badge>

                {config.nextAction && showNextAction && onNextAction && (
                    <Button
                        size="sm"
                        variant={config.nextActionVariant}
                        onClick={onNextAction}
                        className="h-7"
                    >
                        {config.nextAction}
                    </Button>
                )}
            </div>

            {!compact && (
                <p className="text-xs text-muted-foreground">
                    {config.description}
                </p>
            )}
        </div>
    )
}

// Progress indicator component
interface OrderProgressProps {
    currentStatus: OrderStatus
    className?: string
}

export const OrderProgress = ({ currentStatus, className }: OrderProgressProps) => {
    const steps = [
        { status: 'pending', label: 'Order' },
        { status: 'confirmed', label: 'Konfirmasi' },
        { status: 'in_production', label: 'Produksi' },
        { status: 'completed', label: 'Selesai' }
    ]

    const currentIndex = steps.findIndex(s => s.status === currentStatus)
    const isCancelled = currentStatus === 'cancelled'

    if (isCancelled) {
        return (
            <div className={cn('flex items-center gap-2 text-red-600', className)}>
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Order Dibatalkan</span>
            </div>
        )
    }

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {steps.map((step, index) => {
                const isCompleted = index <= currentIndex
                const isCurrent = index === currentIndex

                return (
                    <div key={step.status} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors',
                                isCompleted
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'bg-gray-100 border-gray-300 text-gray-400',
                                isCurrent && 'ring-2 ring-green-200'
                            )}>
                                {isCompleted ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-current" />
                                )}
                            </div>
                            <span className={cn(
                                'text-xs mt-1 font-medium',
                                isCompleted ? 'text-green-600' : 'text-gray-400'
                            )}>
                                {step.label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={cn(
                                'w-12 h-0.5 mx-2 transition-colors',
                                index < currentIndex ? 'bg-green-500' : 'bg-gray-300'
                            )} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// Status change confirmation dialog helper
export function getStatusChangeConfirmation(fromStatus: OrderStatus, toStatus: OrderStatus) {
    const confirmations: Record<string, { title: string; description: string; action: string }> = {
        'pending-confirmed': {
            title: 'Konfirmasi Order?',
            description: 'Order akan dikonfirmasi dan stok bahan akan dikurangi otomatis.',
            action: 'Ya, Konfirmasi'
        },
        'confirmed-in_production': {
            title: 'Mulai Produksi?',
            description: 'Tandai order ini sedang dalam proses produksi.',
            action: 'Ya, Mulai Produksi'
        },
        'in_production-completed': {
            title: 'Tandai Selesai?',
            description: 'Produksi selesai dan produk siap dikirim ke customer.',
            action: 'Ya, Tandai Selesai'
        },
        'completed-delivered': {
            title: 'Tandai Terkirim?',
            description: 'Produk sudah diterima oleh customer.',
            action: 'Ya, Sudah Terkirim'
        }
    }

    return confirmations[`${fromStatus}-${toStatus}`] || {
        title: 'Ubah Status?',
        description: 'Apakah Anda yakin ingin mengubah status order ini?',
        action: 'Ya, Ubah Status'
    }
}

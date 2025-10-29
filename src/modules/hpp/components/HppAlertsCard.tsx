'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Bell, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import type { HppAlertWithRecipe } from '@/modules/hpp/types'

interface HppAlertsCardProps {
    alerts: HppAlertWithRecipe[]
    onMarkAsRead: (alertId: string) => void
}

export const HppAlertsCard = ({ alerts, onMarkAsRead }: HppAlertsCardProps) => {
    const router = useRouter()
    const { toast } = useToast()

    const handleMarkAllRead = async () => {
        try {
            await fetch('/api/hpp/alerts/bulk-read', { method: 'POST' })
            toast({
                title: 'Berhasil',
                description: 'Semua peringatan ditandai sudah dibaca'
            })
            window.location.reload()
        } catch {
            toast({
                title: 'Error',
                description: 'Gagal menandai peringatan',
                variant: 'destructive'
            })
        }
    }

    const alertTypeConfig = {
        price_increase: {
            icon: TrendingUp,
            color: 'orange',
            bgClass: 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30',
            iconClass: 'text-orange-600',
            label: 'Harga Naik'
        },
        margin_decrease: {
            icon: TrendingDown,
            color: 'red',
            bgClass: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
            iconClass: 'text-red-600',
            label: 'Margin Turun'
        },
        low_stock: {
            icon: AlertTriangle,
            color: 'yellow',
            bgClass: 'bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
            iconClass: 'text-yellow-600',
            label: 'Stok Rendah'
        }
    }

    return (
        <Card className={alerts.length > 0 ? 'border-orange-200 dark:border-orange-800' : ''}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                Peringatan & Notifikasi
                                {alerts.length > 0 && (
                                    <Badge variant="destructive" className="animate-pulse">
                                        {alerts.length} Baru
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                {alerts.length > 0
                                    ? 'Perhatian diperlukan untuk beberapa produk'
                                    : 'Semua produk dalam kondisi baik'
                                }
                            </p>
                        </div>
                    </CardTitle>
                    {alerts.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                        >
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.length > 0 ? (
                        <>
                            {alerts.map((alert) => {
                                const typeKey = (alert.alert_type ?? 'price_increase') as keyof typeof alertTypeConfig
                                const config = alertTypeConfig[typeKey] || alertTypeConfig.price_increase
                                const AlertIcon = config.icon
                                const createdAt = alert.created_at ? new Date(alert.created_at) : null
                                const alertId = alert.id ?? ''

                                return (
                                    <div
                                        key={alertId}
                                        className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer transition-all border ${config.bgClass}`}
                                        onClick={() => {
                                            if (alertId) {
                                                onMarkAsRead(alertId)
                                            }
                                        }}
                                    >
                                        <div className={`w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-shrink-0 ${config.iconClass}`}>
                                            <AlertIcon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="font-semibold">{alert.recipe_name ?? 'Produk Tidak Diketahui'}</div>
                                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                                    {config.label}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground mb-2">
                                                {alert.message ?? 'Tidak ada detail tambahan.'}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span>
                                                    {createdAt
                                                        ? formatDistanceToNow(createdAt, {
                                                            addSuffix: true,
                                                            locale: idLocale
                                                        })
                                                        : 'Waktu tidak diketahui'}
                                                </span>
                                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                    Klik untuk tandai dibaca →
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* View All Link */}
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/hpp/alerts')}
                            >
                                Lihat Semua Peringatan
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Semua Aman! 👍</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Tidak ada peringatan. Semua produk dalam kondisi baik.
                            </p>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg max-w-md mx-auto">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    <strong>✓ Sistem monitoring aktif</strong><br />
                                    Anda akan mendapat notifikasi otomatis jika ada perubahan harga bahan atau margin menurun.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

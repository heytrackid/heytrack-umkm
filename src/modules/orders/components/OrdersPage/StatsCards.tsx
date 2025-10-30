/**
 * Stats Cards Component
 * Displays order statistics overview
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { BarChart3, Clock, DollarSign, ShoppingCart } from 'lucide-react'

interface OrderStats {
    total_orders: number
    total_revenue: number
    average_order_value: number
    pending_revenue: number
    order_growth: number
    revenue_growth: number
}

interface StatsCardsProps {
    stats: OrderStats
}

export function StatsCards({ stats }: StatsCardsProps) {
    const { formatCurrency } = useCurrency()

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
                            <p className="text-2xl font-bold">{stats.total_orders}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {stats.order_growth}% dari periode sebelumnya
                            </p>
                        </div>
                        <ShoppingCart className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {stats.revenue_growth}% dari periode sebelumnya
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</p>
                            <p className="text-xs text-muted-foreground mt-1">per pesanan</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Pendapatan Tertunda</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.pending_revenue)}</p>
                            <p className="text-xs text-muted-foreground mt-1">belum dibayar</p>
                        </div>
                        <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

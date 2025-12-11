'use client'

import { BarChart3, Clock, DollarSign, ShoppingCart } from '@/components/icons'
import { m, type Variants } from 'framer-motion'

import { Card, CardContent } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { cn } from '@/lib/utils'

/**
 * Stats Cards Component
 * Displays order statistics overview
 */

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

const containerVariants: Variants = {
    hidden: { opacity: 1 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.04
        }
    }
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
    }
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
    const { formatCurrency } = useCurrency()

    return (
        <m.div
            className="grid gap-4 md:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <m.div variants={cardVariants}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Pesanan</p>
                                <p className="text-2xl font-bold tracking-tight">{stats.total_orders}</p>
                                <div className="flex items-center text-xs">
                                    <span className={cn(
                                        "font-medium px-1.5 py-0.5 rounded-full",
                                        stats.order_growth >= 0 
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                    )}>
                                        {stats.order_growth > 0 ? '+' : ''}{stats.order_growth}%
                                    </span>
                                    <span className="text-muted-foreground ml-2">dari periode lalu</span>
                                </div>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                                <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </m.div>

            <m.div variants={cardVariants}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Pendapatan</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.total_revenue)}</p>
                                <div className="flex items-center text-xs">
                                    <span className={cn(
                                        "font-medium px-1.5 py-0.5 rounded-full",
                                        stats.revenue_growth >= 0 
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                    )}>
                                        {stats.revenue_growth > 0 ? '+' : ''}{stats.revenue_growth}%
                                    </span>
                                    <span className="text-muted-foreground ml-2">dari periode lalu</span>
                                </div>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20">
                                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </m.div>

            <m.div variants={cardVariants}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Rata-rata Nilai</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.average_order_value)}</p>
                                <p className="text-xs text-muted-foreground">per pesanan</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-xl border border-violet-100/50 dark:border-violet-900/20">
                                <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </m.div>

            <m.div variants={cardVariants}>
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Pendapatan Tertunda</p>
                                <p className="text-2xl font-bold tracking-tight">{formatCurrency(stats.pending_revenue)}</p>
                                <p className="text-xs text-muted-foreground">belum dibayar</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-100/50 dark:border-amber-900/20">
                                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </m.div>
        </m.div>
    )
}

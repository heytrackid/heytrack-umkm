'use client'

import { AlertCircle, Clock, Package, TrendingUp } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardSchedule } from '@/hooks/useDashboardSchedule'






export const ProductionScheduleWidget = () => {
    const { data, isLoading, error } = useDashboardSchedule()

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Production Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today&apos;s Production Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className = "flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">Failed to load production schedule</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { production_schedule, pending_orders, low_stock_alerts, summary } = data ?? {}

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Summary Cards */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Batches Today</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.total_batches_today ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {summary?.planned_batches ?? 0} planned, {summary?.in_progress_batches ?? 0} in progress
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{summary?.pending_orders_count ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {summary?.urgent_orders ?? 0} urgent
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{low_stock_alerts?.length ?? 0}</div>
                    <p className="text-xs text-muted-foreground">
                        {summary?.critical_stock_items ?? 0} critical
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {summary?.total_batches_today
                            ? Math.round((summary.completed_batches / summary.total_batches_today) * 100)
                            : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {summary?.completed_batches ?? 0} of {summary?.total_batches_today ?? 0} completed
                    </p>
                </CardContent>
            </Card>

            {/* Production Schedule */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Production Batches</CardTitle>
                </CardHeader>
                <CardContent>
                    {production_schedule && production_schedule.length > 0 ? (
                        <div className="space-y-4">
                            {production_schedule.map((batch) => {
                                const getBadgeVariant = () => {
                                    if (batch.batch_status === 'COMPLETED') {return 'default'}
                                    if (batch.batch_status === 'IN_PROGRESS') {return 'secondary'}
                                    return 'outline'
                                }
                                
                                return (
                                <div key={batch['id']} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="flex-1">
                                        <p className="font-medium">{batch.recipe.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {batch.quantity} units • {batch.total_orders} orders
                                        </p>
                                    </div>
                                    <Badge variant={getBadgeVariant()}>
                                        {batch.batch_status}
                                    </Badge>
                                </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No production batches scheduled for today</p>
                    )}
                </CardContent>
            </Card>

            {/* Pending Orders */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Orders Needing Production</CardTitle>
                </CardHeader>
                <CardContent>
                    {pending_orders && pending_orders.length > 0 ? (
                        <div className="space-y-4">
                            {pending_orders.slice(0, 5).map((order) => (
                                <div key={order['id']} className="flex items-center justify-between border-b pb-3 last:border-0">
                                    <div className="flex-1">
                                        <p className="font-medium">{order['order_no']}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {order['customer_name'] ?? 'No customer'} • {order.delivery_date ?? 'No date'}
                                        </p>
                                    </div>
                                    {order.production_priority === 'URGENT' && (
                                        <Badge variant="destructive">URGENT</Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">All orders have production batches assigned</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
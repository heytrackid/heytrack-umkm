'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



/**
 * Status Summary Component
 * Shows order status distribution
 */



interface StatusSummaryProps {
    stats: {
        pending_orders: number
        confirmed_orders: number
        in_production_orders: number
        completed_orders: number
        cancelled_orders: number
        total_customers: number
    }
}

export const StatusSummary = ({ stats }: StatusSummaryProps) => (
        <Card>
            <CardHeader>
                <CardTitle>Status Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.pending_orders}</div>
                        <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.confirmed_orders}</div>
                        <div className="text-xs text-muted-foreground">Confirmed</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.in_production_orders}</div>
                        <div className="text-xs text-muted-foreground">Produksi</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.completed_orders}</div>
                        <div className="text-xs text-muted-foreground">Selesai</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.cancelled_orders}</div>
                        <div className="text-xs text-muted-foreground">Batal</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{stats.total_customers}</div>
                        <div className="text-xs text-muted-foreground">Pelanggan</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

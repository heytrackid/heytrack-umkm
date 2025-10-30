/**
 * Order Filters Component
 * Search and filter controls
 */

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Search, XCircle } from 'lucide-react'
import type { OrderStatus } from '@/app/orders/types/orders.types'
import { ORDER_STATUS_CONFIG } from '@/modules/orders/constants'

interface OrderFilters {
    status: OrderStatus[]
    payment_status: string[]
    date_from: string
    date_to: string
    customer_search?: string
}

interface OrderFiltersProps {
    filters: OrderFilters
    totalOrders: number
    filteredCount: number
    onFilterChange: (filters: OrderFilters) => void
    onClearFilters: () => void
}

export function OrderFilters({
    filters,
    totalOrders,
    filteredCount,
    onFilterChange,
    onClearFilters
}: OrderFiltersProps) {
    const hasActiveFilters = filters.status?.length > 0 || filters.customer_search

    return (
        <Card className="mb-6">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama pelanggan atau nomor pesanan..."
                                    value={filters.customer_search || ''}
                                    onChange={(e) => onFilterChange({ ...filters, customer_search: e.target.value })}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        <Select
                            value={filters.status?.join(',') || 'all'}
                            onValueChange={(value) => {
                                onFilterChange({
                                    ...filters,
                                    status: value === 'all' ? [] : [value as OrderStatus]
                                })
                            }}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                                    <SelectItem key={status} value={status}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Filter Lainnya
                        </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                            Menampilkan <span className="font-semibold text-foreground">{filteredCount}</span> pesanan
                            {hasActiveFilters && (
                                <span> (dari total {totalOrders} pesanan)</span>
                            )}
                        </div>
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearFilters}
                                className="h-8"
                            >
                                <XCircle className="h-3 w-3 mr-1" />
                                Hapus Filter
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

'use client'

import { Filter, Search, XCircle } from '@/components/icons'

import type { OrderStatus } from '@/app/orders/types/orders.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ORDER_STATUS_CONFIG } from '@/modules/orders/constants'





/**
 * Order Filters Component
 * Search and filter controls
 */



interface OrderFiltersInterface {
    status: OrderStatus[]
    payment_status: string[]
    customer_search?: string
}

interface OrderFiltersProps {
    filters: OrderFiltersInterface
    totalOrders: number
    filteredCount: number
    onFilterChange: (filters: OrderFiltersInterface) => void
    onClearFilters: () => void
}

export const OrderFilters = ({
    filters,
    totalOrders,
    filteredCount,
    onFilterChange,
    onClearFilters
}: OrderFiltersProps) => {
    const hasActiveFilters = filters['status']?.length > 0 || filters.customer_search

    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama pelanggan atau nomor pesanan..."
                        value={filters.customer_search ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onFilterChange({ ...filters, customer_search: e.target.value })}
                        className="pl-9 bg-background"
                    />
                </div>

                <Select
                    value={filters['status']?.join(',') || 'all'}
                    onValueChange={(value) => {
                        onFilterChange({
                            ...filters,
                            status: value === 'all' ? [] : [value as OrderStatus]
                        })
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[200px] bg-background">
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

                <Button variant="outline" className="bg-background">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                </Button>
            </div>

            <div className="flex items-center justify-between text-sm px-1">
                <div className="text-muted-foreground">
                    Menampilkan <span className="font-medium text-foreground">{filteredCount}</span> dari <span className="font-medium text-foreground">{totalOrders}</span> pesanan
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-8 text-muted-foreground hover:text-foreground"
                    >
                        <XCircle className="h-3 w-3 mr-1.5" />
                        Hapus Filter
                    </Button>
                )}
            </div>
        </div>
    )
}

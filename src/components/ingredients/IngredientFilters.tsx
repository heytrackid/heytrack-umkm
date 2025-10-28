'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StockFilter = 'all' | 'low' | 'out' | 'normal'
export type SortOption = 'name' | 'stock' | 'price' | 'updated'

interface IngredientFiltersProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    stockFilter: StockFilter
    onStockFilterChange: (value: StockFilter) => void
    sortBy: SortOption
    onSortChange: (value: SortOption) => void
    sortOrder: 'asc' | 'desc'
    onSortOrderChange: (value: 'asc' | 'desc') => void
    totalCount: number
    filteredCount: number
    onReset?: () => void
}

/**
 * Enhanced Ingredient Filters
 * 
 * Features:
 * - Quick segment chips for stock status
 * - Advanced filter popover
 * - Sort options
 * - Active filter indicators
 * - Reset functionality
 */
export const IngredientFilters = ({
    searchTerm,
    onSearchChange,
    stockFilter,
    onStockFilterChange,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    totalCount,
    filteredCount,
    onReset
}: IngredientFiltersProps) => {
    const [showAdvanced, setShowAdvanced] = useState(false)

    const stockSegments: Array<{ value: StockFilter; label: string; icon?: string }> = [
        { value: 'all', label: 'Semua', icon: '📦' },
        { value: 'low', label: 'Stok Rendah', icon: '⚠️' },
        { value: 'out', label: 'Habis', icon: '❌' },
        { value: 'normal', label: 'Normal', icon: '✅' }
    ]

    const sortOptions = [
        { value: 'name', label: 'Nama' },
        { value: 'stock', label: 'Stok' },
        { value: 'price', label: 'Harga' },
        { value: 'updated', label: 'Terakhir Diubah' }
    ]

    const hasActiveFilters = stockFilter !== 'all' || searchTerm !== '' || sortBy !== 'name'

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama bahan baku..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-10"
                    />
                    {searchTerm && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => onSearchChange('')}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Advanced Filters Button */}
                <Popover open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="relative">
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filter & Sort
                            {hasActiveFilters && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                >
                                    !
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-3">Urutkan</h4>
                                <div className="flex gap-2">
                                    <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortOption)}>
                                        <SelectTrigger className="flex-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sortOptions.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </Button>
                                </div>
                            </div>

                            {hasActiveFilters && onReset && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onReset()
                                        setShowAdvanced(false)
                                    }}
                                    className="w-full"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reset Filter
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Quick Segment Chips */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {stockSegments.map(segment => (
                    <Button
                        key={segment.value}
                        variant={stockFilter === segment.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onStockFilterChange(segment.value)}
                        className={cn(
                            'transition-all',
                            stockFilter === segment.value && 'shadow-md'
                        )}
                    >
                        {segment.icon && <span className="mr-1.5">{segment.icon}</span>}
                        {segment.label}
                    </Button>
                ))}
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                    Menampilkan {filteredCount} dari {totalCount} bahan baku
                </span>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="h-auto p-0 text-blue-600 hover:text-blue-700"
                    >
                        Reset semua filter
                    </Button>
                )}
            </div>
        </div>
    )
}

'use client'
 


import { Edit, Filter, MoreVertical, Plus, Search, Trash2, X } from '@/components/icons'

import { memo, useCallback, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { FilterBadges, createFilterBadges } from '@/components/ui/filter-badges'
import { DeleteModal } from '@/components/ui/index'
import { undoableToast } from '@/components/ui/toast'

import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ServerPagination } from '@/components/ui/server-pagination'
import { useSettings } from '@/contexts/settings-context'
import { useDeleteIngredient, useIngredients } from '@/hooks/useIngredients'
import { useResponsive } from '@/hooks/useResponsive'
import { handleError } from '@/lib/error-handling'
import { toast } from 'sonner'

import type { Row } from '@/types/database'

import { IngredientFormDialog } from '@/components/ingredients/IngredientFormDialog'
import { MobileIngredientList } from '@/components/ingredients/MobileIngredientCard'
import { StockBadge } from '@/components/ingredients/StockBadge'



type Ingredient = Row<'ingredients'>
type StockFilter = 'all' | 'low' | 'normal' | 'out'
type CategoryFilter = 'all' | 'Bahan Basah' | 'Bahan Kering' | 'Buah' | 'Bumbu' | 'Dairy' | 'Kemasan' | 'Lainnya' | 'Protein' | 'Sayuran'

interface IngredientsListProps {
    onAdd?: () => void
}

const IngredientsListComponent = ({ onAdd }: IngredientsListProps = {}) => {
    const { formatCurrency } = useSettings()
    const deleteIngredient = useDeleteIngredient()

    const { isMobile } = useResponsive()

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
    const [showFormDialog, setShowFormDialog] = useState(false)
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined)

    // Filter and pagination states
    const [searchTerm, setSearchTerm] = useState('')
    const [stockFilter, setStockFilter] = useState<StockFilter>('all')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
    const [supplierFilter, setSupplierFilter] = useState('all')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)

    // Fetch ingredients with pagination
    const { data: ingredientsResponse, isLoading } = useIngredients({
      page,
      limit,
      search: searchTerm.trim() || undefined
    })

    // Extract data and pagination from response
    const ingredients = useMemo(() => ingredientsResponse?.data || [], [ingredientsResponse?.data])
    const pagination = ingredientsResponse?.pagination

    // Get unique suppliers
    const suppliers = useMemo(() => {
        if (!ingredients) return ['all']
        const unique = Array.from(new Set(ingredients.map((i: Ingredient) => i.supplier).filter((s: string | null) => s && s.trim()))) as string[]
        return ['all', ...unique]
    }, [ingredients])

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!ingredients) { return [] }

        return ingredients.filter((item: Ingredient) => {
            // Search filter
            const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())

            // Stock filter
            let matchesStock = true
            const currentStock = item.current_stock ?? 0
            const minStock = item.min_stock ?? 0

            if (stockFilter === 'low') {
                matchesStock = currentStock > 0 && currentStock <= minStock
            } else if (stockFilter === 'out') {
                matchesStock = currentStock <= 0
            } else if (stockFilter === 'normal') {
                matchesStock = currentStock > minStock
            }

            // Category filter
            const matchesCategory = categoryFilter === 'all' ||
                (item.category ?? 'Lainnya') === categoryFilter

            // Supplier filter
            const matchesSupplier = supplierFilter === 'all' ||
                (item.supplier ?? '') === supplierFilter

            return matchesSearch && matchesStock && matchesCategory && matchesSupplier
        }).sort((a: Ingredient, b: Ingredient) => a.name.localeCompare(b.name))
    }, [ingredients, searchTerm, stockFilter, categoryFilter, supplierFilter])

    // Handle pagination changes
    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage)
    }, [])

    const handlePageSizeChange = useCallback((newLimit: number) => {
        setLimit(newLimit)
        setPage(1) // Reset to first page when changing page size
    }, [])

    // Create filter badges
    const activeFilters = createFilterBadges(
        {
            search: searchTerm,
            stock: stockFilter,
            category: categoryFilter,
            supplier: supplierFilter
        },
        {
            search: 'Search',
            stock: 'Stock',
            category: 'Category',
            supplier: 'Supplier'
        },
        (newFilters) => {
            if (newFilters.search !== undefined) {
                setSearchTerm(newFilters.search)
            }
            if (newFilters.stock !== undefined) {
                setStockFilter(newFilters.stock as StockFilter)
            }
            if (newFilters.category !== undefined) {
                setCategoryFilter(newFilters.category as CategoryFilter)
            }
            if (newFilters.supplier !== undefined) {
                setSupplierFilter(newFilters.supplier)
            }
        }
    )

    const handleClearAllFilters = useCallback(() => {
        setSearchTerm('')
        setStockFilter('all')
        setCategoryFilter('all')
        setSupplierFilter('all')
    }, [])

    // Handlers
    const handleEdit = useCallback((ingredient: Ingredient) => {
        setEditingIngredient(ingredient)
        setShowFormDialog(true)
    }, [])

    const handleAdd = useCallback(() => {
        if (onAdd) {
            onAdd()
        } else {
            setEditingIngredient(undefined)
            setShowFormDialog(true)
        }
    }, [onAdd])

    const handleDelete = useCallback((ingredient: Ingredient) => {
        setSelectedIngredient(ingredient)
        setIsDeleteDialogOpen(true)
    }, [])



    const handleConfirmDelete = useCallback(async () => {
        if (!selectedIngredient) { return }

        try {
            await deleteIngredient.mutateAsync(selectedIngredient['id'])

            // Enhanced toast with undo functionality
            undoableToast({
                title: `${selectedIngredient.name} dihapus`,
                description: 'Bahan baku telah dihapus dari sistem',
                onUndo: () => {
                    // Note: Would need an undelete API endpoint for real undo
                    toast('Fitur undo sedang dikembangkan - Anda bisa menambahkan kembali bahan baku ini')
                },
                duration: 6000
            })

            setIsDeleteDialogOpen(false)
            setSelectedIngredient(null)
        } catch (error) {
            handleError(error as Error, 'Ingredients List: delete ingredient', true, 'Gagal menghapus bahan baku')
        }
    }, [selectedIngredient, deleteIngredient])

    const hasActiveFilters = Boolean(searchTerm) || stockFilter !== 'all' || categoryFilter !== 'all' || supplierFilter !== 'all'

    // Empty state
    if (!isLoading && (!ingredients || ingredients.length === 0)) {
        return (
            <>
                <EmptyState
                    {...EmptyStatePresets.ingredients}
                    actions={[
                        {
                            label: 'Tambah Bahan Baru',
                            onClick: handleAdd,
                            icon: Plus
                        }
                    ]}
                />
                <IngredientFormDialog
                    open={showFormDialog}
                    onOpenChange={setShowFormDialog}
                    {...(editingIngredient ? { ingredient: editingIngredient } : {})}
                />
            </>
        )
    }

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari bahan baku..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Stock Filter */}
                            <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Stok</SelectItem>
                                    <SelectItem value="normal">Stok Normal</SelectItem>
                                    <SelectItem value="low">Stok Rendah</SelectItem>
                                    <SelectItem value="out">Stok Habis</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Clear Filters */}
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleClearAllFilters}
                                    className="shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {(['all', 'Bahan Kering', 'Bahan Basah', 'Bumbu', 'Protein', 'Sayuran', 'Buah', 'Dairy', 'Kemasan', 'Lainnya'] as CategoryFilter[]).map((cat) => (
                                <Button
                                    key={cat}
                                    variant={categoryFilter === cat ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setCategoryFilter(cat)}
                                    className="whitespace-nowrap"
                                >
                                    {cat === 'all' ? 'Semua Kategori' : cat}
                                </Button>
                            ))}
                        </div>

                        {/* Supplier Filter */}
                        <Select
                            value={supplierFilter}
                            onValueChange={setSupplierFilter}
                        >
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier} value={supplier}>
                                        {supplier === 'all' ? 'Semua Supplier' : supplier}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Filter Badges */}
                    <FilterBadges 
                        filters={activeFilters}
                        onClearAll={handleClearAllFilters}
                        className="mt-3"
                    />

                    {/* Results Count */}
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                            Menampilkan {filteredData.length} dari {ingredients?.length || 0} bahan
                        </span>
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="text-xs">
                                {activeFilters.length} filter aktif
                            </Badge>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Data Display */}
            {isMobile ? (
                <MobileIngredientList
                    ingredients={ingredients}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr className="border-b">
                                        <th className="text-left p-4 font-medium text-sm">Nama Bahan</th>
                                        <th className="text-left p-4 font-medium text-sm">Satuan</th>
                                        <th className="text-right p-4 font-medium text-sm">Harga/Unit</th>
                                        <th className="text-center p-4 font-medium text-sm">Stok</th>
                                        <th className="text-right p-4 font-medium text-sm">Total Nilai</th>
                                        <th className="text-center p-4 font-medium text-sm w-[100px]">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ingredients.map((item: Ingredient) => {
                                        const currentStock = item.current_stock ?? 0
                                        const minStock = item.min_stock ?? 0
                                        const resolvedUnitPrice = item.price_per_unit ?? item.weighted_average_cost
                                        const unitPriceValue = typeof resolvedUnitPrice === 'number' ? resolvedUnitPrice : null
                                        const totalValue = unitPriceValue !== null ? currentStock * unitPriceValue : null
                                        return (
                                            <tr key={item['id']} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-medium">{item.name}</div>
                                                        {item.category && (
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.category}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm">{item.unit}</td>
                                                <td className="p-4 text-right text-sm font-medium">
                                                    {unitPriceValue !== null ? formatCurrency(unitPriceValue) : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <StockBadge
                                                            currentStock={currentStock}
                                                            minStock={minStock}
                                                            unit={item.unit}
                                                            compact
                                                        />
                                                        {(() => {
                                                            if (!item.expiry_date) { return null }
                                                            const expiryDate = new Date(item.expiry_date)
                                                            const today = new Date()
                                                            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                                                            if (daysUntilExpiry <= 0) {
                                                                return (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        Expired
                                                                    </Badge>
                                                                )
                                                            } if (daysUntilExpiry <= 7) {
                                                                return (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        {daysUntilExpiry} hari lagi
                                                                    </Badge>
                                                                )
                                                            } if (daysUntilExpiry <= 14) {
                                                                return (
                                                                    <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                                                                        {daysUntilExpiry} hari lagi
                                                                    </Badge>
                                                                )
                                                            }
                                                            return null
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right text-sm font-semibold">
                                                    {totalValue !== null ? formatCurrency(totalValue) : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex justify-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>

                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(item)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Hapus
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Empty filtered state */}
                        {filteredData.length === 0 && (
                            <div className="p-8">
                                <EmptyState
                                    {...EmptyStatePresets.search}
                                    compact
                                    actions={[
                                        {
                                            label: 'Hapus Filter',
                                            onClick: handleClearAllFilters,
                                            variant: 'outline',
                                            icon: X
                                        }
                                    ]}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Pagination */}
            {pagination && ingredients.length > 0 && (
                <ServerPagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={[12, 24, 48, 96]}
                />
            )}

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                entityName="Bahan Baku"
                itemName={selectedIngredient?.name ?? ''}
                isLoading={deleteIngredient.isPending}
            />

            {/* Form Dialog */}
            <IngredientFormDialog
                open={showFormDialog}
                onOpenChange={setShowFormDialog}
                {...(editingIngredient ? { ingredient: editingIngredient } : {})}
            />
        </div>
    )
}

export const IngredientsList = memo(IngredientsListComponent)



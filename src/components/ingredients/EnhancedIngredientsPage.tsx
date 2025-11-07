'use client'
 


import { Edit, Trash2, MoreVertical, ShoppingCart, Search, Filter, X, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useMemo, memo, useCallback } from 'react'

import { DeleteModal } from '@/components/ui'
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
import { undoableToast } from '@/components/ui/enhanced-toast'
import { FilterBadges, createFilterBadges } from '@/components/ui/filter-badges'
import { SimpleFAB } from '@/components/ui/floating-action-button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { useSettings } from '@/contexts/settings-context'
import { useIngredients } from '@/hooks'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks/usePagination'
import {
    genericErrorToast,
} from '@/lib/ingredients-toast'
import type { Row } from '@/types/database'
import { useMobile } from '@/utils/responsive'

import { IngredientFormDialog } from './IngredientFormDialog'
import { MobileIngredientList } from './MobileIngredientCard'
import { StockBadge } from './StockBadge'



type Ingredient = Row<'ingredients'>
type StockFilter = 'all' | 'low' | 'normal' | 'out'
type CategoryFilter = 'all' | 'Bahan Basah' | 'Bahan Kering' | 'Buah' | 'Bumbu' | 'Dairy' | 'Kemasan' | 'Lainnya' | 'Protein' | 'Sayuran'

interface EnhancedIngredientsPageProps {
    onAdd?: () => void
}

const EnhancedIngredientsPageComponent = ({ onAdd }: EnhancedIngredientsPageProps = {}) => {
    const router = useRouter()
    const { formatCurrency } = useSettings()
    const { data: ingredients, loading, refetch } = useIngredients({ realtime: true })
    const { delete: deleteIngredient } = useSupabaseCRUD('ingredients')
    const { toast } = useToast()
    const { isMobile } = useMobile()

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
    const [showFormDialog, setShowFormDialog] = useState(false)
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [stockFilter, setStockFilter] = useState<StockFilter>('all')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
    const [pageSize, setPageSize] = useState(12)

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!ingredients) { return [] }

        return ingredients.filter(item => {
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

            return matchesSearch && matchesStock && matchesCategory
        }).sort((a, b) => a.name.localeCompare(b.name))
    }, [ingredients, searchTerm, stockFilter, categoryFilter])

    // Pagination
    const pagination = usePagination({
        initialPageSize: pageSize,
        totalItems: filteredData.length,
    })

    // Get paginated data
    const paginatedData = useMemo(() => filteredData.slice(pagination.startIndex, pagination.endIndex), [filteredData, pagination.startIndex, pagination.endIndex])

    // Update page size
    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize)
        pagination.setPageSize(newSize)
    }, [pagination])

    // Create filter badges
    const activeFilters = createFilterBadges(
        { 
            search: searchTerm,
            stock: stockFilter,
            category: categoryFilter
        },
        {
            search: 'Search',
            stock: 'Stock',
            category: 'Category'
        },
        (newFilters) => {
            if (newFilters.search !== undefined) {
                setSearchTerm(newFilters.search)
            }
            if (newFilters.stock !== undefined) {
                setStockFilter(newFilters.stock)
            }
            if (newFilters.category !== undefined) {
                setCategoryFilter(newFilters.category)
            }
        }
    )

    const handleClearAllFilters = useCallback(() => {
        setSearchTerm('')
        setStockFilter('all')
        setCategoryFilter('all')
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

    const handleQuickBuy = useCallback((ingredient: Ingredient) => {
        router.push(`/ingredients/purchases?ingredient=${ingredient['id']}`)
    }, [router])

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedIngredient) { return }

        try {
            const deletedItem = selectedIngredient
            await deleteIngredient(selectedIngredient['id'])

            // Enhanced toast with undo functionality
            undoableToast({
                title: `${deletedItem.name} dihapus`,
                description: 'Bahan baku telah dihapus dari sistem',
                onUndo: () => {
                    // Note: Would need an undelete API endpoint for real undo
                    toast({
                        title: 'Fitur undo sedang dikembangkan',
                        description: 'Anda bisa menambahkan kembali bahan baku ini',
                    })
                },
                duration: 6000
            })

            setIsDeleteDialogOpen(false)
            setSelectedIngredient(null)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus bahan baku'
            toast(genericErrorToast('menghapus bahan baku', message))
        }
    }, [selectedIngredient, deleteIngredient, toast])

    const clearFilters = () => {
        setSearchTerm('')
        setStockFilter('all')
        setCategoryFilter('all')
    }

    const hasActiveFilters = (searchTerm || false) || stockFilter !== 'all' || categoryFilter !== 'all'

    // Empty state
    if (!loading && (!ingredients || ingredients.length === 0)) {
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
                    {...(refetch ? { onSuccess: refetch } : {})}
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
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                    onClick={clearFilters}
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
                    ingredients={paginatedData}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onQuickBuy={handleQuickBuy}
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
                                    {paginatedData.map((item) => {
                                        const currentStock = item.current_stock ?? 0
                                        const minStock = item.min_stock ?? 0
                                        const totalValue = currentStock * item.price_per_unit
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
                                                    {formatCurrency(item.price_per_unit)}
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
                                                    {formatCurrency(totalValue)}
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
                                                                <DropdownMenuItem
                                                                    onClick={() => handleQuickBuy(item)}
                                                                    disabled={currentStock > minStock}
                                                                    className={currentStock <= minStock ? 'bg-gray-50 text-gray-700 focus:bg-gray-100 focus:text-gray-800' : ''}
                                                                >
                                                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                                                    {currentStock <= minStock ? 'Quick Reorder' : 'Stok Cukup'}
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
                                            onClick: clearFilters,
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
            {filteredData.length > 0 && (
                <SimplePagination
                    page={pagination.page}
                    pageSize={pagination.pageSize}
                    totalPages={pagination.totalPages}
                    totalItems={filteredData.length}
                    startIndex={pagination.startIndex}
                    endIndex={pagination.endIndex}
                    onPageChange={pagination.setPage}
                    onPageSizeChange={handlePageSizeChange}
                    canNextPage={pagination.canNextPage}
                    canPrevPage={pagination.canPrevPage}
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
                isLoading={loading}
            />

            {/* Form Dialog */}
            <IngredientFormDialog
                open={showFormDialog}
                onOpenChange={setShowFormDialog}
                {...(editingIngredient ? { ingredient: editingIngredient } : {})}
                {...(refetch ? { onSuccess: refetch } : {})}
            />

            {/* Floating Action Button for Mobile */}
            {isMobile && (
                <SimpleFAB
                    onClick={handleAdd}
                    icon={<Plus className="h-6 w-6" />}
                />
            )}
        </div>
    )
}

export const EnhancedIngredientsPage = memo(EnhancedIngredientsPageComponent)

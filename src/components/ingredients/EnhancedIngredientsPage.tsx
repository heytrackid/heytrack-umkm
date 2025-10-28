'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useSettings } from '@/contexts/settings-context'
import { useIngredients } from '@/hooks'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { useToast } from '@/hooks/use-toast'
import { useMobile } from '@/hooks/useResponsive'
import { IngredientFormSchema, type SimpleIngredientFormData } from '@/lib/validations/form-validations'
import type { Database } from '@/types/supabase-generated'

// Enhanced Components
import { EnhancedEmptyState } from './EnhancedEmptyState'
import { StockBadge } from './StockBadge'
import { EnhancedIngredientForm } from './EnhancedIngredientForm'
import { IngredientFilters, type StockFilter, type SortOption } from './IngredientFilters'
import { MobileIngredientList } from './MobileIngredientCard'
import { BulkActions, SelectableRow } from './BulkActions'

// UI Components
import { CreateModal, EditModal, DeleteModal } from '@/components/ui'
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
import { Eye, Edit, Trash2, MoreVertical, ShoppingCart } from 'lucide-react'

// Toast helpers
import {
    ingredientCreatedToast,
    ingredientUpdatedToast,
    ingredientDeletedToast,
    duplicateNameErrorToast,
    genericErrorToast,
    lowStockWarningToast,
    outOfStockErrorToast
} from '@/lib/ingredients-toast'

type Ingredient = Database['public']['Tables']['ingredients']['Row']

export const EnhancedIngredientsPage = () => {
    const router = useRouter()
    const { formatCurrency } = useSettings()
    const { data: ingredients, loading, error } = useIngredients({ realtime: true })
    const { create: createIngredient, update: updateIngredient, delete: deleteIngredient } = useSupabaseCRUD('ingredients')
    const { toast } = useToast()
    const { isMobile } = useMobile()

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

    // Filter & Sort states
    const [searchTerm, setSearchTerm] = useState('')
    const [stockFilter, setStockFilter] = useState<StockFilter>('all')
    const [sortBy, setSortBy] = useState<SortOption>('name')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

    // Bulk selection
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    // Forms
    const createForm = useForm<SimpleIngredientFormData>({
        resolver: zodResolver(IngredientFormSchema),
        defaultValues: {
            name: '',
            unit: 'kg',
            price_per_unit: 0,
            current_stock: 0,
            min_stock: 0,
            description: '',
        }
    })

    const editForm = useForm<SimpleIngredientFormData>({
        resolver: zodResolver(IngredientFormSchema),
        defaultValues: {
            name: '',
            unit: 'kg',
            price_per_unit: 0,
            current_stock: 0,
            min_stock: 0,
            description: '',
        }
    })

    // Filter and sort data
    const processedData = useMemo(() => {
        if (!ingredients) { return [] }

        const filtered = ingredients.filter(item => {
            // Search filter
            const matchesSearch = !searchTerm ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase())

            // Stock filter
            let matchesStock = true
            if (stockFilter === 'low') {
                matchesStock = item.current_stock > 0 && item.current_stock <= item.min_stock
            } else if (stockFilter === 'out') {
                matchesStock = item.current_stock <= 0
            } else if (stockFilter === 'normal') {
                matchesStock = item.current_stock > item.min_stock
            }

            return matchesSearch && matchesStock
        })

        // Sort data
        filtered.sort((a, b) => {
            let aComparable: number | string
            let bComparable: number | string

            switch (sortBy) {
                case 'name':
                    aComparable = a.name.toLowerCase()
                    bComparable = b.name.toLowerCase()
                    break
                case 'stock':
                    aComparable = a.current_stock
                    bComparable = b.current_stock
                    break
                case 'price':
                    aComparable = a.price_per_unit
                    bComparable = b.price_per_unit
                    break
                case 'updated':
                    aComparable = new Date(a.updated_at || a.created_at).getTime()
                    bComparable = new Date(b.updated_at || b.created_at).getTime()
                    break
                default:
                    return 0
            }

            if (aComparable < bComparable) { return sortOrder === 'asc' ? -1 : 1 }
            if (aComparable > bComparable) { return sortOrder === 'asc' ? 1 : -1 }
            return 0
        })

        return filtered
    }, [ingredients, searchTerm, stockFilter, sortBy, sortOrder])

    // Handlers
    const handleCreate = () => {
        createForm.reset()
        setIsCreateModalOpen(true)
    }

    const handleEdit = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient)
        editForm.reset({
            name: ingredient.name,
            unit: ingredient.unit,
            price_per_unit: ingredient.price_per_unit,
            current_stock: ingredient.current_stock,
            min_stock: ingredient.min_stock,
            description: ingredient.description || '',
        })
        setIsEditModalOpen(true)
    }

    const handleDelete = (ingredient: Ingredient) => {
        setSelectedIngredient(ingredient)
        setIsDeleteDialogOpen(true)
    }

    const handleQuickBuy = (ingredient: Ingredient) => {
        router.push(`/ingredients/purchases?ingredient=${ingredient.id}`)
    }

    const handleSubmitCreate = async (data: SimpleIngredientFormData) => {
        try {
            await createIngredient(data)
            toast(ingredientCreatedToast(data.name))
            setIsCreateModalOpen(false)
            createForm.reset()

            // Check for low stock warning
            if (data.current_stock <= data.min_stock) {
                setTimeout(() => {
                    toast(lowStockWarningToast(data.name, data.current_stock, data.min_stock, data.unit))
                }, 1000)
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            if (message.includes('duplicate') || message.includes('unique')) {
                toast(duplicateNameErrorToast(data.name))
            } else {
                toast(genericErrorToast('menambahkan bahan baku', message))
            }
        }
    }

    const handleSubmitEdit = async (data: SimpleIngredientFormData) => {
        if (!selectedIngredient) { return }

        try {
            await updateIngredient(selectedIngredient.id, data)

            // Detect changes
            const changes: string[] = []
            if (data.current_stock !== selectedIngredient.current_stock) { changes.push('stok') }
            if (data.price_per_unit !== selectedIngredient.price_per_unit) { changes.push('harga') }
            if (data.min_stock !== selectedIngredient.min_stock) { changes.push('stok minimum') }

            toast(ingredientUpdatedToast(data.name, changes))
            setIsEditModalOpen(false)
            setSelectedIngredient(null)
            editForm.reset()

            // Check for stock warnings
            if (data.current_stock <= 0) {
                setTimeout(() => {
                    toast(outOfStockErrorToast(data.name))
                }, 1000)
            } else if (data.current_stock <= data.min_stock) {
                setTimeout(() => {
                    toast(lowStockWarningToast(data.name, data.current_stock, data.min_stock, data.unit))
                }, 1000)
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal memperbarui bahan baku'
            toast(genericErrorToast('memperbarui bahan baku', message))
        }
    }

    const handleConfirmDelete = async () => {
        if (!selectedIngredient) { return }

        try {
            await deleteIngredient(selectedIngredient.id)
            toast(ingredientDeletedToast(selectedIngredient.name))
            setIsDeleteDialogOpen(false)
            setSelectedIngredient(null)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menghapus bahan baku'
            toast(genericErrorToast('menghapus bahan baku', message))
        }
    }

    const handleBulkDelete = async (ids: string[]) => {
        await Promise.all(ids.map(id => deleteIngredient(id)))
    }

    const handleBulkExport = (ids: string[]) => {
        const selected = ingredients?.filter(i => ids.includes(i.id)) || []
        const csvContent = [
            ['Nama', 'Satuan', 'Harga', 'Stok', 'Min Stok'].join(','),
            ...selected.map(i =>
                [i.name, i.unit, i.price_per_unit, i.current_stock, i.min_stock].join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ingredients-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
    }

    const handleResetFilters = () => {
        setSearchTerm('')
        setStockFilter('all')
        setSortBy('name')
        setSortOrder('asc')
    }

    const handleSelectionToggle = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    // Empty state
    if (!loading && (!ingredients || ingredients.length === 0)) {
        return <EnhancedEmptyState onAdd={handleCreate} />
    }

    // Desktop table columns
    const columns = [
        {
            key: 'select',
            header: '',
            render: (_value: unknown, item: Ingredient) => (
                <SelectableRow
                    id={item.id}
                    isSelected={selectedIds.includes(item.id)}
                    onToggle={handleSelectionToggle}
                />
            ),
        },
        {
            key: 'name',
            header: 'Nama Bahan',
        },
        {
            key: 'unit',
            header: 'Satuan',
        },
        {
            key: 'price_per_unit',
            header: 'Harga/Unit',
            render: (value: number) => formatCurrency(value),
        },
        {
            key: 'current_stock',
            header: 'Stok',
            render: (_value: unknown, item: Ingredient) => (
                <StockBadge
                    currentStock={item.current_stock}
                    minStock={item.min_stock}
                    unit={item.unit}
                    compact
                />
            ),
        },
        {
            key: 'actions',
            header: 'Aksi',
            render: (_value: unknown, item: Ingredient) => (
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
                        {item.current_stock <= item.min_stock && (
                            <DropdownMenuItem onClick={() => handleQuickBuy(item)}>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Beli Sekarang
                            </DropdownMenuItem>
                        )}
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
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Filters */}
            <IngredientFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                stockFilter={stockFilter}
                onStockFilterChange={setStockFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                sortOrder={sortOrder}
                onSortOrderChange={setSortOrder}
                totalCount={ingredients?.length || 0}
                filteredCount={processedData.length}
                onReset={handleResetFilters}
            />

            {/* Bulk Actions */}
            {!isMobile && (
                <BulkActions
                    selectedIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    allIds={processedData.map(i => i.id)}
                    onBulkDelete={handleBulkDelete}
                    onBulkExport={handleBulkExport}
                />
            )}

            {/* Data Display */}
            {isMobile ? (
                <MobileIngredientList
                    ingredients={processedData}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onQuickBuy={handleQuickBuy}
                />
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        {columns.map(col => (
                                            <th
                                                key={String(col.key)}
                                                className="text-left p-3 font-medium text-muted-foreground"
                                            >
                                                {col.header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.map((item) => (
                                        <tr key={item.id} className="border-b hover:bg-muted/50">
                                            {columns.map(col => (
                                                <td key={String(col.key)} className="p-3">
                                                    {col.render
                                                        ? col.render((item)[col.key], item)
                                                        : String((item)[col.key] || '-')
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            <CreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                entityName="Bahan Baku"
                form={createForm}
                onSubmit={handleSubmitCreate}
                isLoading={loading}
            >
                <EnhancedIngredientForm form={createForm} mode="create" />
            </CreateModal>

            <EditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                entityName="Bahan Baku"
                form={editForm}
                onSubmit={handleSubmitEdit}
                isLoading={loading}
            >
                <EnhancedIngredientForm
                    form={editForm}
                    mode="edit"
                    initialData={selectedIngredient ? {
                        name: selectedIngredient.name,
                        unit: selectedIngredient.unit,
                        price_per_unit: selectedIngredient.price_per_unit,
                        current_stock: selectedIngredient.current_stock,
                        min_stock: selectedIngredient.min_stock,
                        description: selectedIngredient.description || '',
                    } : undefined}
                />
            </EditModal>

            <DeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
                entityName="Bahan Baku"
                itemName={selectedIngredient?.name}
                isLoading={loading}
            />
        </div>
    )
}

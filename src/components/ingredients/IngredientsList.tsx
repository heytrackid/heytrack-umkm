'use client'

import { memo, useCallback, useMemo, useState } from 'react'

import { Info } from '@/components/icons'
import { SharedDataTable, type Column, type ServerPaginationMeta } from '@/components/shared/SharedDataTable'
import { Badge } from '@/components/ui/badge'
import { DeleteModal } from '@/components/ui/index'
import { undoableToast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useSettings } from '@/contexts/settings-context'
import { infoToast } from '@/hooks/use-toast'
import { useDeleteIngredient, useIngredients } from '@/hooks/useIngredients'
import { handleError } from '@/lib/error-handling'

import { IngredientFormDialog } from '@/components/ingredients/IngredientFormDialog'
import { InventorySummaryCard } from '@/components/ingredients/InventorySummaryCard'
import { StockBadge } from '@/components/ingredients/StockBadge'

import type { Row } from '@/types/database'

type Ingredient = Row<'ingredients'>

interface IngredientsListProps {
  onAdd?: () => void
}

const IngredientsListComponent = ({ onAdd }: IngredientsListProps = {}): JSX.Element => {
  const { formatCurrency } = useSettings()
  const deleteIngredient = useDeleteIngredient()

  // Modal states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | undefined>(undefined)

  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch ingredients with pagination
  const { data: ingredientsResponse, isLoading, refetch } = useIngredients({
    page,
    limit,
    search: searchTerm.trim() || undefined
  })

  const ingredients = useMemo(() => ingredientsResponse?.data || [], [ingredientsResponse?.data])
  const pagination = ingredientsResponse?.pagination

  // Server pagination meta
  const serverPagination: ServerPaginationMeta | undefined = pagination ? {
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    pages: pagination.pages,
    hasNext: pagination.hasNext,
    hasPrev: pagination.hasPrev,
  } : undefined

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
    if (!selectedIngredient) return

    try {
      await deleteIngredient.mutateAsync(selectedIngredient.id)
      undoableToast({
        title: `${selectedIngredient.name} dihapus`,
        description: 'Bahan baku telah dihapus dari sistem',
        onUndo: () => {
          infoToast('Info', 'Fitur undo sedang dikembangkan - Anda bisa menambahkan kembali bahan baku ini')
        },
        duration: 6000
      })
      setIsDeleteDialogOpen(false)
      setSelectedIngredient(null)
    } catch (error) {
      handleError(error as Error, 'Ingredients List: delete ingredient', true, 'Gagal menghapus bahan baku')
    }
  }, [selectedIngredient, deleteIngredient])

  // Column definitions
  const columns: Array<Column<Ingredient>> = useMemo(() => [
    {
      key: 'name',
      header: 'Nama Bahan',
      render: (_, item) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium">{item.name}</span>
            {item.category && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal text-muted-foreground">
                {item.category}
              </Badge>
            )}
          </div>
          {item.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
          )}
        </div>
      )
    },
    {
      key: 'unit',
      header: 'Satuan',
      hideOnMobile: true,
      render: (_, item) => <span className="text-muted-foreground">{item.unit}</span>
    },
    {
      key: 'price_per_unit',
      header: (
        <div className="flex items-center gap-1">
          <span>Harga/Unit</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              <p className="text-xs">
                <strong>Harga per Unit</strong> adalah harga beli terakhir. <br />
                Jika ada pembelian, sistem akan menghitung <strong>WAC (Weighted Average Cost)</strong> untuk HPP yang lebih akurat.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
      render: (_, item) => {
        const hasWAC = item.weighted_average_cost && item.weighted_average_cost > 0
        const unitPrice = hasWAC ? item.weighted_average_cost : item.price_per_unit
        return (
          <div className="flex flex-col">
            <span className="font-medium tabular-nums">{unitPrice ? formatCurrency(unitPrice) : '-'}</span>
            {hasWAC && item.price_per_unit !== item.weighted_average_cost && (
              <span className="text-[10px] text-muted-foreground">WAC</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'current_stock',
      header: 'Stok',
      render: (_, item) => {
        const currentStock = item.current_stock ?? 0
        const minStock = item.min_stock ?? 0
        return (
          <div className="flex flex-col items-center gap-1.5">
            <StockBadge currentStock={currentStock} minStock={minStock} unit={item.unit} compact />
            {item.expiry_date && (() => {
              const expiryDate = new Date(item.expiry_date)
              const today = new Date()
              const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              if (daysUntilExpiry <= 0) {
                return <Badge variant="destructive" className="text-[10px] h-5 px-1.5">Expired</Badge>
              }
              if (daysUntilExpiry <= 7) {
                return <Badge variant="destructive" className="text-[10px] h-5 px-1.5 bg-rose-100 text-rose-700">{daysUntilExpiry} hari</Badge>
              }
              if (daysUntilExpiry <= 14) {
                return <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-amber-100 text-amber-800">{daysUntilExpiry} hari</Badge>
              }
              return null
            })()}
          </div>
        )
      }
    },
    {
      key: 'total_value',
      header: 'Total Nilai',
      hideOnMobile: true,
      render: (_, item) => {
        const currentStock = item.current_stock ?? 0
        const unitPrice = item.price_per_unit ?? item.weighted_average_cost
        const totalValue = unitPrice ? currentStock * unitPrice : null
        return <span className="font-semibold tabular-nums">{totalValue !== null ? formatCurrency(totalValue) : '-'}</span>
      }
    }
  ], [formatCurrency])



  return (
    <div className="space-y-4">
      <InventorySummaryCard ingredients={ingredients} />

      <SharedDataTable
        data={ingredients}
        columns={columns}
        loading={isLoading}
        serverPagination={serverPagination}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setLimit(size); setPage(1) }}
        onSearchChange={(search) => { setSearchTerm(search); setPage(1) }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={() => void refetch()}
        onAdd={handleAdd}
        addButtonText="Tambah Bahan"
        searchPlaceholder="Cari bahan baku..."
        emptyMessage="Belum Ada Bahan Baku"
        emptyDescription="Tambahkan bahan baku untuk mulai mengelola inventory dan menghitung HPP produk Anda."
        pageSizeOptions={[12, 24, 50, 100]}
      />

      <IngredientFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        {...(editingIngredient ? { ingredient: editingIngredient } : {})}
      />

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => { setIsDeleteDialogOpen(false); setSelectedIngredient(null) }}
        onConfirm={handleConfirmDelete}
        entityName="Bahan Baku"
        itemName={selectedIngredient?.name ?? ''}
      />
    </div>
  )
}

export const IngredientsList = memo(IngredientsListComponent)

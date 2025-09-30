import React, { memo, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Ingredient } from '../types'
import { formatCurrency } from '@/lib/utils'

interface OptimizedInventoryTableProps {
  ingredients: Ingredient[]
  selectedItems: string[]
  onSelectItem: (itemId: string) => void
  onSelectAll: () => void
  onEdit: (ingredient: Ingredient) => void
  onDelete: (ingredient: Ingredient) => void
  onShowPricingAnalysis: (ingredient: Ingredient) => void
}

// Memoized table row component to prevent unnecessary re-renders
const InventoryTableRow = memo(({ 
  ingredient, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete, 
  onShowPricingAnalysis 
}: {
  ingredient: Ingredient
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (ingredient: Ingredient) => void
  onDelete: (ingredient: Ingredient) => void
  onShowPricingAnalysis: (ingredient: Ingredient) => void
}) => {
  // Memoized calculations for performance
  const stockStatus = useMemo(() => {
    if (ingredient.current_stock <= 0) {
      return { 
        status: 'out', 
        color: 'destructive', 
        icon: AlertTriangle,
        label: 'Habis' 
      }
    } else if (ingredient.current_stock <= ingredient.min_stock) {
      return { 
        status: 'low', 
        color: 'warning', 
        icon: TrendingDown,
        label: 'Kurang' 
      }
    } else {
      return { 
        status: 'normal', 
        color: 'success', 
        icon: CheckCircle,
        label: 'Normal' 
      }
    }
  }, [ingredient.current_stock, ingredient.min_stock])

  const stockValue = useMemo(() => {
    return ingredient.current_stock * ingredient.price_per_unit
  }, [ingredient.current_stock, ingredient.price_per_unit])

  // Memoized event handlers
  const handleSelect = useCallback(() => {
    onSelect
  }, [ingredient.id, onSelect])

  const handleEdit = useCallback(() => {
    onEdit
  }, [ingredient, onEdit])

  const handleDelete = useCallback(() => {
    onDelete(ingredient)
  }, [ingredient, onDelete])

  const handleShowPricing = useCallback(() => {
    onShowPricingAnalysis(ingredient)
  }, [ingredient, onShowPricingAnalysis])

  const StatusIcon = stockStatus.icon

  return (
    <tr 
      className={`border-b hover:bg-gray-50/50 transition-colors ${
        isSelected ? 'bg-blue-50' : ''
      }`}
    >
      <td className="p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          className="rounded border-gray-300"
        />
      </td>
      <td className="p-4">
        <div>
          <p className="font-medium text-gray-900">{ingredient.name}</p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2">
          <StatusIcon className="w-4 h-4" />
          <span>{ingredient.current_stock} {ingredient.unit}</span>
          <Badge variant={stockStatus.color as any} className="text-xs">
            {stockStatus.label}
          </Badge>
        </div>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600">
          Min: {ingredient.min_stock} {ingredient.unit}
        </span>
      </td>
      <td className="p-4">
        <span className="font-medium">
          {formatCurrency(ingredient.price_per_unit)}/{ingredient.unit}
        </span>
      </td>
      <td className="p-4">
        <span className="font-semibold text-green-600">
          {formatCurrency(stockValue)}
        </span>
      </td>
      <td className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-8 h-8 p-0">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShowPricing}>
              <TrendingDown className="w-4 h-4 mr-2" />
              Analisis Harga
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
})

InventoryTableRow.displayName = 'InventoryTableRow'

// Main optimized table component
const OptimizedInventoryTable = memo(({
  ingredients,
  selectedItems,
  onSelectItem,
  onSelectAll,
  onEdit,
  onDelete,
  onShowPricingAnalysis
}: OptimizedInventoryTableProps) => {
  // Memoized calculations
  const totalValue = useMemo(() => {
    return ingredients.reduce((sum, ingredient) => {
      return sum + (ingredient.current_stock * ingredient.price_per_unit)
    }, 0)
  }, [ingredients])

  const lowStockCount = useMemo(() => {
    return ingredients.filter(ingredient => 
      ingredient.current_stock <= ingredient.min_stock
    ).length
  }, [ingredients])

  const isAllSelected = useMemo(() => {
    return ingredients.length > 0 && selectedItems.length === ingredients.length
  }, [ingredients.length, selectedItems.length])

  const isPartiallySelected = useMemo(() => {
    return selectedItems.length > 0 && selectedItems.length < ingredients.length
  }, [selectedItems.length, ingredients.length])

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada ingredient yang ditemukan</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Summary Stats */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-sm">
            <span>Total Items: <strong>{ingredients.length}</strong></span>
            <span>Total Value: <strong>{formatCurrency(totalValue)}</strong></span>
            {lowStockCount > 0 && (
              <span className="text-orange-600">
                Low Stock: <strong>{lowStockCount}</strong>
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {selectedItems.length} item(s) selected
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isPartiallySelected
                  }}
                  onChange={onSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-4 text-left font-medium text-gray-700">Ingredient</th>
              <th className="p-4 text-left font-medium text-gray-700">Stock</th>
              <th className="p-4 text-left font-medium text-gray-700">Min Stock</th>
              <th className="p-4 text-left font-medium text-gray-700">Harga</th>
              <th className="p-4 text-left font-medium text-gray-700">Nilai</th>
              <th className="p-4 text-left font-medium text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient) => (
              <InventoryTableRow
                key={ingredient.id}
                ingredient={ingredient}
                isSelected={selectedItems.includes(ingredient.id)}
                onSelect={onSelectItem}
                onEdit={onEdit}
                onDelete={onDelete}
                onShowPricingAnalysis={onShowPricingAnalysis}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

OptimizedInventoryTable.displayName = 'OptimizedInventoryTable'

export default OptimizedInventoryTable

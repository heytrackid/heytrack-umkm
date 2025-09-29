'use client'

import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'

interface BulkActionsProps {
  selectedItems: string[]
  filteredIngredients: any[]
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
}

/**
 * Bulk actions toolbar for inventory management
 */
export function BulkActions({
  selectedItems,
  filteredIngredients,
  onClearSelection,
  onBulkEdit,
  onBulkDelete
}: BulkActionsProps) {
  if (selectedItems.length === 0) return null

  const selectedNames = filteredIngredients
    .filter(ing => selectedItems.includes(ing.id))
    .map(ing => ing.name)

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {selectedItems.length} item dipilih
        </span>
        <span className="text-xs text-gray-500">
          ({selectedNames.slice(0, 2).join(', ')}
          {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700"
        >
          Batal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Semua
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus Semua
        </Button>
      </div>
    </div>
  )
}

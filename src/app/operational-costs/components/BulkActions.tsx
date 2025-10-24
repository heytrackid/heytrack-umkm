'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'

interface BulkActionsProps {
  selectedItems: string[]
  costs: unknown[]
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
}

/**
 * Bulk Actions Component
 * Shows bulk action buttons when items are selected
 */
export default function BulkActions({
  selectedItems,
  costs,
  onClearSelection,
  onBulkEdit,
  onBulkDelete
}: BulkActionsProps) {
  if (selectedItems.length === 0) return null
  
  const selectedCostNames = costs
    .filter(cost => selectedItems.includes(cost.id))
    .map(cost => cost.name)
    .slice(0, 2)
    .join(', ')
  
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedItems.length} biaya operasional dipilih
        </span>
        <span className="text-xs text-muted-foreground">
          ({selectedCostNames}
          {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          Batal
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkEdit}
        >
          <Edit2 className="h-4 w-4 mr-2" />
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

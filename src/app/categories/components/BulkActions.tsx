import { Edit2, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { Category } from '../constants'

interface BulkActionsProps {
  selectedItems: string[]
  filteredCategories: Category[]
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
}

export const BulkActions = ({
  selectedItems,
  filteredCategories,
  onClearSelection,
  onBulkEdit,
  onBulkDelete
}: BulkActionsProps) => {
  if (selectedItems.length === 0) { return null }

  const selectedCategories = filteredCategories.filter(category =>
    selectedItems.includes(category['id'])
  )
  const categoryNames = selectedCategories.map(category => category.name).slice(0, 2).join(', ')

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {selectedItems.length} kategori dipilih
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({categoryNames}
          {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="h-4 w-4 mr-2" />
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
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus Semua
        </Button>
      </div>
    </div>
  )
}

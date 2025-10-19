import React from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import type { CustomersTable } from '@/types/customers'

type Customer = CustomersTable['Row']

interface CustomerBulkActionsProps {
  selectedItems: string[]
  filteredCustomers: Customer[]
  onClearSelection: () => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  isLoading: boolean
}

export function CustomerBulkActions({
  selectedItems,
  filteredCustomers,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  isLoading
}: CustomerBulkActionsProps) {
  if (selectedItems.length === 0) {
    return null
  }

  return (
    <Alert>
      <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="space-y-1">
          <span className="text-sm font-medium text-gray-900">
            {selectedItems.length} pelanggan dipilih
          </span>
          <span className="text-xs text-gray-500">
            ({filteredCustomers
              .filter((customer) => selectedItems.includes(customer.id.toString()))
              .map((customer) => customer.name)
              .slice(0, 2)
              .join(', ')}
            {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
          </span>
        </div>

        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClearSelection}
            className="text-gray-600 hover:text-gray-800"
          >
            Batal
          </Button>
          <Button size="sm" onClick={onBulkEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Semua
          </Button>
          <Button
            size="sm"
            onClick={onBulkDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus Semua
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

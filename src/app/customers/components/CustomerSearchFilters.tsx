// Customer Search and Filters Component - Lazy Loaded
// Handles search functionality and bulk actions for customers

import { Edit2, Search, Trash2 } from '@/components/icons'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormSkeleton } from '@/components/ui/skeleton-loader'

import type { Customer } from '@/app/customers/components/types'

interface CustomerSearchFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  filteredCustomers: Customer[]
  selectedItems: string[]
  onClearSelection: () => void
  onBulkEdit?: () => void
  onBulkDelete: () => void
  isLoading: boolean
}

const CustomerSearchFilters = ({
  searchTerm,
  onSearchChange,
  filteredCustomers,
  selectedItems,
  onClearSelection,
  onBulkEdit,
  onBulkDelete,
  isLoading
}: CustomerSearchFiltersProps): JSX.Element => {
  if (isLoading) {
    return <FormSkeleton fields={2} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pelanggan berdasarkan nama, email, atau nomor telepon..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {selectedItems.length} pelanggan dipilih
            </span>
            <span className="text-xs text-muted-foreground">
              ({filteredCustomers.filter(customer => selectedItems.includes(customer['id'].toString())).map(customer => customer.name).slice(0, 2).join(', ')}
              {selectedItems.length > 2 ? ` +${selectedItems.length - 2} lainnya` : ''})
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-muted-foreground hover:text-muted-foreground"
            >
              Batal
            </Button>
            {onBulkEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBulkEdit}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Semua
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={onBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Hapus Semua
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { CustomerSearchFilters }

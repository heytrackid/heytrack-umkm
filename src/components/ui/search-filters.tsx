import { type ReactNode, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * Shared Search and Filter Components
 * Reusable search inputs, filters, and data manipulation UI
 */


// Debounced search input component
interface SearchInputProps {
  placeholder?: string
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  className?: string
  showClear?: boolean
}

export const SearchInput = ({
  placeholder = "Cari...",
  value,
  onChange,
  debounceMs = 300,
  className,
  showClear = true
}: SearchInputProps) => {
  const debouncedValue = useDebounce(value, debounceMs)

  // Update parent when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue)
    }
  }, [debouncedValue, onChange])

  const handleClear = () => {
    onChange('')
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {showClear && value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Filter toggle component
interface FilterToggleProps {
  label: string
  isActive: boolean
  onToggle: () => void
  count?: number
}

export const FilterToggle = ({ label, isActive, onToggle, count }: FilterToggleProps) => (
  <Button
    variant={isActive ? 'default' : 'outline'}
    size="sm"
    onClick={onToggle}
    className="flex items-center gap-2"
  >
    <Filter className="h-3 w-3" />
    {label}
    {count !== undefined && count > 0 && (
      <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
        {count}
      </Badge>
    )}
  </Button>
)

// Sort button component
interface SortButtonProps {
  label: string
  field: string
  currentSort?: { field: string; direction: 'asc' | 'desc' }
  onSort: (field: string, direction: 'asc' | 'desc') => void
}

export const SortButton = ({ label, field, currentSort, onSort }: SortButtonProps) => {
  const isActive = currentSort?.field === field
  const direction = isActive ? currentSort.direction : 'asc'

  const handleClick = () => {
    const newDirection = isActive && direction === 'asc' ? 'desc' : 'asc'
    onSort(field, newDirection)
  }

  const Icon = direction === 'asc' ? SortAsc : SortDesc

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={`flex items-center gap-2 ${isActive ? 'bg-gray-100' : ''}`}
    >
      {label}
      <Icon className="h-3 w-3" />
    </Button>
  )
}

// Active filters display
interface ActiveFiltersProps {
  filters: Record<string, unknown>
  onRemoveFilter: (key: string) => void
  filterLabels?: Record<string, string>
}

export const ActiveFilters = ({ filters, onRemoveFilter, filterLabels = {} }: ActiveFiltersProps) => {
  const activeFilters = Object.entries(filters).filter(([_, value]) =>
    value !== null && value !== undefined && value !== '' && value !== false
  )

  if (activeFilters.length === 0) { return null }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <span className="text-sm text-gray-600 self-center">Filter aktif:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="flex items-center gap-1">
          {filterLabels[key] || key}: {String(value)}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveFilter(key)}
            className="h-4 w-4 p-0 hover:bg-gray-200 ml-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => activeFilters.forEach(([key]) => onRemoveFilter(key))}
          className="text-xs"
        >
          Hapus Semua
        </Button>
      )}
    </div>
  )
}

// Combined search and filter bar
interface SearchFilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  actions?: ReactNode
  className?: string
}

export const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  actions,
  className
}: SearchFilterBarProps) => (
  <Card className={className}>
    <CardContent className="p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>

        {filters && (
          <div className="flex flex-wrap gap-2">
            {filters}
          </div>
        )}

        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
)

// Bulk actions bar
interface BulkActionsBarProps {
  selectedCount: number
  totalCount: number
  actions: ReactNode
  onClearSelection: () => void
}

export const BulkActionsBar = ({ selectedCount, totalCount, actions, onClearSelection }: BulkActionsBarProps) => {
  if (selectedCount === 0) { return null }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {selectedCount} dari {totalCount} dipilih
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-xs"
            >
              Hapus Pilihan
            </Button>
          </div>

          <div className="flex gap-2">
            {actions}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  X,
  Calendar,
  Download,
  Settings,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react'

// Search Component
interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  showClear?: boolean
}

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  debounceMs = 300,
  showClear = true
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    void setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange, debounceMs])

  const handleClear = () => {
    void setLocalValue('')
    onChange('')
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />
      {showClear && localValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Advanced Filter Component
interface FilterOption {
  value: string
  label: string
  icon?: ReactNode
}

interface AdvancedFiltersProps {
  filters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onReset: () => void
  filterOptions: Record<string, FilterOption[]>
  className?: string
}

export const AdvancedFilters = ({
  filters,
  onFilterChange,
  onReset,
  filterOptions,
  className = ""
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={onReset}>
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <Select
                  value={filters[key] || ""}
                  onValueChange={(value) => onFilterChange(key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`All ${key}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All {key}</SelectItem>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Date Range Picker Component
interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
  className?: string
}

export const DateRangePicker = ({
  value,
  onChange: _onChange,
  placeholder = "Pick a date range",
  className = ""
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const formatRange = () => {
    if (!value.from && !value.to) { return placeholder }
    if (value.from && !value.to) { return value.from.toLocaleDateString() }
    if (!value.from && value.to) { return `Until ${value.to.toLocaleDateString()}` }
    return `${value.from?.toLocaleDateString()} - ${value.to?.toLocaleDateString()}`
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-start text-left font-normal"
      >
        <Calendar className="mr-2 h-4 w-4" />
        {formatRange()}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 z-50 w-80">
          <CardContent className="p-4">
            {/* Date picker implementation would go here */}
            <p className="text-sm text-muted-foreground">
              Date range picker implementation
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="mt-2"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Sortable Column Header
interface SortableColumnProps {
  title: string
  sortKey: string
  currentSort: { key: string; direction: 'asc' | 'desc' } | null
  onSort: (key: string) => void
  className?: string
}

export const SortableColumn = ({
  title,
  sortKey,
  currentSort,
  onSort,
  className = ""
}: SortableColumnProps) => {
  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(sortKey)}
      className={cn("h-auto p-0 font-medium hover:bg-transparent", className)}
    >
      {title}
      {isActive && direction === 'asc' && <SortAsc className="ml-1 h-4 w-4" />}
      {isActive && direction === 'desc' && <SortDesc className="ml-1 h-4 w-4" />}
    </Button>
  )
}

// Export Actions Component
interface ExportAction {
  label: string
  format: string
  onClick: () => void
}

interface ExportActionsProps {
  actions: ExportAction[]
  className?: string
}

export const ExportActions = ({
  actions,
  className = ""
}: ExportActionsProps) => (
  <div className={cn("flex items-center gap-2", className)}>
    <Download className="h-4 w-4 text-muted-foreground" />
    <Select>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Export" />
      </SelectTrigger>
      <SelectContent>
        {actions.map((action) => (
          <SelectItem
            key={action.format}
            value={action.format}
            onClick={action.onClick}
          >
            {action.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
)

// Bulk Actions Component
interface BulkAction {
  label: string
  icon?: ReactNode
  onClick: (selectedIds: string[]) => void
  variant?: 'default' | 'destructive'
}

interface BulkActionsProps {
  selectedIds: string[]
  actions: BulkAction[]
  onClearSelection: () => void
  className?: string
}

export const BulkActions = ({
  selectedIds,
  actions,
  onClearSelection,
  className = ""
}: BulkActionsProps) => {
  if (selectedIds.length === 0) { return null }

  return (
    <Card className={cn("border-gray-300 bg-gray-50", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {selectedIds.length} selected
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear selection
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                size="sm"
                onClick={() => action.onClick(selectedIds)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading Skeletons
export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
)

export const CardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardContent>
      </Card>
    ))}
  </div>
)

export const FormSkeleton = ({ fields = 4 }: { fields?: number }) => (
  <div className="space-y-6">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
)

// Empty States
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = ""
}: EmptyStateProps) => (
  <div className={cn("text-center py-12", className)}>
    {icon && (
      <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && (
      <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
        {description}
      </p>
    )}
    {action && (
      <Button onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
)

// Quick Actions Menu
interface QuickAction {
  label: string
  icon?: ReactNode
  onClick: () => void
  shortcut?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  trigger?: ReactNode
  className?: string
}

export const QuickActions = ({
  actions,
  trigger,
  className = ""
}: QuickActionsProps) => (
  <Select>
    <SelectTrigger className={cn("w-48", className)}>
      {trigger ?? (
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Quick Actions
        </div>
      )}
    </SelectTrigger>
    <SelectContent>
      {actions.map((action) => (
        <SelectItem
          key={action.label}
          value={action.label}
          onClick={action.onClick}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {action.icon}
              {action.label}
            </div>
            {action.shortcut && (
              <Badge variant="outline" className="text-xs">
                {action.shortcut}
              </Badge>
            )}
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

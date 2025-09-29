'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  typeFilter: string
  onTypeFilterChange: (value: string) => void
}

/**
 * Search and filter controls for inventory management
 */
export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange
}: SearchAndFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari bahan baku..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={typeFilter} onValueChange={onTypeFilterChange}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Filter kategori" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Semua">Semua Bahan</SelectItem>
          <SelectItem value="low_stock">Stock Rendah</SelectItem>
          <SelectItem value="normal">Stock Normal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

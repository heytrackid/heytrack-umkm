import React from 'react'
import { Input } from '@/components/ui/input'
import { SearchFormSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { Search } from 'lucide-react'

interface CustomerFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  isLoading: boolean
}

export function CustomerFilters({ searchTerm, onSearchChange, isLoading }: CustomerFiltersProps) {
  if (isLoading) {
    return <SearchFormSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama, email, atau nomor telepon..."
            className="pl-10"
          />
        </div>
      </div>
    </div>
  )
}

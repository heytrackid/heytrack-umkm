'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@/components/icons'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ServerPaginationProps {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSizeOptions?: number[]
  showPageSizeSelector?: boolean
  className?: string
}

/**
 * ServerPagination - Reusable server-side pagination component
 * Uses pagination metadata from API responses for consistent pagination experience
 */
export const ServerPagination = ({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = true,
  className = '',
}: ServerPaginationProps) => {
  const { total, page, limit, pages, hasNext, hasPrev } = pagination

  // Calculate showing range
  const startItem = useMemo(() => {
    if (total === 0) return 0
    return (page - 1) * limit + 1
  }, [page, limit, total])

  const endItem = useMemo(() => {
    if (total === 0) return 0
    return Math.min(page * limit, total)
  }, [page, limit, total])

  // Don't render if no data or only one page
  if (total === 0 || pages <= 1) {
    return null
  }

  return (
    <div className={`flex items-center justify-between px-2 ${className}`}>
      {/* Results info */}
      <div className="flex-1 text-sm text-muted-foreground">
        Menampilkan {startItem} sampai {endItem} dari {total} hasil
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Baris per halaman</p>
            <Select
              value={limit.toString()}
              onValueChange={(value: string) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page info */}
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Halaman {page} dari {pages}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(1)}
            disabled={!hasPrev}
          >
            <span className="sr-only">Ke halaman pertama</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrev}
          >
            <span className="sr-only">Ke halaman sebelumnya</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNext}
          >
            <span className="sr-only">Ke halaman berikutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => onPageChange(pages)}
            disabled={!hasNext}
          >
            <span className="sr-only">Ke halaman terakhir</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export type { ServerPaginationProps, PaginationMeta }
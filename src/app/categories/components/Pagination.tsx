import { ChevronLeft, ChevronRight } from 'lucide-react'

import { type PageSize, PAGINATION_DEFAULTS } from '@/app/categories/constants'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PaginationProps {
  currentPage: number
  totalPages: number
  pageSize: PageSize
  totalItems: number
  startItem: number
  endItem: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: PageSize) => void
}

export const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  onPageSizeChange
}: PaginationProps) => {
  if (totalPages <= 1) { return null }

  return (
    <div className="flex items-center justify-between px-4 py-4 border-t bg-muted/30">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Menampilkan {startItem} - {endItem} dari {totalItems} kategori
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tampilkan:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => {
            onPageSizeChange(Number(value) as PageSize)
            onPageChange(1) // Reset to first page when page size changes
          }}>
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGINATION_DEFAULTS.PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm font-medium">
            Halaman {currentPage} dari {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

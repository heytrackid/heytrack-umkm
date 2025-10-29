import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface SimplePaginationProps {
    page: number
    pageSize: number
    totalPages: number
    totalItems: number
    startIndex: number
    endIndex: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    canNextPage: boolean
    canPrevPage: boolean
    pageSizeOptions?: number[]
    showPageSizeSelector?: boolean
    showFirstLast?: boolean
    itemLabel?: string
}

export function SimplePagination({
    page,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPageChange,
    onPageSizeChange,
    canNextPage,
    canPrevPage,
    pageSizeOptions = [10, 20, 50, 100],
    showPageSizeSelector = true,
    showFirstLast = false,
    itemLabel = 'item',
}: SimplePaginationProps) {
    if (totalPages <= 1 && !showPageSizeSelector) {
        return null
    }

    const displayStart = Math.min(startIndex + 1, totalItems)
    const displayEnd = Math.min(endIndex, totalItems)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-muted/30">
            {/* Info Text */}
            <div className="text-sm text-muted-foreground">
                Menampilkan {displayStart} - {displayEnd} dari {totalItems} {itemLabel}
            </div>

            <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                {showPageSizeSelector && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Tampilkan:
                        </span>
                        <Select
                            value={pageSize.toString()}
                            onValueChange={(value) => onPageSizeChange(Number(value))}
                        >
                            <SelectTrigger className="w-20 h-9">
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

                {/* Page Navigation */}
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        {showFirstLast && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(1)}
                                disabled={!canPrevPage}
                                className="h-9 w-9 p-0"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                                <span className="sr-only">Halaman pertama</span>
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page - 1)}
                            disabled={!canPrevPage}
                            className="h-9 w-9 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Halaman sebelumnya</span>
                        </Button>

                        <span className="text-sm font-medium whitespace-nowrap px-2">
                            Halaman {page} dari {totalPages}
                        </span>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(page + 1)}
                            disabled={!canNextPage}
                            className="h-9 w-9 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Halaman selanjutnya</span>
                        </Button>

                        {showFirstLast && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(totalPages)}
                                disabled={!canNextPage}
                                className="h-9 w-9 p-0"
                            >
                                <ChevronsRight className="h-4 w-4" />
                                <span className="sr-only">Halaman terakhir</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

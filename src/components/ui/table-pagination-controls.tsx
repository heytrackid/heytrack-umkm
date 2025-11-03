"use client"

import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TablePaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  onPageSizeChange: (size: number) => void
  totalItems: number
  pageStart: number
  pageEnd: number
  pageSizeOptions?: number[]
  className?: string
}

export const TablePaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  pageStart,
  pageEnd,
  pageSizeOptions = [10, 25, 50],
  className,
}: TablePaginationControlsProps) => {
  const pages = buildPageList(currentPage, totalPages)

  const safeStart = totalItems === 0 ? 0 : pageStart
  const safeEnd = totalItems === 0 ? 0 : pageEnd

  return (
    <div
      className={cn(
        "flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        Menampilkan {safeStart} - {safeEnd} dari {totalItems} data
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Per halaman</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage > 1) {
                    onPageChange(currentPage - 1)
                  }
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pages.map((page, index: number) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage}
                    onClick={(event) => {
                      event.preventDefault()
                      if (typeof page === 'number') {
                        onPageChange(page)
                      }
                    }}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage < totalPages) {
                    onPageChange(currentPage + 1)
                  }
                }}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

function buildPageList(currentPage: number, totalPages: number): Array<number | string> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: Array<number | "ellipsis"> = []
  const addPage = (page: number) => {
    if (!pages.includes(page)) {
      pages.push(page)
    }
  }

  addPage(1)

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    pages.push("ellipsis")
  }

  for (let page = start; page <= end; page++) {
    addPage(page)
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis")
  }

  addPage(totalPages)

  return pages
}

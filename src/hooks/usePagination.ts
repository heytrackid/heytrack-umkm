import { useState, useMemo, useEffect } from 'react'

interface UsePaginationProps {
  initialPageSize?: number
  totalItems: number
  initialPage?: number
}

interface UsePaginationReturn {
  page: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  canNextPage: boolean
  canPrevPage: boolean
}

export function usePagination({
  initialPageSize = 12,
  totalItems,
  initialPage = 1
}: UsePaginationProps): UsePaginationReturn {
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize))
  }, [totalItems, pageSize])

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    return (page - 1) * pageSize
  }, [page, pageSize])

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize, totalItems)
  }, [startIndex, pageSize, totalItems])

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  // Reset to page 1 when page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }

  // Navigation functions
  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const canNextPage = page < totalPages
  const canPrevPage = page > 1

  return {
    page,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    setPage,
    setPageSize: handlePageSizeChange,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage
  }
}

'use client'

import {
    ArrowDownAZ,
    ArrowUpAZ,
    Download,
    Edit,
    Eye,
    Grid3X3,
    List,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    X
} from '@/components/icons'
import { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SkeletonText } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: keyof T | string
  header: string | ReactNode
  render?: (value: unknown, item: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  filterType?: 'text' | 'select'
  filterOptions?: Array<{ label: string; value: string }>
  hideOnMobile?: boolean
  className?: string
}

export interface ServerPaginationMeta {
  total: number
  page: number
  limit: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CustomAction<T> {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick: (item: T) => void
  variant?: 'default' | 'destructive'
  show?: (item: T) => boolean
}

interface SharedDataTableProps<T> {
  data: T[]
  columns: Array<Column<T>>
  onAdd?: () => void
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onBulkDelete?: (items: T[]) => void
  onRefresh?: () => void
  customActions?: Array<CustomAction<T>>
  title?: string
  description?: string
  addButtonText?: string
  searchPlaceholder?: string
  emptyMessage?: string
  emptyDescription?: string
  loading?: boolean
  exportable?: boolean
  refreshable?: boolean
  enableBulkActions?: boolean
  idKey?: keyof T | string
  displayMode?: 'table' | 'cards'
  allowViewToggle?: boolean
  cardRenderer?: (item: T, actions: { onView?: () => void; onEdit?: () => void; onDelete?: () => void }) => ReactNode
  cardsPerRow?: 2 | 3 | 4
  enablePagination?: boolean
  sortOptions?: Array<{ label: string; value: string; direction: 'asc' | 'desc' }>
  defaultSort?: string
  onSortChange?: (sort: string, direction: 'asc' | 'desc') => void
  pageSizeOptions?: number[]
  initialPageSize?: number
  serverPagination?: ServerPaginationMeta | undefined
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  onSearchChange?: (search: string) => void
  headerActions?: ReactNode
  className?: string
  compact?: boolean
  showResultCount?: boolean
}

function getValue<T>(item: T, key: keyof T | string): unknown {
  if (typeof key === 'string' && key.includes('.')) {
    return key.split('.').reduce<unknown>((acc, segment) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[segment]
      }
      return undefined
    }, item as Record<string, unknown>)
  }
  return item[key as keyof T]
}

interface UnifiedPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  pageStart: number
  pageEnd: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  pageSizeOptions: number[]
}

const UnifiedPagination = ({ currentPage, totalPages, totalItems, pageSize, pageStart, pageEnd, onPageChange, onPageSizeChange, pageSizeOptions }: UnifiedPaginationProps): JSX.Element | null => {
  if (totalItems === 0) return null
  const canPrev = currentPage > 1
  const canNext = currentPage < totalPages

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
      <div className="text-sm text-muted-foreground">Menampilkan {pageStart} - {pageEnd} dari {totalItems} data</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Per halaman</span>
          <Select value={String(pageSize)} onValueChange={(v: string) => onPageSizeChange(Number(v))}>
            <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((opt) => <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(1)} disabled={!canPrev}>«</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(currentPage - 1)} disabled={!canPrev}>‹</Button>
            <span className="text-sm font-medium px-2 whitespace-nowrap">{currentPage} / {totalPages}</span>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(currentPage + 1)} disabled={!canNext}>›</Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => onPageChange(totalPages)} disabled={!canNext}>»</Button>
          </div>
        )}
      </div>
    </div>
  )
}

const SharedDataTableComponent = <T extends Record<string, unknown>>({
  data, columns, onAdd, onView, onEdit, onDelete, onBulkDelete, onRefresh, customActions,
  title, description, addButtonText = "Tambah Data", searchPlaceholder = "Cari...",
  emptyMessage = "Tidak ada data", emptyDescription = "Belum ada data yang tersedia",
  loading = false, exportable = false, refreshable = true, enableBulkActions = false, idKey = 'id',
  displayMode = 'table', allowViewToggle = false, cardRenderer, cardsPerRow = 3, enablePagination = true, pageSizeOptions,
  initialPageSize, serverPagination, onPageChange, onPageSizeChange, onSearchChange,
  sortOptions, defaultSort, onSortChange,
  headerActions, className = "", compact = false, showResultCount = true,
}: SharedDataTableProps<T>): JSX.Element => {
  const [isMounted, setIsMounted] = useState(false)
  const [currentDisplayMode, setCurrentDisplayMode] = useState<'table' | 'cards'>(displayMode)
  const [currentSort, setCurrentSort] = useState<string>(defaultSort || '')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  
  useEffect(() => {
    // Hydration sync - intentional immediate setState
    const timer = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])

  const isServerPagination = !!serverPagination
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [rowsPerPage, setRowsPerPage] = useState<number>(serverPagination?.limit || initialPageSize || pageSizeOptions?.[0] || 10)
  const [currentPage, setCurrentPage] = useState(serverPagination?.page || 1)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Sync server pagination state via refs to avoid cascading renders
  const serverPage = serverPagination?.page
  const serverLimit = serverPagination?.limit
  useEffect(() => {
    if (serverPage !== undefined && serverLimit !== undefined) {
      requestAnimationFrame(() => {
        setCurrentPage(serverPage)
        setRowsPerPage(serverLimit)
      })
    }
  }, [serverPage, serverLimit])

  const sanitizedPageSizeOptions = useMemo(() => {
    if (!enablePagination && !isServerPagination) return [Math.max(data.length, 1)]
    if (pageSizeOptions?.length) return pageSizeOptions
    return [10, 25, 50, 100]
  }, [enablePagination, isServerPagination, pageSizeOptions, data.length])

  const processedData = useMemo(() => {
    const safeData = Array.isArray(data) ? data : []
    if (isServerPagination) return safeData
    let filtered = safeData.filter(item => {
      const matchesSearch = !searchTerm || columns.some(col => {
        const value = getValue(item, col.key)
        return value !== null && String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })
      const matchesFilters = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue || filterValue === 'all') return true
        return String(getValue(item, key)) === filterValue
      })
      return matchesSearch && matchesFilters
    })
    
    // Apply client-side sorting
    if (currentSort && !isServerPagination) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = getValue(a, currentSort)
        const bVal = getValue(b, currentSort)
        
        // Handle dates
        if (aVal instanceof Date && bVal instanceof Date) {
          return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime()
        }
        
        // Handle strings that look like dates
        const aDate = typeof aVal === 'string' ? Date.parse(aVal) : NaN
        const bDate = typeof bVal === 'string' ? Date.parse(bVal) : NaN
        if (!isNaN(aDate) && !isNaN(bDate)) {
          return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
        }
        
        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        // Handle strings
        const aStr = String(aVal || '')
        const bStr = String(bVal || '')
        return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
      })
    }
    
    return filtered
  }, [data, searchTerm, filters, columns, isServerPagination, currentSort, sortDirection])

  const totalItems = isServerPagination ? serverPagination.total : processedData.length
  const totalPages = isServerPagination ? serverPagination.pages : (enablePagination ? Math.max(1, Math.ceil(totalItems / rowsPerPage)) : 1)
  const pageStart = isServerPagination ? ((serverPagination.page - 1) * serverPagination.limit) + 1 : (enablePagination ? ((currentPage - 1) * rowsPerPage) + 1 : 1)
  const pageEnd = isServerPagination ? Math.min(serverPagination.page * serverPagination.limit, serverPagination.total) : (enablePagination ? Math.min(pageStart + rowsPerPage - 1, totalItems) : totalItems)
  const paginatedData = isServerPagination ? processedData : (enablePagination ? processedData.slice(pageStart - 1, pageEnd) : processedData)

  const handleSearchChange = useCallback((value: string) => { setSearchTerm(value); onSearchChange?.(value) }, [onSearchChange])
  const handleFilterChange = useCallback((columnKey: string, value: string) => { setFilters(prev => ({ ...prev, [columnKey]: value })) }, [])
  const handleSortChange = useCallback((sortKey: string) => {
    if (currentSort === sortKey) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      setSortDirection(newDirection)
      onSortChange?.(sortKey, newDirection)
    } else {
      setCurrentSort(sortKey)
      setSortDirection('desc')
      onSortChange?.(sortKey, 'desc')
    }
  }, [currentSort, sortDirection, onSortChange])
  const handleViewToggle = useCallback(() => {
    setCurrentDisplayMode(prev => prev === 'table' ? 'cards' : 'table')
  }, [])
  const handlePageChange = useCallback((page: number) => { onPageChange ? onPageChange(page) : setCurrentPage(page) }, [onPageChange])
  const handlePageSizeChange = useCallback((size: number) => { if (onPageSizeChange) { onPageSizeChange(size) } else { setRowsPerPage(size); setCurrentPage(1) } }, [onPageSizeChange])
  const handleSelectAll = useCallback(() => { selectedItems.size === paginatedData.length ? setSelectedItems(new Set()) : setSelectedItems(new Set(paginatedData.map(item => String(getValue(item, idKey))))) }, [paginatedData, selectedItems.size, idKey])
  const handleSelectItem = useCallback((itemId: string) => { setSelectedItems(prev => { const newSet = new Set(prev); newSet.has(itemId) ? newSet.delete(itemId) : newSet.add(itemId); return newSet }) }, [])
  const handleBulkDelete = useCallback(() => { if (!onBulkDelete || selectedItems.size === 0) return; onBulkDelete(paginatedData.filter(item => selectedItems.has(String(getValue(item, idKey))))); setSelectedItems(new Set()) }, [onBulkDelete, paginatedData, selectedItems, idKey])
  const handleExport = useCallback(() => {
    if (!exportable) return
    const csvContent = [columns.map(col => col.header).join(','), ...processedData.map(item => columns.map(col => `"${String(getValue(item, col.key) || '')}"`).join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${title || 'data'}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [exportable, processedData, columns, title])
  const clearFilters = useCallback(() => { setSearchTerm(''); setFilters({}); onSearchChange?.('') }, [onSearchChange])

  const memoizedFilters = useMemo(() => JSON.stringify(filters), [filters])
  useEffect(() => {
    if (!isServerPagination && enablePagination) {
      requestAnimationFrame(() => setCurrentPage(1))
    }
  }, [searchTerm, memoizedFilters, rowsPerPage, enablePagination, isServerPagination])

  const hasActiveFilters = searchTerm || Object.values(filters).some(v => v && v !== 'all')
  const activeFilterCount = (searchTerm ? 1 : 0) + Object.values(filters).filter(v => v && v !== 'all').length

  if (!isMounted || loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <SkeletonText className="h-4 w-1/4" />
            {[...Array(5)].map((_, i) => <SkeletonText key={i} className="h-4 w-full" />)}
          </div>
        </CardContent>
      </Card>
    )
  }

  const cardGridClass = { 2: 'grid-cols-1 md:grid-cols-2', 3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3', 4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' }[cardsPerRow]

  return (
    <Card className={className}>
      {(title || onAdd || refreshable || headerActions) && (
        <CardHeader className={cn(compact && "p-4")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && <CardTitle className={cn(compact && "text-lg")}>{title}</CardTitle>}
              {description && <p className={cn("text-sm text-muted-foreground", compact && "text-xs")}>{description}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {enableBulkActions && selectedItems.size > 0 && <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-2" />Hapus {selectedItems.size}</Button>}
              {headerActions}
              {allowViewToggle && cardRenderer && (
                <Button variant="outline" size="sm" onClick={handleViewToggle} title={currentDisplayMode === 'cards' ? 'Tampilan List' : 'Tampilan Grid'}>
                  {currentDisplayMode === 'cards' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                </Button>
              )}
              {refreshable && onRefresh && <Button variant="outline" size="sm" onClick={onRefresh}><RefreshCw className="h-4 w-4" /></Button>}
              {exportable && <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" />Export</Button>}
              {onAdd && <Button onClick={onAdd} size="sm"><Plus className="h-4 w-4 mr-2" />{addButtonText}</Button>}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(compact && "p-4")}>
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={searchPlaceholder} value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)} className="pl-10" />
            </div>
            {columns.filter(col => col.filterable && col.filterOptions).map(col => (
              <Select key={String(col.key)} value={filters[String(col.key)] || 'all'} onValueChange={(v: string) => handleFilterChange(String(col.key), v)}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder={col.header} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua {col.header}</SelectItem>
                  {col.filterOptions?.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            {sortOptions && sortOptions.length > 0 && (
              <Select value={currentSort || 'default'} onValueChange={(v: string) => v !== 'default' && handleSortChange(v)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <div className="flex items-center gap-2">
                    {sortDirection === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
                    <SelectValue placeholder="Urutkan" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Urutkan</SelectItem>
                  {sortOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0"><X className="h-4 w-4 mr-1" />Clear</Button>}
          </div>
          {showResultCount && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{isServerPagination ? `${totalItems} hasil` : hasActiveFilters ? `${processedData.length} hasil filter dari ${data.length} total` : `${totalItems} data`}</span>
              {activeFilterCount > 0 && <Badge variant="secondary" className="text-xs">{activeFilterCount} filter aktif</Badge>}
            </div>
          )}
        </div>
        {paginatedData.length === 0 ? (
          <EmptyState title={hasActiveFilters ? "Tidak ada hasil" : emptyMessage} description={hasActiveFilters ? "Coba ubah filter atau kata kunci pencarian" : emptyDescription} actions={hasActiveFilters ? [{ label: "Hapus Filter", onClick: clearFilters }] : onAdd ? [{ label: addButtonText, onClick: onAdd }] : []} />
        ) : (
          <div className="space-y-4">
            {enableBulkActions && (
              <div className="flex items-center gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={selectedItems.size === paginatedData.length && paginatedData.length > 0} onChange={handleSelectAll} className="cursor-pointer w-4 h-4" />
                  <span className="text-sm text-muted-foreground">Pilih semua ({paginatedData.length})</span>
                </label>
                {selectedItems.size > 0 && (
                  <div className="flex-1 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{selectedItems.size} item dipilih</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedItems(new Set())}>Batal</Button>
                      <Button variant="destructive" size="sm" onClick={handleBulkDelete}><Trash2 className="h-4 w-4 mr-2" />Hapus</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {currentDisplayMode === 'cards' && cardRenderer ? (
              <div className={cn("grid gap-4", cardGridClass)}>
                {paginatedData.map((item) => {
                  const actions: { onView?: () => void; onEdit?: () => void; onDelete?: () => void } = {}
                  if (onView) actions.onView = () => onView(item)
                  if (onEdit) actions.onEdit = () => onEdit(item)
                  if (onDelete) actions.onDelete = () => onDelete(item)
                  return <div key={String(getValue(item, idKey))}>{cardRenderer(item, actions)}</div>
                })}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {enableBulkActions && (
                          <TableHead className="w-[50px]">☑</TableHead>
                        )}
                        {columns.map((col) => (
                          <TableHead key={String(col.key)} className={cn(col.hideOnMobile && "hidden md:table-cell", col.className)}>
                            {col.header}
                          </TableHead>
                        ))}
                        {(onView || onEdit || onDelete || customActions?.length) && (
                          <TableHead className="w-[80px]">Aksi</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((item, index) => (
                        <TableRow key={String(getValue(item, idKey))} className={cn(index % 2 === 0 ? 'bg-background' : 'bg-muted/30')}>
                          {enableBulkActions && (
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedItems.has(String(getValue(item, idKey)))}
                                onChange={() => handleSelectItem(String(getValue(item, idKey)))}
                                className="cursor-pointer w-4 h-4"
                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                              />
                            </TableCell>
                          )}
                          {columns.map((col) => (
                            <TableCell key={String(col.key)} className={cn(col.hideOnMobile && "hidden md:table-cell", col.className)}>
                              {col.render ? col.render(getValue(item, col.key), item) : String(getValue(item, col.key) ?? '')}
                            </TableCell>
                          ))}
                          {(onView || onEdit || onDelete || customActions?.length) && (
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {onView && (
                                    <DropdownMenuItem onClick={() => onView(item)}>
                                      <Eye className="h-4 w-4 mr-2" />Lihat
                                    </DropdownMenuItem>
                                  )}
                                  {onEdit && (
                                    <DropdownMenuItem onClick={() => onEdit(item)}>
                                      <Edit className="h-4 w-4 mr-2" />Edit
                                    </DropdownMenuItem>
                                  )}
                                  {customActions?.map((action, idx) => {
                                    if (action.show && !action.show(item)) return null
                                    const Icon = action.icon
                                    return (
                                      <DropdownMenuItem
                                        key={idx}
                                        onClick={() => action.onClick(item)}
                                        className={action.variant === 'destructive' ? 'text-red-600' : ''}
                                      >
                                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                                        {action.label}
                                      </DropdownMenuItem>
                                    )
                                  })}
                                  {onDelete && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => onDelete(item)} className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />Hapus
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
            {(enablePagination || isServerPagination) && totalItems > 0 && (
              <UnifiedPagination currentPage={isServerPagination ? serverPagination.page : currentPage} totalPages={totalPages} totalItems={totalItems} pageSize={isServerPagination ? serverPagination.limit : rowsPerPage} pageStart={Math.min(pageStart, totalItems)} pageEnd={Math.min(pageEnd, totalItems)} onPageChange={handlePageChange} onPageSizeChange={handlePageSizeChange} pageSizeOptions={sanitizedPageSizeOptions} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export const SharedDataTable = memo(SharedDataTableComponent) as typeof SharedDataTableComponent

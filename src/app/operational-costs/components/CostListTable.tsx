'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Receipt,
  Edit2,
  Trash2,
  MoreHorizontal,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface OperationalCost {
  id: string
  name: string
  category: string
  amount: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  description?: string
  isFixed: boolean
  icon: string
}

interface CostListTableProps {
  costs: OperationalCost[]
  selectedItems: string[]
  onSelectAll: () => void
  onSelectItem: (id: string) => void
  onEdit: (cost: OperationalCost) => void
  onDelete: (id: string) => void
  onView: (cost: OperationalCost) => void
  onAdd: () => void
  formatCurrency: (amount: number) => string
  calculateMonthlyCost: (cost: OperationalCost) => number
  getCategoryInfo: (categoryId: string) => { id: string; name: string; icon: string; description: string }
  frequencies: Array<{ value: string; label: string }>
  searchTerm: string
  isMobile?: boolean
}

const ITEMS_PER_PAGE = 10

/**
 * Cost List Table Component with Pagination
 * Main table view for operational costs list page
 */
export default function CostListTable({
  costs,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onEdit,
  onDelete,
  onView,
  onAdd,
  formatCurrency,
  calculateMonthlyCost,
  getCategoryInfo,
  frequencies,
  searchTerm,
  isMobile = false
}: CostListTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate pagination
  const totalPages = Math.ceil(costs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedCosts = costs.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    void setCurrentPage(1)
  }, [searchTerm])

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Daftar Biaya Operasional
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Kelola biaya operasional dengan mudah
        </p>
      </CardHeader>
      <CardContent>
        {costs.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedItems.length === costs.length && costs.length > 0}
                        onCheckedChange={onSelectAll}
                      />
                    </TableHead>
                    <TableHead>Nama & Kategori</TableHead>
                    <TableHead>Jumlah & Frekuensi</TableHead>
                    <TableHead>Biaya/Bulan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="w-32">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCosts.map((cost) => {
                    const categoryInfo = getCategoryInfo(cost.category)
                    const frequencyLabel = frequencies.find(f => f.value === cost.frequency)?.label || 'Bulanan'

                    return (
                      <TableRow key={cost.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(cost.id)}
                            onCheckedChange={() => onSelectItem(cost.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{cost.name}</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-sm">{categoryInfo.icon}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{categoryInfo.name}</span>
                            </div>
                            {cost.description && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cost.description}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{formatCurrency(cost.amount)}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">per {frequencyLabel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(calculateMonthlyCost(cost))}
                          </span>
                        </TableCell>
                        <TableCell>
                          {cost.isFixed ? (
                            <Badge variant="default" className="text-xs">
                              TETAP
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              VARIABEL
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onView(cost)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onEdit(cost)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => onDelete(cost.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2 py-3">
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Menampilkan {startIndex + 1} - {Math.min(endIndex, costs.length)} dari {costs.length} biaya
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-1">Prev</span>
                  </Button>
                  <div className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    Hal {currentPage}/{totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="h-8"
                  >
                    <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada biaya operasional'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Coba kata kunci lain untuk menemukan biaya operasional'
                : 'Mulai dengan menambahkan biaya operasional seperti listrik, sewa, gaji karyawan, dll'
              }
            </p>
            {!searchTerm && (
              <Button onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Biaya Pertama
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

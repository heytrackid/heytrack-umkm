import { Tags, MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CategoriesTableSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'


import { BulkActions } from './BulkActions'
import { Pagination } from './Pagination'

import type { Category, PageSize } from '../constants'

interface CategoryTableProps {
  // Data
  categories: Category[]
  filteredCategories: Category[]
  paginatedCategories: Category[]
  selectedItems: string[]

  // Pagination
  currentPage: number
  totalPages: number
  pageSize: PageSize
  paginationInfo: {
    startItem: number
    endItem: number
    totalItems: number
  }

  // Loading
  isLoading: boolean

  // Search
  searchTerm: string

  // Actions
  onSelectAll: () => void
  onSelectItem: (itemId: string) => void
   onEdit: (category: Category) => void
   onDelete: (categoryId: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: PageSize) => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  onClearSelection: () => void
}

export const CategoryTable = ({
  filteredCategories,
  paginatedCategories,
  selectedItems,
  currentPage,
  totalPages,
  pageSize,
  paginationInfo,
  isLoading,
  searchTerm,
  onSelectAll,
  onSelectItem,
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange,
  onBulkEdit,
  onBulkDelete,
  onClearSelection
}: CategoryTableProps): JSX.Element => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <CategoriesTableSkeleton rows={8} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          Daftar Kategori Produk
        </CardTitle>
        <p className="text-sm text-gray-600">
          Kelola kategori produk dengan mudah
        </p>
      </CardHeader>
      <CardContent>
        {filteredCategories.length > 0 ? (
          <div className="rounded-md border">
            {/* Bulk Actions */}
            <div className="p-4">
              <BulkActions
                selectedItems={selectedItems}
                filteredCategories={filteredCategories}
                onClearSelection={onClearSelection}
                onBulkEdit={onBulkEdit}
                onBulkDelete={onBulkDelete}
              />
            </div>

            {/* Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.length === filteredCategories.length && filteredCategories.length > 0}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Bahan Baku Umum</TableHead>
                  <TableHead className="w-32">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories.map((category) => (
                  <TableRow key={category['id']} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(category['id'])}
                        onCheckedChange={() => onSelectItem(category['id'])}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>
                        <div>
                          <span className="font-semibold">{category.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-48">
                        {category.commonIngredients.slice(0, 3).map((ingredient, index) => (
                          <Badge key={`${category['id']}-${ingredient}-${index}`} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))}
                        {category.commonIngredients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{category.commonIngredients.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEdit(category)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => onDelete(category['id'])}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={paginationInfo.totalItems}
              startItem={paginationInfo.startItem}
              endItem={paginationInfo.endItem}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          </div>
        ) : (
          <div className="py-12 text-center">
            <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">
              {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada kategori produk'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? 'Coba kata kunci lain untuk menemukan kategori'
                : 'Mulai dengan menambahkan kategori produk pertama'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => {}}>
                <Tags className="h-4 w-4 mr-2" />
                Tambah Kategori Pertama
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card >
  )
}

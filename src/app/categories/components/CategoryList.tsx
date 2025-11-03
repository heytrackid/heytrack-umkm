
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Search, Tags } from 'lucide-react'
import { CategoryTable } from './CategoryTable'
import type {
  Category,
  PageSize
} from '../constants'

interface CategoryListProps {
  // Data
  categories: Category[]
  filteredCategories: Category[]
  paginatedCategories: Category[]
  selectedItems: string[]
  searchTerm: string

  // State
  isMobile: boolean
  isLoading: boolean

  // Pagination
  currentPage: number
  totalPages: number
  pageSize: PageSize
  paginationInfo: {
    startItem: number
    endItem: number
    totalItems: number
  }

  // Actions
  onAddNew: () => void
  onSearchChange: (term: string) => void
  onSelectAll: () => void
  onSelectItem: (itemId: string) => void
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
  onView: (category: Category) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: PageSize) => void
  onBulkEdit: () => void
  onBulkDelete: () => void
  onClearSelection: () => void
}

const CategoryList = ({
  categories,
  filteredCategories,
  paginatedCategories,
  selectedItems,
  searchTerm,
  isMobile,
  isLoading,
  currentPage,
  totalPages,
  pageSize,
  paginationInfo,
  onAddNew,
  onSearchChange,
  onSelectAll,
  onSelectItem,
  onEdit,
  onDelete,
  onView,
  onPageChange,
  onPageSizeChange,
  onBulkEdit,
  onBulkDelete,
  onClearSelection
}: CategoryListProps) => (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            Kategori Produk
          </h1>
          <p className="text-muted-foreground">
            Kelola kategori produk untuk auto-populate bahan baku
          </p>
        </div>
        <Button className={isMobile ? 'w-full' : ''} onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-gray-100 dark:bg-blue-800/50 p-2 rounded-lg">
              <Tags className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                💡 Tentang Kategori Produk
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                Kategori digunakan untuk auto-populate bahan baku saat membuat resep.
                Setiap kategori memiliki daftar bahan baku umum yang akan otomatis ditambahkan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              placeholder="Cari kategori produk..."
            />
          </div>
        </div>

        {/* Category Table */}
        <CategoryTable
          categories={categories}
          filteredCategories={filteredCategories}
          paginatedCategories={paginatedCategories}
          selectedItems={selectedItems}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          paginationInfo={paginationInfo}
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSelectAll={onSelectAll}
          onSelectItem={onSelectItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          onBulkEdit={onBulkEdit}
          onBulkDelete={onBulkDelete}
          onClearSelection={onClearSelection}
        />
      </div>
    </div>
)

export default CategoryList

'use client'

import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { useResponsive } from '@/hooks/useResponsive'

import { useCategories } from './hooks/useCategories'

import type { Category } from './hooks/useCategories'

// Lazy load heavy category components
const CategoryList = dynamic(() => import('./components/CategoryList'), {
  loading: () => <DataGridSkeleton rows={8} />,
  ssr: false
})

const CategoryDialog = dynamic(() => import('./components/CategoryDialog'), {
  loading: () => null,
  ssr: false
})

const CategoriesPage = (): JSX.Element => {
  const { isMobile } = useResponsive()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  // Use the custom hook for all categories logic
  const {
    categories,
    selectedItems,
    searchTerm,
    isLoading,
    currentPage,
    pageSize,
    formData,
    filteredCategories,
    paginatedCategories,
    paginationInfo,
    setSearchTerm,
    setCurrentPage,
    setPageSize,
    setFormData,
    handleSaveCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleSelectAll,
    handleSelectItem,
    handleBulkDelete,
    handleBulkEdit,
    resetForm
  } = useCategories()

  const handleAddCategory = () => {
    resetForm()
    setDialogMode('add')
    setSelectedCategory(null)
    setIsDialogOpen(true)
  }

  const handleEditCategoryDialog = (category: Category) => {
    setFormData(category)
    setDialogMode('edit')
    setSelectedCategory(category)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDialogSave = async () => {
    await handleSaveCategory()
    setIsDialogOpen(false)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Suspense fallback={<DataGridSkeleton rows={8} />}>
          <CategoryList
            categories={categories}
            filteredCategories={filteredCategories}
            paginatedCategories={paginatedCategories}
            selectedItems={selectedItems}
            searchTerm={searchTerm}
            isMobile={isMobile}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={paginationInfo.totalPages}
            pageSize={pageSize}
            paginationInfo={{
              startItem: paginationInfo.startItem,
              endItem: paginationInfo.endItem,
              totalItems: paginationInfo.totalItems
            }}
            onAddNew={handleAddCategory}
            onSearchChange={setSearchTerm}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectItem}
            onEdit={handleEditCategoryDialog}
            onDelete={handleDeleteCategory}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => handleSelectAll()}
          />
        </Suspense>

        <CategoryDialog
          isOpen={isDialogOpen}
          mode={dialogMode}
          category={formData}
          isMobile={isMobile}
          onCategoryChange={setFormData}
          onSave={handleDialogSave}
          onClose={handleDialogClose}
        />
      </div>
    </AppLayout >
  )
}

export default CategoriesPage
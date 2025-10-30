'use client'

import { Fragment, lazy } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { useResponsive } from '@/hooks/useResponsive'
import PrefetchLink from '@/components/ui/prefetch-link'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// Lazy load extracted components for better performance and code splitting
const CategoryList = lazy(() => import('./components/CategoryList'))
const CategoryForm = lazy(() => import('./components/CategoryForm').then(m => ({ default: m.CategoryForm })))

import { useCategories } from './hooks/useCategories'

// Breadcrumb helper
const getBreadcrumbItems = (currentView: string) => [
  { label: "Home", href: '/' },
  { label: "Resep", href: '/recipes' },
  {
    label: "Kategori",
    href: currentView === 'list' ? undefined : '/categories'
  },
  ...(currentView !== 'list' ? [{
    label: currentView === 'add' ? "Tambah Kategori" : "Edit Kategori"
  }] : [])
]

export default function CategoriesPage() {
  const { isMobile } = useResponsive()

  // Use the custom hook for all categories logic
  const {
    categories,
    currentView,
    selectedItems,
    searchTerm,
    isLoading,
    currentPage,
    pageSize,
    formData,
    filteredCategories,
    paginatedCategories,
    paginationInfo,
    setCurrentView,
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
    resetForm,
    handleViewCategory
  } = useCategories()

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems(currentView).map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <PrefetchLink href={item.href}>
                        {item.label}
                      </PrefetchLink>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < getBreadcrumbItems(currentView).length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {currentView === 'list' ? (
          // No Suspense - CategoryList handles its own loading state
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
            onAddNew={() => setCurrentView('add')}
            onSearchChange={setSearchTerm}
            onSelectAll={handleSelectAll}
            onSelectItem={handleSelectItem}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onView={handleViewCategory}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => handleSelectAll()}
          />
        ) : (
          // No Suspense - CategoryForm handles its own loading state
          <CategoryForm
            category={formData}
            currentView={currentView}
            isMobile={isMobile}
            onCategoryChange={setFormData}
            onSave={handleSaveCategory}
            onCancel={() => {
              resetForm()
              void setCurrentView('list')
            }}
          />
        )}
      </div>
    </AppLayout >
  )
}
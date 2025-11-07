'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { Fragment, useEffect, Suspense } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import PrefetchLink from '@/components/ui/prefetch-link'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { useResponsive } from '@/hooks/useResponsive'

import { useCategories } from './hooks/useCategories'

// Lazy load heavy category components
const CategoryList = dynamic(() => import('./components/CategoryList'), {
  loading: () => <DataGridSkeleton rows={8} />,
  ssr: false
})

const CategoryFormSkeleton = (): JSX.Element => (
  <div className="space-y-4">
    <div className="h-16 bg-muted animate-pulse rounded" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-10 bg-muted animate-pulse rounded" />
      ))}
    </div>
    <div className="flex gap-2">
      <div className="h-10 bg-muted animate-pulse rounded w-20" />
      <div className="h-10 bg-muted animate-pulse rounded w-20" />
    </div>
  </div>
)

const CategoryForm = dynamic(() => import('./components/CategoryForm').then(mod => ({ default: mod.CategoryForm })), {
  loading: () => <CategoryFormSkeleton />,
  ssr: false
})

// Breadcrumb helper
const getBreadcrumbItems = (currentView: string): Array<{ label: string; href?: string }> => [
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

const CategoriesPage = (): JSX.Element => {
  const { isMobile } = useResponsive()
  const searchParams = useSearchParams()
  const isAddView = searchParams.get('tambah') !== null

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

  // Set view to 'add' when query parameter exists
  useEffect(() => {
    if (isAddView && currentView === 'list') {
      setCurrentView('add')
    }
  }, [isAddView, currentView, setCurrentView])

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems(currentView).map((item, index) => (
              <Fragment key={item.label}>
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
          </Suspense>
         ) : (
           <Suspense fallback={<CategoryFormSkeleton />}>
            <CategoryForm
              category={formData}
              currentView={currentView}
              isMobile={isMobile}
              onCategoryChange={setFormData}
              onSave={handleSaveCategory}
              onCancel={() => {
                resetForm()
                setCurrentView('list')
              }}
            />
          </Suspense>
        )}
      </div>
    </AppLayout >
  )
}

export default CategoriesPage
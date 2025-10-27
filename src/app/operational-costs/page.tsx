'use client'

import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { DataGridSkeleton, SearchFormSkeleton } from '@/components/ui/skeletons/table-skeletons'
import { useSettings } from '@/contexts/settings-context'
import { toast } from '@/hooks/use-toast'
import { lazy, Suspense } from 'react'

// Lazy load extracted components for better performance and code splitting
const CostFormView = lazy(() => import('./components/CostFormView'))
const CostStats = lazy(() => import('./components/CostStats'))
const BulkActions = lazy(() => import('./components/BulkActions'))
const CostListTable = lazy(() => import('./components/CostListTable'))

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { useResponsive } from '@/hooks/useResponsive'
import {
    Plus,
    Receipt,
    Search,
    Zap
} from 'lucide-react'

import { calculateMonthlyCost, costCategories, frequencies, getCategoryInfo, getTotalMonthlyCosts, useOperationalCosts } from './hooks/useOperationalCosts'

export default function OperationalCostsPage() {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useSettings()

  // Use the custom hook for all operational costs logic
  const {
    costs,
    currentView,
    editingCost,
    selectedItems,
    searchTerm,
    isLoading,
    newCost,
    setNewCost,
    setCurrentView,
    setEditingCost,
    setSelectedItems,
    setSearchTerm,
    fetchCosts,
    handleSaveCost,
    handleEditCost,
    handleDeleteCost,
    handleBulkDelete,
    handleQuickSetup,
    resetForm,
    handleSelectAll,
    handleSelectItem,
    filteredCosts
  } = useOperationalCosts()

  // Breadcrumb items
  const getBreadcrumbItems = () => {
    const items: Array<{ label: string; href?: string }> = [
      { label: 'Dashboard', href: '/' },
      { label: 'Biaya Operasional', href: currentView === 'list' ? undefined : '/operational-costs' }
    ]
    
    if (currentView !== 'list') {
      items.push({ 
        label: currentView === 'add' ? 'Tambah Biaya' : 'Edit Biaya',
        href: undefined
      })
    }
    
    return items
  }

  // Render loading skeleton for list view
  if (currentView === 'list' && isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbItems().map((item, index: number) => (
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
                  {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
              {Array.from({ length: 3 }, (_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>

            {/* Info Card Skeleton */}
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

            {/* Search Form Skeleton */}
            <SearchFormSkeleton />

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-gray-800 border rounded-lg">
              <div className="p-6">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mb-4" />
                <DataGridSkeleton rows={6} />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbItems().map((item, index: number) => (
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
                {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Form View */}
        {currentView !== 'list' ? (
          <Suspense fallback={<div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />}>
            <CostFormView
              currentView={currentView}
              newCost={newCost}
              setNewCost={setNewCost}
              onSave={handleSaveCost}
              onCancel={() => {
                resetForm()
                void setCurrentView('list')
              }}
              isLoading={isLoading}
              costCategories={costCategories}
              frequencies={frequencies}
            />
          </Suspense>
        ) : (
          /* List View */
          <div className="space-y-6">
            {/* Header */}
            <div className={`flex gap-4 ${isMobile ? 'flex-col items-center text-center' : 'justify-between items-center'}`}>
              <div className={isMobile ? 'text-center' : ''}>
                <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
                  Biaya Operasional
                </h1>
                <p className="text-muted-foreground">
                  Kelola semua biaya operasional bisnis Anda
                </p>
              </div>
              <div className={`flex ${isMobile ? 'w-full flex-col gap-2' : 'items-center gap-2'}`}>
                <Button className={isMobile ? 'w-full' : ''} onClick={() => setCurrentView('add')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Biaya
                </Button>
                <Button 
                  variant="outline" 
                  className={isMobile ? 'w-full' : ''}
                  onClick={handleQuickSetup}
                  disabled={isLoading}
                  title="Setup Cepat Biaya Operasional"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Setup Cepat
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <Suspense fallback={
              <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
                {Array.from({ length: 3 }, (_, i) => (<StatsCardSkeleton key={i} />))}
              </div>
            }>
              <CostStats
                totalCosts={costs.length}
                fixedCosts={costs.filter(c => c.isFixed).length}
                totalMonthly={getTotalMonthlyCosts(costs)}
                formatCurrency={formatCurrency}
                isMobile={isMobile}
              />
            </Suspense>

            {/* Info Card */}
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 dark:bg-orange-800/50 p-2 rounded-lg">
                    <Receipt className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                      💡 Mengapa Biaya Operasional Penting?
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Biaya operasional digunakan untuk menghitung harga jual yang akurat. 
                      Semakin lengkap data biaya, semakin tepat perhitungan harga jual produk Anda.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    placeholder="Cari biaya operasional..."
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              <Suspense fallback={null}>
                <BulkActions
                  selectedItems={selectedItems}
                  costs={filteredCosts}
                  onClearSelection={() => setSelectedItems([])}
                  onBulkEdit={() => toast('Fitur bulk edit akan segera tersedia', { icon: 'ℹ️' })}
                  onBulkDelete={handleBulkDelete}
                />
              </Suspense>
            </div>

            {/* Operational Costs Table */}
            <Suspense fallback={<DataGridSkeleton rows={10} />}>
              <CostListTable
                costs={filteredCosts}
                selectedItems={selectedItems}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectItem}
                onEdit={handleEditCost}
                onDelete={handleDeleteCost}
                onView={(cost) => toast(`Melihat detail: ${cost.name}`, { icon: '👁️' })}
                onAdd={() => setCurrentView('add')}
                formatCurrency={formatCurrency}
                calculateMonthlyCost={calculateMonthlyCost}
                getCategoryInfo={getCategoryInfo}
                frequencies={frequencies}
                searchTerm={searchTerm}
                isMobile={isMobile}
              />
            </Suspense>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

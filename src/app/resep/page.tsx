'use client'

/**
 * Recipe Management Page - Code Split Version
 * 
 * This page has been optimized with code splitting and lazy loading for better performance.
 * Components are split into separate files and loaded dynamically as needed.
 */

import React, { Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'

// Lazy loaded components and hooks
import { useRecipeLogic } from './hooks/useRecipeLogic'
import { 
  LazyRecipeList, 
  LazyRecipeForm,
  RecipePageWithProgressiveLoading 
} from './components/LazyComponents'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

export default function ProductionPage() {
  const {
    // Data
    recipes,
    ingredients,
    loading,
    currentView,
    selectedRecipe,
    selectedItems,
    searchTerm,
    newRecipe,
    
    // Actions
    setCurrentView,
    setSearchTerm,
    setNewRecipe,
    handleSaveRecipe,
    handleEditRecipe,
    handleViewRecipe,
    handleDeleteRecipe,
    handleSelectItem,
    handleSelectAll,
    resetForm,
    refetch,
    getBreadcrumbItems
  } = useRecipeLogic()

  return (
    <AppLayout>
      <RecipePageWithProgressiveLoading currentView={currentView}>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbItems().map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.href ? (
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < getBreadcrumbItems().length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          
          {/* Recipe List View */}
          {currentView === 'list' && (
            <Suspense fallback={<DataGridSkeleton rows={8} />}>
              <LazyRecipeList
                recipes={recipes}
                ingredients={ingredients}
                loading={loading}
                searchTerm={searchTerm}
                selectedItems={selectedItems}
                onSearchChange={setSearchTerm}
                onSelectItem={handleSelectItem}
                onSelectAll={handleSelectAll}
                onRefresh={refetch}
                onAddNew={() => setCurrentView('add')}
                onViewRecipe={handleViewRecipe}
                onEditRecipe={handleEditRecipe}
                onDeleteRecipe={handleDeleteRecipe}
              />
            </Suspense>
          )}
          
          {/* Recipe Add/Edit Form */}
          {(currentView === 'add' || currentView === 'edit') && (
            <Suspense fallback={<DataGridSkeleton rows={6} />}>
              <LazyRecipeForm
                recipe={newRecipe}
                ingredients={ingredients}
                isEditing={currentView === 'edit'}
                onRecipeChange={setNewRecipe}
                onSave={handleSaveRecipe}
                onCancel={() => {
                  resetForm()
                  setCurrentView('list')
                }}
              />
            </Suspense>
          )}
        </div>
      </RecipePageWithProgressiveLoading>
    </AppLayout>
  )
}

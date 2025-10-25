'use client'
import * as React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'

/**
 * Recipe Management Page - Code Split Version
 * 
 * This page has been optimized with code splitting and lazy loading for better performance.
 * Components are split into separate files and loaded dynamically as needed.
 */

import AppLayout from '@/components/layout/app-layout'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { Sparkles } from 'lucide-react'
import { Suspense } from 'react'

// Lazy loaded components and hooks
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'
import {
  LazyRecipeForm,
  LazyRecipeList,
  RecipePageWithProgressiveLoading
} from './components/LazyComponents'
import { useRecipeLogic } from './hooks/useRecipeLogic'

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

  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <PrefetchLink href="/">Dashboard</PrefetchLink>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Resep</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold">Resep</h1>
          <DataGridSkeleton rows={8} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <RecipePageWithProgressiveLoading currentView={currentView}>
        <div className="space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              {getBreadcrumbItems().map((item, index: number) => (
                <React.Fragment key={index}>
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
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header with AI Generator Button */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Resep</h1>
            <PrefetchLink href="/recipes/ai-generator">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Resep AI
              </Button>
            </PrefetchLink>
          </div>

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

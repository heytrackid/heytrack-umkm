'use client'

import { useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import AppLayout from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { Sparkles, Plus } from 'lucide-react'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Import from recipes components
import {
    LazyRecipeForm,
    LazyRecipeList,
    RecipePageWithProgressiveLoading
} from './components/LazyComponents'
import { useRecipeLogic } from './hooks/useRecipeLogic'

/**
 * Recipes Management Page - Improved UX Version
 * 
 * Combines the best of both worlds:
 * - Modern UI from RecipesPage component
 * - Full CRUD functionality from resep
 * - Better UX with improved empty states and actions
 */
export default function RecipesListPage() {
    const {
        recipes,
        ingredients,
        loading,
        currentView,
        searchTerm,
        selectedItems,
        newRecipe,
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

    // Show loading state
    if (isAuthLoading) {
        return (
            <AppLayout pageTitle="Recipes Management">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Resep Produk</h1>
                            <p className="text-muted-foreground">
                                Kelola resep dan hitung HPP dengan sistem otomatis
                            </p>
                        </div>
                    </div>
                    <DataGridSkeleton rows={8} />
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout pageTitle="Recipes Management">
            <RecipePageWithProgressiveLoading currentView={currentView}>
                <div className="space-y-6">
                    {/* Improved Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold">Resep Produk</h1>
                            <p className="text-muted-foreground">
                                Kelola resep dan hitung HPP dengan sistem otomatis
                            </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            {currentView === 'list' && (
                                <>
                                    <Button
                                        onClick={() => setCurrentView('add')}
                                        className="flex-1 sm:flex-none"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Resep Baru
                                    </Button>
                                    <PrefetchLink href="/recipes/ai-generator">
                                        <Button variant="outline" className="gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            AI Generator
                                        </Button>
                                    </PrefetchLink>
                                </>
                            )}
                        </div>
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

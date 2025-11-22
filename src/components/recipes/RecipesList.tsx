'use client'

import {
    AlertCircle,
    Calculator,
    Clock,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    RefreshCw,
    Search,
    Sparkles,
    Trash2,
    Users,
    X
} from '@/components/icons'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { RecipesLoading } from '@/components/loading'
import { MobileRecipeCard } from '@/components/recipes/MobileRecipeCard'
import { RecipeFormDialog } from '@/components/recipes/RecipeFormDialog'
import { RecipeStatsCards } from '@/components/recipes/RecipeStatsCards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'
import { FilterBadges, createFilterBadges } from '@/components/ui/filter-badges'
import { DeleteModal } from '@/components/ui/index'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { SimplePagination } from '@/components/ui/simple-pagination'
import { toast } from '@/components/ui/toast'
import { usePagination } from '@/hooks/usePagination'
import { useRecipesCostPreviews } from '@/hooks/useRecipeCostPreview'
import { useDeleteRecipe, useRecipes } from '@/hooks/useRecipes'
import { useResponsive } from '@/hooks/useResponsive'
import { handleError } from '@/lib/error-handling'

import type { Recipe } from '@/types/database'
import { isNonNull, isRecipe } from '@/types/shared/guards'

type DifficultyFilter = 'all' | 'easy' | 'hard' | 'medium'

// Type guard for recipe array
const isRecipeArray = (data: unknown): data is Recipe[] => {
    return Array.isArray(data) && data.every(isRecipe)
}

const RecipesListComponent = () => {
    const router = useRouter()
    const { data: recipesData = [], isLoading: loading, error, refetch, isFetching } = useRecipes()
    const deleteRecipeMutation = useDeleteRecipe()

    const { isMobile } = useResponsive()

    // Extract recipes array from API response with type guard
    const recipes = useMemo(() => {
        if (!recipesData || !isRecipeArray(recipesData)) {
            return []
        }
        return recipesData
    }, [recipesData])

    // Get recipe IDs for cost preview
    const recipeIds = useMemo(() => {
        if (!recipes || !isRecipeArray(recipes)) return []
        return recipes.map(r => r.id)
    }, [recipes])

    // Fetch cost previews for all recipes
    const { data: costPreviews } = useRecipesCostPreviews(recipeIds)

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')

    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
    const [prepTimeMin, setPrepTimeMin] = useState<number | ''>('')
    const [prepTimeMax, setPrepTimeMax] = useState<number | ''>('')
    const [pageSize, setPageSize] = useState(12)

    // Filter and sort data with proper type guards
    const filteredData = useMemo(() => {
        if (!recipes || !isRecipeArray(recipes)) { 
            return [] 
        }

        return recipes
            .filter((recipe: Recipe) => {
                // Type guard for recipe
                if (!isRecipe(recipe)) {
                    return false
                }

                // Search filter with null safety
                const recipeName = recipe.name ?? ''
                const recipeDescription = recipe.description ?? ''
                const matchesSearch =
                    !searchTerm ||
                    recipeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    recipeDescription.toLowerCase().includes(searchTerm.toLowerCase())

                // Difficulty filter with proper type narrowing
                const recipeDifficulty = recipe.difficulty ?? 'medium'
                const matchesDifficulty =
                    difficultyFilter === 'all' || recipeDifficulty === difficultyFilter

                // Prep time filter with null safety
                const prepTime = recipe.prep_time ?? 0
                const cookTime = recipe.cook_time ?? 0
                const totalTime = prepTime + cookTime
                const matchesPrepTime =
                    (prepTimeMin === '' || totalTime >= prepTimeMin) &&
                    (prepTimeMax === '' || totalTime <= prepTimeMax)

                // Only show active recipes with null safety
                const isActive = recipe.is_active ?? false
                return matchesSearch && matchesDifficulty && matchesPrepTime && isActive
            })
            .sort((a: Recipe, b: Recipe) => {
                const nameA = a.name ?? ''
                const nameB = b.name ?? ''
                return nameA.localeCompare(nameB)
            })
    }, [recipes, searchTerm, difficultyFilter, prepTimeMin, prepTimeMax])

    // Pagination
    const pagination = usePagination({
        initialPageSize: pageSize,
        totalItems: filteredData.length,
    })

    // Get paginated data
    const paginatedData = useMemo(() => filteredData.slice(pagination.startIndex, pagination.endIndex), [filteredData, pagination.startIndex, pagination.endIndex])

    // Update page size
    const handlePageSizeChange = useCallback((newSize: number) => {
        setPageSize(newSize)
        pagination.setPageSize(newSize)
    }, [pagination])

    // Create filter badges
    const activeFilters = createFilterBadges(
        {
            search: searchTerm,
            difficulty: difficultyFilter,
            prepTimeMin: prepTimeMin ? `Min ${prepTimeMin}min` : '',
            prepTimeMax: prepTimeMax ? `Max ${prepTimeMax}min` : ''
        },
        {
            search: 'Search',
            difficulty: 'Difficulty',
            prepTimeMin: 'Prep Time Min',
            prepTimeMax: 'Prep Time Max'
        },
        (newFilters) => {
            if (newFilters.search !== undefined) {
                setSearchTerm(newFilters.search)
            }
            if (newFilters.difficulty !== undefined) {
                setDifficultyFilter(newFilters.difficulty)
            }
            if (newFilters.prepTimeMin !== undefined) {
                setPrepTimeMin(newFilters.prepTimeMin ? parseInt(newFilters.prepTimeMin) : '')
            }
            if (newFilters.prepTimeMax !== undefined) {
                setPrepTimeMax(newFilters.prepTimeMax ? parseInt(newFilters.prepTimeMax) : '')
            }
        }
    )

    const handleClearAllFilters = useCallback(() => {
        setSearchTerm('')
        setDifficultyFilter('all')
        setPrepTimeMin('')
        setPrepTimeMax('')
    }, [])

    // Handlers with proper type annotations
    const handleView = useCallback((recipe: Recipe): void => {
        if (!isRecipe(recipe) || !recipe.id) {
            return
        }
        router.push(`/recipes/${recipe.id}`)
    }, [router])

    const handleAdd = useCallback((): void => {
        setEditingRecipe(undefined)
        setShowAddDialog(true)
    }, [])

    const handleEdit = useCallback((recipe: Recipe): void => {
        if (!isRecipe(recipe)) {
            return
        }
        setEditingRecipe(recipe)
        setShowAddDialog(true)
    }, [])

    const handleDelete = useCallback((recipe: Recipe): void => {
        if (!isRecipe(recipe)) {
            return
        }
        setSelectedRecipe(recipe)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleCalculateHPP = useCallback((recipe: Recipe): void => {
        if (!isRecipe(recipe) || !recipe.id) {
            return
        }
        router.push(`/hpp?recipe=${recipe.id}`)
    }, [router])

    const handleConfirmDelete = useCallback(async (): Promise<void> => {
        if (!selectedRecipe || !isRecipe(selectedRecipe)) { 
            return 
        }

        try {
            const deletedRecipe = selectedRecipe
            const recipeId = deletedRecipe.id
            const recipeName = deletedRecipe.name ?? 'Resep'

            if (!recipeId) {
                handleError(new Error('Validation: ID resep tidak valid'), 'Recipes List: delete validation', true, 'ID resep tidak valid')
                return
            }

            await deleteRecipeMutation.mutateAsync(recipeId)

            // Success toast without undo
            toast({
                title: `${recipeName} dihapus`,
                description: 'Resep telah dihapus dari sistem',
                type: 'success'
            })

            setIsDeleteDialogOpen(false)
            setSelectedRecipe(null)
        } catch (error) {
            handleError(error as Error, 'Recipes List: delete recipe', true, 'Gagal menghapus resep')
        }
    }, [selectedRecipe, deleteRecipeMutation])

    const clearFilters = (): void => {
        setSearchTerm('')
        setDifficultyFilter('all')
        setPrepTimeMin('')
        setPrepTimeMax('')
    }

    const hasActiveFilters =
        searchTerm || difficultyFilter !== 'all' || prepTimeMin !== '' || prepTimeMax !== ''

    // Helper functions with proper type annotations and null safety
    const getDifficultyColor = (difficulty: string | null | undefined): string => {
        const validDifficulty = difficulty ?? 'medium'
        
        switch (validDifficulty) {
            case 'easy':
                return 'bg-muted text-muted-foreground'
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'hard':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-muted text-muted-foreground'
        }
    }

    const getDifficultyLabel = (difficulty: string | null | undefined): string => {
        const validDifficulty = difficulty ?? 'medium'
        
        switch (validDifficulty) {
            case 'easy':
                return 'Mudah'
            case 'medium':
                return 'Sedang'
            case 'hard':
                return 'Sulit'
            default:
                return validDifficulty
        }
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Dashboard</span>
                <span>/</span>
                <span className="text-foreground font-medium">Resep Produk</span>
            </div>

            {/* Header */}
            <PageHeader
                title="Resep Produk"
                description="Kelola resep dan hitung HPP dengan sistem otomatis"
                action={
                    <div className="flex gap-2">
                        <Button onClick={handleAdd}>
                            <Plus className="h-4 w-4 mr-2" />
                            Resep Baru
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push('/recipes/ai-generator')}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Generator
                        </Button>
                    </div>
                }
            />

            {error ? (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <div>
                                    <p className="font-semibold">Gagal memuat data resep</p>
                                    <p className="text-sm text-muted-foreground">Silakan coba lagi atau periksa koneksi internet Anda.</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => { void refetch() }}
                                disabled={isFetching}
                                className="self-start"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                                Coba Lagi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
            {/* Stats Cards */}
            <RecipeStatsCards recipes={recipes || []} />

            {/* Search and Filter Bar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari resep..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                    setSearchTerm(e.target.value)
                                }}
                                className="pl-9"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">


                            <Select
                                value={difficultyFilter}
                                onValueChange={(value: string): void => {
                                    setDifficultyFilter(value as DifficultyFilter)
                                }}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Tingkat Kesulitan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Tingkat</SelectItem>
                                    <SelectItem value="easy">Mudah</SelectItem>
                                    <SelectItem value="medium">Sedang</SelectItem>
                                    <SelectItem value="hard">Sulit</SelectItem>
                                </SelectContent>
                             </Select>

                             <div className="flex gap-2">
                                 <Input
                                     type="number"
                                     placeholder="Min waktu (menit)"
                                     value={prepTimeMin}
                                     onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                         const value = e.target.value
                                         setPrepTimeMin(value ? parseInt(value, 10) : '')
                                     }}
                                     className="w-32"
                                 />
                                 <Input
                                     type="number"
                                     placeholder="Max waktu (menit)"
                                     value={prepTimeMax}
                                     onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                                         const value = e.target.value
                                         setPrepTimeMax(value ? parseInt(value, 10) : '')
                                     }}
                                     className="w-32"
                                 />
                             </div>

                             {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={handleClearAllFilters}>
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Active Filter Badges */}
                        <FilterBadges 
                            filters={activeFilters}
                            onClearAll={handleClearAllFilters}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Ditemukan {filteredData.length} resep
                    {activeFilters.length > 0 && ` (${activeFilters.length} filter aktif)`}
                </p>
            </div>

            {/* Recipe List */}
            {loading ? (
                <RecipesLoading />
            ) : filteredData.length === 0 ? (
                <>
                    {/* Empty state - no data at all */}
                    {!recipes || recipes.length === 0 ? (
                        <EmptyState
                            {...EmptyStatePresets.recipes}
                            actions={[
                                {
                                    label: 'Buat Resep Baru',
                                    onClick: handleAdd,
                                    icon: Plus
                                },
                                {
                                    label: 'Gunakan AI Generator',
                                    onClick: () => router.push('/recipes/ai-generator'),
                                    variant: 'outline',
                                    icon: Sparkles
                                }
                            ]}
                        />
                    ) : (
                        /* Empty state - filtered results */
                        <Card className="border-dashed">
                            <CardContent className="p-8">
                                <div className="text-center">
                                    <div className="rounded-full bg-muted flex items-center justify-center mb-4 w-16 h-16 mx-auto">
                                        <Search className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-semibold text-foreground mb-2 text-lg">
                                        Tidak Ada Hasil
                                    </h3>
                                    <p className="text-muted-foreground mb-6 text-sm">
                                        Coba gunakan kata kunci yang berbeda atau filter lain.
                                    </p>
                                    <Button variant="outline" onClick={clearFilters}>
                                        <X className="h-4 w-4 mr-2" />
                                        Hapus Filter
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : isMobile ? (
                <div className="space-y-3">
                    {paginatedData.map((recipe: Recipe) => (
                        <MobileRecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            costPreview={costPreviews?.[recipe.id] || null}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCalculateHPP={handleCalculateHPP}

                            getDifficultyColor={getDifficultyColor}
                            getDifficultyLabel={getDifficultyLabel}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedData.map((recipe: Recipe) => (
                        <Card
                            key={recipe.id}
                            className="transition-all cursor-pointer"
                            onClick={(): void => {
                                handleView(recipe)
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{recipe.name}</h3>
                                            </div>
                                            {isNonNull(recipe.description) && recipe.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {recipe.description}
                                                </p>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent<HTMLButtonElement>): void => {
                                                e.stopPropagation()
                                            }}>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                                    e.stopPropagation()
                                                    handleView(recipe)
                                                }}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Lihat Detail
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                                     e.stopPropagation()
                                                     handleEdit(recipe)
                                                 }}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                                      e.stopPropagation()
                                                      handleCalculateHPP(recipe)
                                                  }}>
                                                     <Calculator className="h-4 w-4 mr-2" />
                                                     Hitung HPP
                                                 </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                 <DropdownMenuItem
                                                     onClick={(e: React.MouseEvent<HTMLDivElement>): void => {
                                                         e.stopPropagation()
                                                         handleDelete(recipe)
                                                     }}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Hapus
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Info Badges */}
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {recipe.servings} porsi
                                        </Badge>
                                        <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {(recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)} menit
                                        </Badge>
                                         <Badge className={getDifficultyColor(recipe.difficulty ?? 'medium')}>
                                             {getDifficultyLabel(recipe.difficulty ?? 'medium')}
                                         </Badge>
                                     </div>

                                     {/* Quick Actions */}
                                     <div className="flex gap-2 mt-3">
                                         <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={(e: React.MouseEvent<HTMLButtonElement>): void => { 
                                                 e.stopPropagation()
                                                 handleEdit(recipe)
                                             }}
                                             className="flex-1"
                                         >
                                             <Edit className="h-3 w-3 mr-1" />
                                             Edit
                                         </Button>
                                         <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={(e: React.MouseEvent<HTMLButtonElement>): void => { 
                                                 e.stopPropagation()
                                                 handleCalculateHPP(recipe)
                                             }}
                                             className="flex-1"
                                         >
                                             <Calculator className="h-3 w-3 mr-1" />
                                             HPP
                                         </Button>
                                     </div>
                                 </div>
                             </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {
                filteredData.length > 0 && (
                    <SimplePagination
                        page={pagination.page}
                        pageSize={pagination.pageSize}
                        totalPages={pagination.totalPages}
                        totalItems={filteredData.length}
                        startIndex={pagination.startIndex}
                        endIndex={pagination.endIndex}
                        onPageChange={pagination.setPage}
                        onPageSizeChange={handlePageSizeChange}
                        canNextPage={pagination.canNextPage}
                        canPrevPage={pagination.canPrevPage}
                        pageSizeOptions={[12, 24, 48, 96]}
                    />
                )
            }
            </>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false)
                    setSelectedRecipe(null)
                }}
                onConfirm={handleConfirmDelete}
                entityName="Resep"
                itemName={selectedRecipe?.name ?? ''}
            />

            {/* Recipe Form Dialog */}
            <RecipeFormDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                recipe={editingRecipe}
            />


        </div >
    )
}

// Memoized export for performance
export const RecipesList = memo(RecipesListComponent)
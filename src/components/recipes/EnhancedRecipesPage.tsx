 
'use client'

import {
    Calculator,
    Clock,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    Search,
    Sparkles,
    Trash2,
    Users,
    X
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
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
import { undoableToast } from '@/components/ui/enhanced-toast'
import { FilterBadges, createFilterBadges } from '@/components/ui/filter-badges'
import { SimpleFAB } from '@/components/ui/floating-action-button'
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
import { useSupabaseCRUD } from '@/hooks/supabase/index'
import { useToast } from '@/hooks/use-toast'
import { usePagination } from '@/hooks/usePagination'
import { useRecipes } from '@/hooks/useRecipes'
import { useResponsive } from '@/hooks/useResponsive'

import type { Row } from '@/types/database'

import { MobileRecipeCard } from '@/components/recipes/MobileRecipeCard'
import { RecipeFormDialog } from '@/components/recipes/RecipeFormDialog'
import { RecipeStatsCards } from '@/components/recipes/RecipeStatsCards'




// import { useSettings } from '@/contexts/settings-context'


// UI Components

// Feature Components

// Hooks

// Components

// Types

type Recipe = Row<'recipes'>

type DifficultyFilter = 'all' | 'easy' | 'hard' | 'medium'

export const EnhancedRecipesPage = (): JSX.Element => {
    const router = useRouter()
    const { data: recipes, isLoading: loading } = useRecipes()
    const { remove: deleteRecipe } = useSupabaseCRUD('recipes')
    const { toast } = useToast()
    const { isMobile } = useResponsive()

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editingRecipe, setEditingRecipe] = useState<Recipe | undefined>(undefined)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')

    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
    const [pageSize, setPageSize] = useState(12)

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!recipes) { return [] }

        return recipes
            .filter((recipe: Recipe) => {
                // Search filter
                const matchesSearch =
                    !searchTerm ||
                    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

                // Difficulty filter
                const matchesDifficulty =
                    difficultyFilter === 'all' || (recipe.difficulty ?? 'medium') === difficultyFilter

                // Only show active recipes
                return matchesSearch && matchesDifficulty && recipe.is_active
            })
            .sort((a: Recipe, b: Recipe) => a.name.localeCompare(b.name))
    }, [recipes, searchTerm, difficultyFilter])

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
            difficulty: difficultyFilter
        },
        {
            search: 'Search',
            difficulty: 'Difficulty'
        },
        (newFilters) => {
            if (newFilters.search !== undefined) {
                setSearchTerm(newFilters.search)
            }
            if (newFilters.difficulty !== undefined) {
                setDifficultyFilter(newFilters.difficulty)
            }
        }
    )

    const handleClearAllFilters = useCallback(() => {
        setSearchTerm('')
        setDifficultyFilter('all')
    }, [])

    // Handlers
    const handleView = useCallback((recipe: Recipe) => {
        router.push(`/recipes/${recipe['id']}`)
    }, [router])

    const handleAdd = useCallback(() => {
        setEditingRecipe(undefined)
        setShowAddDialog(true)
    }, [])

    const handleEdit = useCallback((recipe: Recipe) => {
        setEditingRecipe(recipe)
        setShowAddDialog(true)
    }, [])

    const handleDelete = useCallback((recipe: Recipe) => {
        setSelectedRecipe(recipe)
        setIsDeleteDialogOpen(true)
    }, [])

    const handleCalculateHPP = useCallback((recipe: Recipe) => {
        router.push(`/hpp?recipe=${recipe['id']}`)
    }, [router])

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedRecipe) { return }

        try {
            const deletedRecipe = selectedRecipe
            await deleteRecipe(selectedRecipe['id'])

            // Enhanced toast with undo
            undoableToast({
                title: `${deletedRecipe.name} dihapus`,
                description: 'Resep telah dihapus dari sistem',
                onUndo: () => {
                    // Note: Would need an undelete API endpoint
                    toast({
                        title: 'Fitur undo sedang dikembangkan',
                        description: 'Anda bisa membuat ulang resep ini',
                    })
                },
                duration: 6000
            })

            setIsDeleteDialogOpen(false)
            setSelectedRecipe(null)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus resep'
            toast({
                title: 'Gagal menghapus resep',
                description: message,
                variant: 'destructive',
            })
        }
    }, [selectedRecipe, deleteRecipe, toast])

    const clearFilters = () => {
        setSearchTerm('')
        setDifficultyFilter('all')
    }

    const hasActiveFilters =
        searchTerm || difficultyFilter !== 'all'

    // Helper functions


    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
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

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'Mudah'
            case 'medium':
                return 'Sedang'
            case 'hard':
                return 'Sulit'
            default:
                return difficulty
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">


                            <Select
                                value={difficultyFilter}
                                onValueChange={(value) => setDifficultyFilter(value as DifficultyFilter)}
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 6}).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-muted rounded animate-pulse" />
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-muted rounded animate-pulse w-16" />
                                        <div className="h-6 bg-muted rounded animate-pulse w-16" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
                            key={recipe['id']}
                            recipe={recipe}
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
                            key={recipe['id']}
                            className="transition-all cursor-pointer"
                            onClick={() => handleView(recipe)}
                        >
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg">{recipe.name}</h3>
                                            </div>
                                            {recipe.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {recipe.description}
                                                </p>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                                    e.stopPropagation()
                                                    handleView(recipe)
                                                }}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Lihat Detail
                                                </DropdownMenuItem>
                                                 <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                                                     e.stopPropagation()
                                                     handleEdit(recipe)
                                                 }}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                  <DropdownMenuItem onClick={(e: React.MouseEvent<HTMLElement>) => {
                                                      e.stopPropagation()
                                                      handleCalculateHPP(recipe)
                                                  }}>
                                                     <Calculator className="h-4 w-4 mr-2" />
                                                     Hitung HPP
                                                 </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                 <DropdownMenuItem
                                                     onClick={(e: React.MouseEvent<HTMLElement>) => {
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

            {/* Floating Action Button for Mobile */}
            {isMobile && (
                <SimpleFAB
                    onClick={handleAdd}
                    icon={<Plus className="h-6 w-6" />}
                />
            )}
        </div >
    )
}



'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
// import { useSettings } from '@/contexts/settings-context'
import { useToast } from '@/hooks/use-toast'
import { useResponsive } from '@/hooks/useResponsive'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    Plus,
    Sparkles,
    MoreVertical,
    Edit,
    Trash2,
    Calculator,
    Eye,
    Clock,
    Users,
    X
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

// Feature Components
import { MobileRecipeCard } from './MobileRecipeCard'
import { RecipeStatsCards } from './RecipeStatsCards'
import { DeleteModal } from '@/components/ui'
import { EmptyState, EmptyStatePresets } from '@/components/ui/empty-state'

// Hooks
import { useRecipes } from '@/hooks/supabase/entities'
import { useSupabaseCRUD } from '@/hooks/supabase'
import { usePagination } from '@/hooks/usePagination'

// Components
import { SimplePagination } from '@/components/ui/simple-pagination'

// Types
import type { RecipesTable } from '@/types/database'

type Recipe = RecipesTable
type CategoryFilter = 'all' | 'bread' | 'pastry' | 'cake' | 'cookie' | 'other'
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard'

export const EnhancedRecipesPage = () => {
    const router = useRouter()
    const { data: recipes, loading } = useRecipes({ realtime: true })
    const { delete: deleteRecipe } = useSupabaseCRUD('recipes')
    const { toast } = useToast()
    const { isMobile } = useResponsive()

    // Modal states
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
    const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')
    const [pageSize, setPageSize] = useState(12)

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!recipes) { return [] }

        return recipes
            .filter((recipe) => {
                // Search filter
                const matchesSearch =
                    !searchTerm ||
                    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

                // Category filter
                const matchesCategory =
                    categoryFilter === 'all' || (recipe.category ?? 'other') === categoryFilter

                // Difficulty filter
                const matchesDifficulty =
                    difficultyFilter === 'all' || (recipe.difficulty ?? 'medium') === difficultyFilter

                // Only show active recipes
                return matchesSearch && matchesCategory && matchesDifficulty && recipe.is_active
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    }, [recipes, searchTerm, categoryFilter, difficultyFilter])

    // Pagination
    const pagination = usePagination({
        initialPageSize: pageSize,
        totalItems: filteredData.length,
    })

    // Get paginated data
    const paginatedData = useMemo(() => filteredData.slice(pagination.startIndex, pagination.endIndex), [filteredData, pagination.startIndex, pagination.endIndex])

    // Update page size
    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize)
        pagination.setPageSize(newSize)
    }

    // Handlers
    const handleView = (recipe: Recipe) => {
        router.push(`/recipes/${recipe.id}`)
    }

    const handleEdit = (recipe: Recipe) => {
        router.push(`/recipes/${recipe.id}/edit`)
    }

    const handleDelete = (recipe: Recipe) => {
        setSelectedRecipe(recipe)
        setIsDeleteDialogOpen(true)
    }

    const handleCalculateHPP = (recipe: Recipe) => {
        router.push(`/hpp?recipe=${recipe.id}`)
    }

    const handleConfirmDelete = async () => {
        if (!selectedRecipe) { return }

        try {
            await deleteRecipe(selectedRecipe.id)
            toast({
                title: 'Resep dihapus',
                description: `${selectedRecipe.name} berhasil dihapus`,
            })
            setIsDeleteDialogOpen(false)
            setSelectedRecipe(null)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menghapus resep'
            toast({
                title: 'Gagal menghapus resep',
                description: message,
                variant: 'destructive',
            })
        }
    }

    const clearFilters = () => {
        setSearchTerm('')
        setCategoryFilter('all')
        setDifficultyFilter('all')
    }

    const hasActiveFilters =
        searchTerm || categoryFilter !== 'all' || difficultyFilter !== 'all'

    // Helper functions
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'bread':
                return '🍞'
            case 'pastry':
                return '🥐'
            case 'cake':
                return '🍰'
            case 'cookie':
                return '🍪'
            default:
                return '👩‍🍳'
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            case 'hard':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
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
                        <Button onClick={() => router.push('/recipes/new')}>
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select
                                value={categoryFilter}
                                onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
                            >
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    <SelectItem value="bread">🍞 Roti</SelectItem>
                                    <SelectItem value="pastry">🥐 Pastry</SelectItem>
                                    <SelectItem value="cake">🍰 Kue</SelectItem>
                                    <SelectItem value="cookie">🍪 Cookie</SelectItem>
                                    <SelectItem value="other">👩‍🍳 Lainnya</SelectItem>
                                </SelectContent>
                            </Select>

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
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="h-4 w-4 mr-2" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Count */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Ditemukan {filteredData.length} resep
                </p>
            </div>

            {/* Recipe List */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
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
                                    onClick: () => router.push('/recipes/new'),
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
                    {paginatedData.map((recipe) => (
                        <MobileRecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onCalculateHPP={handleCalculateHPP}
                            getCategoryIcon={getCategoryIcon}
                            getDifficultyColor={getDifficultyColor}
                            getDifficultyLabel={getDifficultyLabel}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedData.map((recipe) => (
                        <Card
                            key={recipe.id}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleView(recipe)}
                        >
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{getCategoryIcon(recipe.category ?? 'other')}</span>
                                                <h3 className="font-semibold text-lg">{recipe.name}</h3>
                                            </div>
                                            {recipe.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {recipe.description}
                                                </p>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleView(recipe)
                                                }}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Lihat Detail
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleEdit(recipe)
                                                }}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleCalculateHPP(recipe)
                                                }}>
                                                    <Calculator className="h-4 w-4 mr-2" />
                                                    Hitung HPP
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={(e) => {
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
                itemName={selectedRecipe?.name || ''}
            />
        </div >
    )
}

'use client'

import {
    Calculator,
    ChefHat,
    ChevronDown,
    ChevronUp,
    Clock,
    Edit,
    Factory,
    Printer,
    Share2,
    Trash2,
    Users,
} from '@/components/icons'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { ProductionScaler } from '@/components/recipes/ProductionScaler'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { DeleteModal } from '@/components/ui/index'
import { Skeleton } from '@/components/ui/skeleton'
import { ListSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loader'
import { successToast } from '@/components/ui/toast'
import { useAuth } from '@/hooks/index'
import { useDeleteRecipe, useRecipe } from '@/hooks/useRecipes'
import { handleError } from '@/lib/error-handling'

import { UMKMTooltip } from '@/modules/recipes/components/UMKMTooltip'

import { PageHeader } from '@/components/layout/PageHeader'
import type { Ingredient } from '@/types/database'
import type { RecipeIngredientWithDetails } from '@/types/query-results'
import { isNonNull } from '@/types/shared/guards'

// Type for ingredient with only required fields for display
type IngredientDisplay = Pick<Ingredient, 'id' | 'name' | 'price_per_unit' | 'unit' | 'weighted_average_cost'>

// Local type definition for recipe instruction
interface RecipeInstruction {
  step?: number
  title?: string
  description: string
  duration_minutes?: number
  temperature?: string
}



interface RecipeDetailPageProps {
    recipeId: string
}

interface HppRecipeResponse {
    actual_hpp?: {
        available: boolean
        actual_quantity: number | null
        cost_per_unit: number | null
        total_cost: number | null
        note: string
    }
    estimated_cost_per_unit?: number
}

const RecipeDetailPageComponent = ({ recipeId }: RecipeDetailPageProps) => {
    const router = useRouter()
    const { isLoading: authLoading } = useAuth()


    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [showCostBreakdown, setShowCostBreakdown] = useState(false)
    const [showActualHpp, setShowActualHpp] = useState(false)

    // React Query hooks
    const { data: recipe, isLoading: loading, error } = useRecipe(recipeId)
    const deleteRecipeMutation = useDeleteRecipe()

    const { data: hppRecipeData } = useQuery<HppRecipeResponse | null>({
        queryKey: ['hpp-recipe', recipeId],
        queryFn: async (): Promise<HppRecipeResponse | null> => {
            const response = await fetch(`/api/hpp/recipe/${recipeId}`, {
                credentials: 'include',
            })
            if (!response.ok) {
                return null
            }
            const result = await response.json()
            return (result?.data as HppRecipeResponse | null) ?? null
        },
        enabled: Boolean(recipeId),
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
    })

    const estimatedCostPerUnit = recipe?.cost_per_unit ?? hppRecipeData?.estimated_cost_per_unit ?? 0
    const actualHpp = hppRecipeData?.actual_hpp

    // Memoize breadcrumbs and action
    const breadcrumbs = useMemo(() => [
        { label: 'Recipes', href: '/recipes' }, 
        { label: recipe?.name || 'Recipe' }
    ], [recipe?.name])
    
    const action = useMemo(() => (
      <Button variant="outline" onClick={() => router.push(`/recipes/${recipeId}/edit`)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
    ), [router, recipeId])

    // Handle error state
    useEffect(() => {
        if (error) {
            handleError(error, 'Load recipe', true, 'Gagal memuat resep')
            router.push('/recipes')
        }
    }, [error, router])



    const handleDelete = useCallback(async (): Promise<void> => {
        if (!recipe?.id) {
            return
        }

        try {
            await deleteRecipeMutation.mutateAsync(recipe.id)
            router.push('/recipes')
        } catch (error) {
            // Error handling is done in the mutation hook
            handleError(error, 'Delete recipe', true, 'Gagal menghapus resep')
        }
    }, [recipe, deleteRecipeMutation, router])



    const getDifficultyColor = useCallback((difficulty: string | null | undefined): string => {
        if (!difficulty) {
            return 'bg-muted text-muted-foreground'
        }
        
        const colors: Record<string, string> = {
            easy: 'bg-muted text-muted-foreground',
            medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        }
        return colors[difficulty] ?? 'bg-muted text-muted-foreground'
    }, [])

    const getDifficultyLabel = useCallback((difficulty: string | null | undefined): string => {
        if (!difficulty) {
            return 'Sedang'
        }
        
        const labels: Record<string, string> = {
            easy: 'Mudah',
            medium: 'Sedang',
            hard: 'Sulit',
        }
        return labels[difficulty] ?? difficulty
    }, [])

    if (loading || authLoading) {
        return (
            <div className="space-y-6 sm:space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    {/* Image Skeleton */}
                    <div className="w-full max-w-md mx-auto">
                        <Skeleton className="w-full h-48 sm:h-64 rounded-lg" />
                    </div>
                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-10 flex-1 sm:w-32" />
                        <Skeleton className="h-10 flex-1 sm:w-32" />
                        <Skeleton className="h-10 flex-1 sm:w-32" />
                        <Skeleton className="h-10 w-full sm:w-32 sm:ml-auto" />
                    </div>
                </div>

                {/* Info Cards Skeleton */}
                <StatsSkeleton count={4} />

                {/* Ingredients Skeleton */}
                <div className="border rounded-lg p-4 sm:p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <ListSkeleton items={5} />
                </div>

                {/* Instructions Skeleton */}
                <div className="border rounded-lg p-4 sm:p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <ListSkeleton items={4} />
                </div>
            </div>
        )
    }

    if (!recipe) {
        return (
            <div className="text-center py-12">
                <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">Resep tidak ditemukan</h2>
                <Button onClick={() => router.push('/recipes')}>Kembali ke Daftar Resep</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={recipe.name}
        description={recipe.description || ''}
        breadcrumbs={breadcrumbs}
        action={action}
      />

            <div className="space-y-6">
                {recipe.image_url && (
                    <div className="w-full max-w-md mx-auto">
                        <OptimizedImage
                            src={recipe.image_url}
                            alt={recipe.name}
                            width={400}
                            height={256}
                            className="w-full h-48 sm:h-64 object-cover rounded-lg"
                            priority
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 no-print">
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => router.push(`/recipes/${recipeId}/edit`)} className="flex-1 sm:flex-none">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="outline" onClick={() => router.push(`/hpp?recipe=${recipeId}`)} className="flex-1 sm:flex-none">
                            <Calculator className="h-4 w-4 mr-2" />
                            Hitung HPP
                        </Button>
                        <Button variant="outline" onClick={() => window.print()} className="flex-1 sm:flex-none">
                            <Printer className="h-4 w-4 mr-2" />
                            Cetak
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => {
                                // Navigate to production batch creation with this recipe
                                router.push(`/production/new?recipeId=${recipeId}`)
                            }}
                            className="flex-1 sm:flex-none"
                        >
                            <Factory className="h-4 w-4 mr-2" />
                            Mulai Produksi
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={async (): Promise<void> => {
                                try {
                                    if (navigator.share) {
                                        await navigator.share({
                                            title: recipe.name,
                                            text: recipe.description ?? `Resep ${recipe.name}`,
                                            url: window.location.href,
                                        })
                                    } else {
                                        await navigator.clipboard.writeText(window.location.href)
                                        successToast('Link disalin', 'Link resep telah disalin ke clipboard')
                                    }
                                } catch (error) {
                                    // User cancelled share or clipboard access denied
                                    if (error instanceof Error && error.name !== 'AbortError') {
                                        handleError(error, 'Share recipe', true, 'Gagal membagikan resep')
                                    }
                                }
                            }} 
                            className="flex-1 sm:flex-none"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Bagikan
                        </Button>
                    </div>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)} className="w-full sm:w-auto sm:ml-auto">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                    </Button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="transition-all">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Porsi</p>
                                <p className="text-xl sm:text-2xl font-bold text-primary">{recipe.servings}</p>
                            </div>
                            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-all">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Persiapan</p>
                                <p className="text-xl sm:text-2xl font-bold text-primary">{recipe.prep_time ?? 0} menit</p>
                            </div>
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-all">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Memasak</p>
                                <p className="text-xl sm:text-2xl font-bold text-primary">{recipe.cook_time ?? 0} menit</p>
                            </div>
                            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary/70" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="transition-all">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Kesulitan</p>
                                <Badge className={`${getDifficultyColor(recipe.difficulty)} text-xs sm:text-sm font-medium`}>
                                    {getDifficultyLabel(recipe.difficulty)}
                                </Badge>
                            </div>
                            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-primary/70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Estimated vs Actual HPP (optional) */}
            <Card className="transition-all">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                        <span>💰 HPP</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <UMKMTooltip
                                title="HPP Estimasi"
                                content="HPP estimasi dihitung dari resep (servings) + biaya bahan (WAC + waste factor) + tenaga kerja + overhead + kemasan. Ini angka utama yang dipakai untuk pricing."
                            >
                                <p className="text-sm font-medium text-muted-foreground">HPP Estimasi (per porsi)</p>
                            </UMKMTooltip>
                            <p className="text-2xl font-bold text-primary">
                                Rp {estimatedCostPerUnit.toLocaleString('id-ID')}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Total Batch</p>
                            <p className="text-lg font-semibold">
                                Rp {(estimatedCostPerUnit * (recipe.servings ?? 1)).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>

                    <Collapsible open={showActualHpp} onOpenChange={setShowActualHpp}>
                        <div className="flex items-center justify-between">
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="px-0">
                                    <div className="flex items-center gap-2">
                                        {showActualHpp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <UMKMTooltip
                                            title="HPP Aktual (opsional)"
                                            content="HPP aktual dihitung dari produksi terakhir yang statusnya selesai (COMPLETED) memakai jumlah hasil nyata (actual_quantity). Gunanya untuk cek selisih estimasi vs real."
                                        >
                                            <span className="text-sm text-muted-foreground">HPP Aktual (opsional)</span>
                                        </UMKMTooltip>
                                    </div>
                                </Button>
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="pt-2">
                            {(() => {
                                if (!actualHpp || !actualHpp.available) {
                                    return (
                                        <p className="text-sm text-muted-foreground">
                                            {actualHpp?.note ?? 'Belum ada data produksi selesai untuk menghitung HPP aktual.'}
                                        </p>
                                    )
                                }

                                return (
                                    <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">HPP Aktual (per unit hasil)</p>
                                                <p className="text-lg font-semibold text-foreground">
                                                    Rp {(actualHpp.cost_per_unit ?? 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Hasil Produksi</p>
                                                <p className="text-sm font-medium">
                                                    {(actualHpp.actual_quantity ?? 0).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{actualHpp.note}</p>
                                    </div>
                                )
                            })()}
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>

            {/* Ingredients */}
            <Card className="transition-all">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        🥕 Bahan-bahan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                        <div className="space-y-3">
                            {recipe.recipe_ingredients.filter(isNonNull).map((ri: RecipeIngredientWithDetails) => {
                                const ingredient = ri.ingredients
                                const ingredientName = ingredient?.name ?? 'Unknown'
                                const pricePerUnit = ingredient?.price_per_unit ?? 0
                                const unit = ingredient?.unit ?? ri.unit
                                const totalPrice = pricePerUnit * ri.quantity
                                
                                return (
                                    <div
                                        key={ri.id}
                                        className="flex items-center justify-between p-3 border rounded-lg gap-3 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{ingredientName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {ri.quantity} {ri.unit}
                                            </p>
                                        </div>
                                        {pricePerUnit > 0 && (
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-medium text-primary">
                                                    Rp {totalPrice.toLocaleString('id-ID')}
                                                </p>
                                                <p className="text-xs text-muted-foreground hidden sm:block">
                                                    Rp {pricePerUnit.toLocaleString('id-ID')}/{unit}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                            {/* Total Cost */}
                            <div className="mt-6 pt-4 border-t-2 border-primary/20 bg-primary/5 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-primary">Total Biaya Bahan</p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                                            className="h-6 w-6 p-0"
                                        >
                                            {showCostBreakdown ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold text-primary">
                                        Rp {recipe.recipe_ingredients
                                            .filter(isNonNull)
                                            .reduce((total: number, ri: RecipeIngredientWithDetails) => {
                                                const pricePerUnit = ri.ingredients?.price_per_unit ?? 0
                                                return total + (pricePerUnit * ri.quantity)
                                            }, 0)
                                            .toLocaleString('id-ID')}
                                    </p>
                                </div>

                                {/* Cost Breakdown */}
                                {showCostBreakdown && (
                                    <div className="mt-4 pt-4 border-t border-primary/10">
                                        <p className="text-sm font-medium text-primary mb-3">Rincian Biaya per Bahan:</p>
                                        <div className="space-y-2">
                                            {recipe.recipe_ingredients
                                                .filter(isNonNull)
                                                .map((ri: RecipeIngredientWithDetails) => {
                                                    const ingredient = ri.ingredients
                                                    const pricePerUnit = ingredient?.price_per_unit ?? 0
                                                    const totalPrice = pricePerUnit * ri.quantity
                                                     const costPercentage = totalPrice / (recipe.recipe_ingredients
                                                         .filter(isNonNull)
                                                         .reduce((total: number, ri: RecipeIngredientWithDetails) => {
                                                             const price = ri.ingredients?.price_per_unit ?? 0
                                                             return total + (price * ri.quantity)
                                                         }, 0)) * 100

                                                    return (
                                                        <div key={ri.id} className="flex justify-between items-center text-sm">
                                                            <span className="flex-1 truncate mr-2">
                                                                {ingredient?.name ?? 'Unknown'} ({ri.quantity} {ri.unit})
                                                            </span>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-muted-foreground">
                                                                    {costPercentage.toFixed(1)}%
                                                                </span>
                                                                <span className="font-medium">
                                                                    Rp {totalPrice.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="text-4xl mb-4">🥕</div>
                            <p className="text-lg font-medium mb-2">Belum ada bahan yang ditambahkan</p>
                            <p className="text-sm">Tambahkan bahan untuk resep ini</p>
                        </div>
                    )}
                </CardContent>
             </Card>

             {/* Production Scaler */}
             {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
                 <ProductionScaler
                     baseBatchSize={recipe.servings || 1}
                       ingredients={recipe.recipe_ingredients
                           .filter(isNonNull)
                           .map((ri: RecipeIngredientWithDetails) => ({
                             id: ri.ingredients?.id || '',
                             name: ri.ingredients?.name || 'Unknown',
                             quantity: ri.quantity,
                             unit: ri.unit,
                             price_per_unit: ri.ingredients?.price_per_unit || 0,
                             weighted_average_cost: ri.ingredients?.weighted_average_cost
                          }))
                           .filter((ing: IngredientDisplay) => ing.id !== '')
                     }
                 />
             )}

             {/* Instructions */}
            {recipe.instructions && Array.isArray(recipe.instructions) && recipe.instructions.length > 0 && (
                <Card className="transition-all">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            👨‍🍳 Cara Membuat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <ol className="space-y-4 sm:space-y-6">
                            {recipe.instructions.filter(isNonNull).map((step: RecipeInstruction, index: number) => {
                                const stepNumber = step.step ?? index + 1
                                const hasMetadata = Boolean(step.duration_minutes) || Boolean(step.temperature)
                                
                                return (
                                    <li key={stepNumber} className="flex gap-3 sm:gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm transition-all">
                                            {stepNumber}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm sm:text-base text-primary">{step.title}</p>
                                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                                {step.description}
                                            </p>
                                            {hasMetadata && (
                                                <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                                                    {step.duration_minutes && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {step.duration_minutes} menit
                                                        </span>
                                                    )}
                                                    {step.temperature && (
                                                        <span className="flex items-center gap-1">
                                                            🌡️ {step.temperature}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ol>
                    </CardContent>
                </Card>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                entityName="Resep"
                itemName={recipe.name || ''}
            />
        </div>
    )
}

// Memoized export for performance
export const RecipeDetailPage = memo(RecipeDetailPageComponent)

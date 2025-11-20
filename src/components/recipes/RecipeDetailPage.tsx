 
'use client'

import {
    ArrowLeft,
    Calculator,
    ChefHat,
    Clock,
    Edit,
    Printer,
    Share2,
    Trash2,
    Users,
    Factory,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DeleteModal } from '@/components/ui/index'
import { Skeleton } from '@/components/ui/skeleton'
import { ListSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loader'
import { ProductionScaler } from '@/components/recipes/ProductionScaler'
import { useAuth } from '@/hooks/index'
import { useSupabase } from '@/providers/SupabaseProvider'
import { toast, errorToast, successToast } from '@/components/ui/toast'

import type { RecipeInstruction } from '@/app/recipes/ai-generator/components/types'
import type { Ingredient, Recipe, RecipeIngredient } from '@/types/database'
import { isNonNull } from '@/types/shared/guards'

// Type for ingredient with only required fields for display
type IngredientDisplay = Pick<Ingredient, 'id' | 'name' | 'price_per_unit' | 'unit' | 'weighted_average_cost'>

// Type for recipe ingredient with populated ingredient data
type RecipeIngredientWithDetails = RecipeIngredient & {
    ingredient: IngredientDisplay | null
}

// Type for recipe with all related data
type RecipeWithIngredients = Recipe & {
    recipe_ingredients: RecipeIngredientWithDetails[]
    instructions: RecipeInstruction[] | null
    image_url?: string | null
}

interface RecipeDetailPageProps {
    recipeId: string
}

export const RecipeDetailPage = ({ recipeId }: RecipeDetailPageProps) => {
    const router = useRouter()
    const { user, isLoading: authLoading } = useAuth()
    const { supabase } = useSupabase()

    const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [showCostBreakdown, setShowCostBreakdown] = useState(false)

    const loadRecipe = useCallback(async (userId: string) => {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('recipes')
                .select(`
                    *,
                    instructions,
                    image_url,
                    recipe_ingredients (
                        id,
                        ingredient_id,
                        quantity,
                        unit,
                        ingredient:ingredients (
                            id,
                            name,
                            price_per_unit,
                            unit,
                            weighted_average_cost
                        )
                    )
                `)
                .eq('id', recipeId)
                .eq('user_id', userId)
                .maybeSingle()

            if (error) {
                throw error
            }

            if (!data) {
                setRecipe(null)
                return
            }

            setRecipe(data as RecipeWithIngredients)
        } catch (error) {
              const message = error instanceof Error ? error.message : 'Gagal memuat resep'
              errorToast(message)
              setRecipe(null)
        } finally {
            setLoading(false)
        }
    }, [recipeId, supabase])

    useEffect(() => {
        if (!user?.id) {
            if (!authLoading) {
                setLoading(false)
                setRecipe(null)
            }
            return
        }

        void loadRecipe(user['id'])
    }, [user, authLoading, loadRecipe])

    const handleDelete = useCallback(async (): Promise<void> => {
        if (!recipe || !user?.id) { 
            return 
        }

        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', recipeId)
                .eq('user_id', user.id)

            if (error) {
                throw error
            }

            successToast(`${recipe.name} berhasil dihapus`)
            router.push('/recipes')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus resep'
            errorToast(message)
        }
    }, [recipe, user?.id, supabase, recipeId, router])



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
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={() => router.push('/recipes')} className="hover:text-foreground">
                    Resep Produk
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">{recipe.name}</span>
            </div>

            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/recipes')} className="no-print">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-2xl sm:text-3xl font-bold truncate">
                            {recipe.name}
                        </h1>
                        {recipe.description && isNonNull(recipe.description) && recipe.description.trim() !== '' && (
                            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{recipe.description}</p>
                        )}
                    </div>
                </div>

                {/* Recipe Image */}
                {recipe.image_url && (
                    <div className="w-full max-w-md mx-auto">
                        <Image
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
                                        errorToast('Gagal membagikan resep')
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
                            {recipe.recipe_ingredients.filter(isNonNull).map((ri) => {
                                const ingredient = ri.ingredient
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
                                            .reduce((total, ri) => {
                                                const pricePerUnit = ri.ingredient?.price_per_unit ?? 0
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
                                                .map((ri) => {
                                                    const ingredient = ri.ingredient
                                                    const pricePerUnit = ingredient?.price_per_unit ?? 0
                                                    const totalPrice = pricePerUnit * ri.quantity
                                                    const costPercentage = totalPrice / (recipe.recipe_ingredients
                                                        .filter(isNonNull)
                                                        .reduce((total, ri) => {
                                                            const price = ri.ingredient?.price_per_unit ?? 0
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
                         .map(ri => ({
                             id: ri.ingredient?.id || '',
                             name: ri.ingredient?.name || 'Unknown',
                             quantity: ri.quantity,
                             unit: ri.unit,
                             price_per_unit: ri.ingredient?.price_per_unit || 0,
                             weighted_average_cost: ri.ingredient?.weighted_average_cost
                         }))
                         .filter(ing => ing.id !== '')
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
                            {recipe.instructions.filter(isNonNull).map((step, index) => {
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

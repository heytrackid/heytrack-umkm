 
'use client'

import {
    ChefHat,
    Edit,
    Trash2,
    Calculator,
    Clock,
    Users,
    ArrowLeft,
    Printer,
    Share2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { DeleteModal } from '@/components/ui/index'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/index'
import { useToast } from '@/hooks/use-toast'
import { useSupabase } from '@/providers/SupabaseProvider'

import type { Row } from '@/types/database'
import type { RecipeInstruction } from '@/app/recipes/ai-generator/components/types'



type RecipeRow = Row<'recipes'>
type RecipeIngredientRow = Row<'recipe_ingredients'>
type IngredientRow = Row<'ingredients'>

type RecipeIngredientWithDetails = RecipeIngredientRow & {
    ingredient: Pick<IngredientRow, 'id' | 'name' | 'price_per_unit' | 'unit'> | null
}

type RecipeWithIngredients = RecipeRow & {
    recipe_ingredients: RecipeIngredientWithDetails[]
    instructions: RecipeInstruction[] | null
}

interface RecipeDetailPageProps {
    recipeId: string
}

export const RecipeDetailPage = ({ recipeId }: RecipeDetailPageProps) => {
    const router = useRouter()
    const { toast } = useToast()
    const { user, isLoading: authLoading } = useAuth()
    const { supabase } = useSupabase()

    const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

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
                            unit,
                            price_per_unit
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
            toast({
                title: 'Kesalahan',
                description: message,
                variant: 'destructive',
            })
            setRecipe(null)
        } finally {
            setLoading(false)
        }
    }, [recipeId, supabase, toast])

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

    const handleDelete = async () => {
        if (!recipe || !user?.id) { return }

        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', recipeId)
                .eq('user_id', user.id)

            if (error) {
                throw error
            }

            toast({
                title: 'Resep dihapus',
                description: `${recipe.name} berhasil dihapus`,
            })
            router.push('/recipes')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus resep'
            toast({
                title: 'Kesalahan',
                description: message,
                variant: 'destructive',
            })
        }
    }

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            bread: '🍞',
            pastry: '🥐',
            cake: '🍰',
            cookie: '🍪',
        }
        return icons[category] ?? '👩‍🍳'
    }

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            easy: 'bg-muted text-muted-foreground',
            medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        }
        return colors[difficulty] ?? 'bg-muted text-muted-foreground'
    }

    const getDifficultyLabel = (difficulty: string) => {
        const labels: Record<string, string> = {
            easy: 'Mudah',
            medium: 'Sedang',
            hard: 'Sulit',
        }
        return labels[difficulty] ?? difficulty
    }

    if (loading || authLoading) {
        return (
            <div className="space-y-6 sm:space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
                            <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                        </div>
                    </div>
                    {/* Image Skeleton */}
                    <div className="w-full max-w-md mx-auto">
                        <div className="w-full h-48 sm:h-64 bg-muted rounded-lg animate-pulse" />
                    </div>
                    {/* Action Buttons Skeleton */}
                    <div className="flex flex-wrap gap-2">
                        <div className="h-10 bg-muted rounded animate-pulse flex-1 sm:w-32" />
                        <div className="h-10 bg-muted rounded animate-pulse flex-1 sm:w-32" />
                        <div className="h-10 bg-muted rounded animate-pulse flex-1 sm:w-32" />
                        <div className="h-10 bg-muted rounded animate-pulse w-full sm:w-32 sm:ml-auto" />
                    </div>
                </div>

                {/* Info Cards Skeleton */}
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 sm:p-6 border rounded-lg">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                                    <div className="h-6 bg-muted rounded animate-pulse w-12" />
                                </div>
                                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-muted rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ingredients Skeleton */}
                <div className="border rounded-lg p-4 sm:p-6">
                    <div className="h-6 bg-muted rounded animate-pulse w-32 mb-4" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="space-y-1 flex-1">
                                    <div className="h-4 bg-muted rounded animate-pulse w-24" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                                </div>
                                <div className="space-y-1">
                                    <div className="h-4 bg-muted rounded animate-pulse w-20" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Instructions Skeleton */}
                <div className="border rounded-lg p-4 sm:p-6">
                    <div className="h-6 bg-muted rounded animate-pulse w-32 mb-4" />
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3 sm:gap-4">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded animate-pulse w-32" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-full" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
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
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 truncate">
                            <span className="text-2xl sm:text-3xl flex-shrink-0">{getCategoryIcon(recipe.category ?? 'other')}</span>
                            <span className="truncate">{recipe.name}</span>
                        </h1>
                        {recipe.description && (
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
                            className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md"
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
                        <Button variant="outline" onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: recipe.name,
                                    text: recipe.description || `Resep ${recipe.name}`,
                                    url: window.location.href,
                                });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                toast({
                                    title: 'Link disalin',
                                    description: 'Link resep telah disalin ke clipboard',
                                });
                            }
                        }} className="flex-1 sm:flex-none">
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
                <Card className="shadow-sm hover:shadow-md transition-shadow">
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

                <Card className="shadow-sm hover:shadow-md transition-shadow">
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

                <Card className="shadow-sm hover:shadow-md transition-shadow">
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

                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Kesulitan</p>
                                <Badge className={`${getDifficultyColor(recipe.difficulty ?? 'medium')} text-xs sm:text-sm font-medium`}>
                                    {getDifficultyLabel(recipe.difficulty ?? 'medium')}
                                </Badge>
                            </div>
                            <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-primary/70" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ingredients */}
            <Card className="shadow-sm">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        🥕 Bahan-bahan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                        <div className="space-y-3">
                            {recipe.recipe_ingredients.map((ri) => (
                                <div
                                    key={ri['id']}
                                    className="flex items-center justify-between p-3 border rounded-lg gap-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{ri.ingredient?.name ?? 'Unknown'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {ri.quantity} {ri.unit}
                                        </p>
                                    </div>
                                    {ri.ingredient?.price_per_unit && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-sm font-medium text-primary">
                                                Rp {(ri.ingredient.price_per_unit * ri.quantity).toLocaleString('id-ID')}
                                            </p>
                                            <p className="text-xs text-muted-foreground hidden sm:block">
                                                Rp {ri.ingredient.price_per_unit.toLocaleString('id-ID')}/{ri.ingredient.unit}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Total Cost */}
                            <div className="mt-6 pt-4 border-t-2 border-primary/20 bg-primary/5 rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <p className="font-semibold text-primary">Total Biaya Bahan</p>
                                    <p className="text-xl sm:text-2xl font-bold text-primary">
                                        Rp {recipe.recipe_ingredients
                                            .reduce((total, ri) =>
                                                total + ((ri.ingredient?.price_per_unit ?? 0) * ri.quantity), 0)
                                            .toLocaleString('id-ID')}
                                    </p>
                                </div>
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

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
                <Card className="shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                            👨‍🍳 Cara Membuat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <ol className="space-y-4 sm:space-y-6">
                            {recipe.instructions.map((step, index) => (
                                <li key={step.step || index} className="flex gap-3 sm:gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                                        {step.step || index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm sm:text-base text-primary">{step.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                            {step.description}
                                        </p>
                                        {(step.duration_minutes || step.temperature) && (
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
                            ))}
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

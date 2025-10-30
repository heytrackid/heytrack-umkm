'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeleteModal } from '@/components/ui'
import {
    ChefHat,
    Edit,
    Trash2,
    Calculator,
    Clock,
    Users,
    ArrowLeft,
} from 'lucide-react'
import type { Database } from '@/types/supabase-generated'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/hooks/useAuth'

type RecipeRow = Database['public']['Tables']['recipes']['Row']
type RecipeIngredientRow = Database['public']['Tables']['recipe_ingredients']['Row']
type IngredientRow = Database['public']['Tables']['ingredients']['Row']

type RecipeIngredientWithDetails = RecipeIngredientRow & {
    ingredient: Pick<IngredientRow, 'id' | 'name' | 'unit' | 'price_per_unit'> | null
}

type RecipeWithIngredients = RecipeRow & {
    recipe_ingredients: RecipeIngredientWithDetails[]
}

interface RecipeDetailPageProps {
    recipeId: string
}

export const RecipeDetailPage = ({ recipeId }: RecipeDetailPageProps) => {
    const router = useRouter()
    const { toast } = useToast()
    const { user, isLoading: authLoading } = useAuth()

    const supabase = useMemo(() => createClient(), [])

    const [recipe, setRecipe] = useState<RecipeWithIngredients | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const loadRecipe = useCallback(async (userId: string) => {
        try {
            void setLoading(true)

            const { data, error } = await supabase
                .from('recipes')
                .select(`
                    *,
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal memuat resep'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
            setRecipe(null)
        } finally {
            void setLoading(false)
        }
    }, [recipeId, supabase, toast])

    useEffect(() => {
        if (!user?.id) {
            if (!authLoading) {
                void setLoading(false)
                setRecipe(null)
            }
            return
        }

        void loadRecipe(user.id)
    }, [user?.id, authLoading, loadRecipe])

    const handleDelete = async () => {
        if (!recipe || !user?.id) {return}

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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal menghapus resep'
            toast({
                title: 'Error',
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
        return icons[category] || '👩‍🍳'
    }

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        }
        return colors[difficulty] || 'bg-gray-100 text-gray-700'
    }

    const getDifficultyLabel = (difficulty: string) => {
        const labels: Record<string, string> = {
            easy: 'Mudah',
            medium: 'Sedang',
            hard: 'Sulit',
        }
        return labels[difficulty] || difficulty
    }

    if (loading || authLoading) {
        return (
            <div className="space-y-6">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48" />
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
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
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={() => router.push('/recipes')} className="hover:text-foreground">
                    Resep Produk
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">{recipe.name}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/recipes')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <span className="text-3xl">{getCategoryIcon(recipe.category ?? 'other')}</span>
                            {recipe.name}
                        </h1>
                        {recipe.description && (
                            <p className="text-muted-foreground mt-1">{recipe.description}</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => router.push(`/recipes/${recipeId}/edit`)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" onClick={() => router.push(`/hpp?recipe=${recipeId}`)}>
                        <Calculator className="h-4 w-4 mr-2" />
                        Hitung HPP
                    </Button>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                    </Button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Porsi</p>
                                <p className="text-2xl font-bold">{recipe.servings}</p>
                            </div>
                            <Users className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Persiapan</p>
                                <p className="text-2xl font-bold">{recipe.prep_time ?? 0} menit</p>
                            </div>
                            <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Memasak</p>
                                <p className="text-2xl font-bold">{recipe.cook_time ?? 0} menit</p>
                            </div>
                            <Clock className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Kesulitan</p>
                                <Badge className={getDifficultyColor(recipe.difficulty ?? 'medium')}>
                                    {getDifficultyLabel(recipe.difficulty ?? 'medium')}
                                </Badge>
                            </div>
                            <ChefHat className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ingredients */}
            <Card>
                <CardHeader>
                    <CardTitle>Bahan-bahan</CardTitle>
                </CardHeader>
                <CardContent>
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                        <div className="space-y-2">
                            {recipe.recipe_ingredients.map((ri) => (
                                    <div
                                        key={ri.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{ri.ingredient?.name || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {ri.quantity} {ri.unit}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Belum ada bahan yang ditambahkan</p>
                        </div>
                    )}
                </CardContent>
            </Card>

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

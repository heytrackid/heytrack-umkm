'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useSupabaseCRUD } from '@/hooks/supabase'
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
    Copy,
} from 'lucide-react'
import type { Database } from '@/types/supabase-generated'

type Recipe = Database['public']['Tables']['recipes']['Row']
type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row']
type Ingredient = Database['public']['Tables']['ingredients']['Row']

interface RecipeDetailPageProps {
    recipeId: string
}

export const RecipeDetailPage = ({ recipeId }: RecipeDetailPageProps) => {
    const router = useRouter()
    const { toast } = useToast()
    const { read, delete: deleteRecipe } = useSupabaseCRUD('recipes')
    const { data: recipeIngredients } = useSupabaseCRUD('recipe_ingredients', {
        filter: { recipe_id: recipeId },
    })
    const { data: ingredients } = useSupabaseCRUD('ingredients')

    const [recipe, setRecipe] = useState<Recipe | null>(null)
    const [loading, setLoading] = useState(true)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    useEffect(() => {
        loadRecipe()
    }, [recipeId])

    const loadRecipe = async () => {
        try {
            setLoading(true)
            const data = await read(recipeId)
            setRecipe(data)
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Gagal memuat resep'
            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            })
            router.push('/recipes')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!recipe) return

        try {
            await deleteRecipe(recipeId)
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

    const getIngredientDetails = (recipeIngredient: RecipeIngredient) => {
        const ingredient = ingredients.data?.find((i: Ingredient) => i.id === recipeIngredient.ingredient_id)
        return ingredient
    }

    if (loading) {
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
                            <span className="text-3xl">{getCategoryIcon(recipe.category)}</span>
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
                                <p className="text-2xl font-bold">{recipe.prep_time || 0} menit</p>
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
                                <p className="text-2xl font-bold">{recipe.cook_time || 0} menit</p>
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
                                <Badge className={getDifficultyColor(recipe.difficulty || 'medium')}>
                                    {getDifficultyLabel(recipe.difficulty || 'medium')}
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
                    {recipeIngredients.loading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : recipeIngredients.data && recipeIngredients.data.length > 0 ? (
                        <div className="space-y-2">
                            {recipeIngredients.data.map((ri: RecipeIngredient) => {
                                const ingredient = getIngredientDetails(ri)
                                return (
                                    <div
                                        key={ri.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">{ingredient?.name || 'Unknown'}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {ri.quantity} {ri.unit}
                                            </p>
                                        </div>
                                        {ri.notes && (
                                            <p className="text-sm text-muted-foreground italic">{ri.notes}</p>
                                        )}
                                    </div>
                                )
                            })}
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
                title="Hapus Resep"
                description={`Apakah Anda yakin ingin menghapus resep "${recipe.name}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    )
}

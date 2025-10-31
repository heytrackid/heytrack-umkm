'use client'

import { Card, CardContent } from '@/components/ui/card'
import { ChefHat, TrendingUp, Calculator, BarChart3 } from 'lucide-react'
import type { RecipesTable } from '@/types/database'

type Recipe = RecipesTable

interface RecipeStatsCardsProps {
    recipes: Recipe[]
}

export const RecipeStatsCards = ({ recipes }: RecipeStatsCardsProps) => {
    // Calculate stats
    const totalRecipes = recipes.length
    const activeRecipes = recipes.filter((r) => r.is_active).length

    // Calculate average difficulty (for display purposes)
    const difficultyMap = { easy: 1, medium: 2, hard: 3 }
    const avgDifficulty =
        recipes.length > 0
            ? recipes.reduce((sum, r) => sum + (difficultyMap[(r.difficulty ?? 'medium') as keyof typeof difficultyMap] || 2), 0) /
            recipes.length
            : 0

    // Find most common category
    const categoryCount = recipes.reduce(
        (acc, r) => {
            const category = r.category ?? 'other';
            acc[category] = (acc[category] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )
    const mostCommonCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            bread: 'Roti',
            pastry: 'Pastry',
            cake: 'Kue',
            cookie: 'Cookie',
            other: 'Lainnya',
        }
        return labels[category] || category
    }

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Resep</p>
                            <p className="text-2xl font-bold">{activeRecipes}</p>
                            {totalRecipes !== activeRecipes && (
                                <p className="text-xs text-muted-foreground">dari {totalRecipes} total</p>
                            )}
                        </div>
                        <ChefHat className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Tingkat Kesulitan</p>
                            <p className="text-2xl font-bold">
                                {avgDifficulty < 1.5 ? 'Mudah' : avgDifficulty < 2.5 ? 'Sedang' : 'Sulit'}
                            </p>
                            <p className="text-xs text-muted-foreground">rata-rata</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Kategori Terbanyak</p>
                            <p className="text-2xl font-bold">{getCategoryLabel(mostCommonCategory)}</p>
                            <p className="text-xs text-muted-foreground">
                                {categoryCount[mostCommonCategory] || 0} resep
                            </p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Siap Dihitung</p>
                            <p className="text-2xl font-bold">{activeRecipes}</p>
                            <p className="text-xs text-muted-foreground">resep aktif</p>
                        </div>
                        <Calculator className="h-8 w-8 text-orange-600" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

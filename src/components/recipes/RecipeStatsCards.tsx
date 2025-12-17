'use client'

import { BarChart3, Calculator, ChefHat, TrendingUp } from '@/components/icons'

import { StatsCards, type StatCardData } from '@/components/ui/stats-cards'

import type { Row } from '@/types/database'

type Recipe = Row<'recipes'>

interface RecipeStatsCardsProps {
    recipes: Recipe[]
}

const getDifficultyLabel = (difficulty: string): string => {
    const labels: Record<string, string> = {
        'easy': 'Mudah',
        'medium': 'Sedang',
        'hard': 'Sulit'
    }
    return labels[difficulty] ?? difficulty
}

export const RecipeStatsCards = ({ recipes }: RecipeStatsCardsProps) => {
    // Calculate stats
    const totalRecipes = recipes.length
    const activeRecipes = recipes.filter((r) => r.is_active).length

    // Calculate average difficulty (for display purposes)
    const difficultyMap = { easy: 1, medium: 2, hard: 3 }
    const avgDifficultyNum =
        recipes.length > 0
            ? recipes.reduce((sum, r) => sum + (difficultyMap[(r.difficulty ?? 'medium') as keyof typeof difficultyMap] ?? 2), 0) /
            recipes.length
            : 0

    // Convert average to difficulty label
    let avgDifficulty: string
    if (avgDifficultyNum <= 1.5) {
      avgDifficulty = 'easy'
    } else if (avgDifficultyNum <= 2.5) {
      avgDifficulty = 'medium'
    } else {
      avgDifficulty = 'hard'
    }

    // Find most common category
    const categoryCount = recipes.reduce(
        (acc, r) => {
            const category = r.category ?? 'other';
            acc[category] = (acc[category] ?? 0) + 1
            return acc
        },
        {} as Record<string, number>
    )
    const mostCommonCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            bread: 'Roti',
            pastry: 'Pastry',
            cake: 'Kue',
            cookie: 'Cookie',
            other: 'Lainnya',
        }
        return labels[category] ?? category
    }

    const totalRecipesDescription = totalRecipes !== activeRecipes ? `dari ${totalRecipes} total` : null

    const stats: StatCardData[] = [
        {
            title: 'Total Resep',
            value: activeRecipes,
            ...(totalRecipesDescription ? { description: totalRecipesDescription } : {}),
            icon: ChefHat,
        },
        {
            title: 'Tingkat Kesulitan',
            value: getDifficultyLabel(avgDifficulty),
            description: 'rata-rata',
            icon: TrendingUp,
        },
        {
            title: 'Kategori Terbanyak',
            value: getCategoryLabel(mostCommonCategory),
            description: `${categoryCount[mostCommonCategory] ?? 0} resep`,
            icon: BarChart3,
        },
        {
            title: 'Siap Dihitung',
            value: activeRecipes,
            description: 'resep aktif',
            icon: Calculator,
        },
    ]

    return (
        <StatsCards stats={stats} gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
    )
}

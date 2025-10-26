import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { createServiceRoleClient } from '@/utils/supabase'
import { getErrorMessage } from '@/lib/type-guards'
import type { CostBreakdown, HPPRecommendation } from '@/types/hpp-tracking'

import { apiLogger } from '@/lib/logger'

type RecipeRow = { id: string; name: string; selling_price: number | null }
type HPPSnapshotRow = {
  id: string
  recipe_id: string
  snapshot_date: string
  hpp_value: number
  material_cost: number
  operational_cost: number
  cost_breakdown: CostBreakdown
  selling_price: number | null
  margin_percentage: number | null
  created_at: string
  user_id: string
}
// GET /api/hpp/recommendations - Get HPP optimization recommendations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const recipeId = searchParams.get('recipe_id')

        const supabase = createServiceRoleClient()

        // If recipe_id provided, get recommendations for that recipe
        // Otherwise, get recommendations for all recipes
        const recipeIds = recipeId ? [recipeId] : await getAllRecipeIds(supabase)

        const allRecommendations: Array<HPPRecommendation & { recipe_id: string; recipe_name: string }> = []

        for (const id of recipeIds) {
            const recommendations = await generateRecommendations(supabase, id)
            allRecommendations.push(...recommendations)
        }

        // Sort by priority (high -> medium -> low)
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        allRecommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

        return NextResponse.json({
            success: true,
            data: allRecommendations,
            meta: {
                total_recommendations: allRecommendations.length,
                recipes_analyzed: recipeIds.length
            }
        })

    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in recommendations endpoint:')
        return NextResponse.json(
            { error: 'Failed to generate recommendations', details: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

// Helper function to get all recipe IDs
async function getAllRecipeIds(supabase: ReturnType<typeof createServiceRoleClient>): Promise<string[]> {
    const { data: recipes, error } = await supabase
        .from('recipes')
        .select('id')
        .limit(20) // Limit to prevent performance issues

    if (error) {
        apiLogger.error({ error: error }, 'Error fetching recipes:')
        return []
    }

    return recipes?.map((r) => r.id) || []
}

// Helper function to generate recommendations for a recipe
async function generateRecommendations(
    supabase: ReturnType<typeof createServiceRoleClient>,
    recipeId: string
): Promise<Array<HPPRecommendation & { recipe_id: string; recipe_name: string }>> {
    const recommendations: Array<HPPRecommendation & { recipe_id: string; recipe_name: string }> = []

    // Get recipe details
    const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select('name, selling_price')
        .eq('id', recipeId)
        .single()

    if (recipeError || !recipe) {
        return recommendations
    }

    type RecipeData = { name: string; selling_price: number | null }

    // Get last 30 days of snapshots
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: snapshots, error: snapshotsError } = await supabase
        .from('hpp_snapshots')
        .select('*')
        .eq('recipe_id', recipeId)
        .gte('snapshot_date', thirtyDaysAgo.toISOString())
        .order('snapshot_date', { ascending: true })

    if (snapshotsError || !snapshots || snapshots.length === 0) {
        return recommendations
    }

    const typedSnapshots = snapshots as unknown as HPPSnapshotRow[]

    // Rule 1: Consistent HPP increase over 30 days (Requirement 8.1)
    if (typedSnapshots.length >= 5) {
        const firstHPP = typedSnapshots[0].hpp_value
        const lastHPP = typedSnapshots[typedSnapshots.length - 1].hpp_value
        const changePercentage = ((lastHPP - firstHPP) / firstHPP) * 100

        // Check if trend is consistently increasing
        let increasingCount = 0
        for (let i = 1; i < typedSnapshots.length; i++) {
            if (typedSnapshots[i].hpp_value > typedSnapshots[i - 1].hpp_value) {
                increasingCount++
            }
        }
        const isConsistentIncrease = increasingCount >= typedSnapshots.length * 0.6 // 60% of snapshots show increase

        if (changePercentage > 10 && isConsistentIncrease) {
            const potentialSavings = (lastHPP - firstHPP) * 10 // Estimate based on 10 units
            const recipeName = (recipe as RecipeData).name

            recommendations.push({
                recipe_id: recipeId,
                recipe_name: recipeName,
                type: 'supplier_review',
                priority: changePercentage > 20 ? 'high' : 'medium',
                title: 'Review Supplier atau Bahan Alternatif',
                description: `HPP ${recipeName} naik konsisten ${changePercentage.toFixed(1)}% dalam 30 hari terakhir. Pertimbangkan untuk mencari supplier dengan harga lebih kompetitif atau bahan alternatif.`,
                potential_savings: potentialSavings,
                action_items: [
                    'Bandingkan harga dari minimal 3 supplier berbeda',
                    'Evaluasi kualitas bahan alternatif dengan harga lebih rendah',
                    'Negosiasi harga bulk purchase dengan supplier saat ini',
                    'Pertimbangkan kontrak jangka panjang untuk harga stabil'
                ]
            })
        }
    }

    // Rule 2: High operational cost percentage (> 20%) (Requirement 8.2)
    const latestSnapshot = typedSnapshots[typedSnapshots.length - 1]
    const breakdown = latestSnapshot.cost_breakdown as CostBreakdown
    const operationalPercentage = (latestSnapshot.operational_cost / latestSnapshot.hpp_value) * 100

    // Check if operational cost increased significantly
    let operationalCostIncrease = 0
    if (typedSnapshots.length >= 2) {
        const firstOperationalCost = typedSnapshots[0].operational_cost
        const lastOperationalCost = latestSnapshot.operational_cost
        operationalCostIncrease = ((lastOperationalCost - firstOperationalCost) / firstOperationalCost) * 100
    }

    if (operationalPercentage > 20 || operationalCostIncrease > 20) {
        const targetOperationalCost = latestSnapshot.hpp_value * 0.15 // Target 15%
        const potentialSavings = (latestSnapshot.operational_cost - targetOperationalCost) * 10 // Estimate based on 10 units
        const recipeName = (recipe as RecipeData).name

        const description = operationalCostIncrease > 20
            ? `Biaya operasional ${recipeName} naik ${operationalCostIncrease.toFixed(1)}% dalam 30 hari terakhir dan mencapai ${operationalPercentage.toFixed(1)}% dari HPP. Target ideal adalah 15-20%.`
            : `Biaya operasional ${recipeName} mencapai ${operationalPercentage.toFixed(1)}% dari HPP. Target ideal adalah 15-20%.`

        recommendations.push({
            recipe_id: recipeId,
            recipe_name: recipeName,
            type: 'operational_efficiency',
            priority: operationalCostIncrease > 20 ? 'high' : 'medium',
            title: 'Optimasi Efisiensi Operasional',
            description,
            potential_savings: potentialSavings,
            action_items: [
                'Audit penggunaan utilitas (listrik, air, gas)',
                'Evaluasi efisiensi proses produksi',
                'Pertimbangkan investasi peralatan hemat energi',
                'Optimalkan jadwal produksi untuk mengurangi idle time',
                'Review kontrak vendor untuk biaya operasional'
            ]
        })
    }

    // Rule 3: Low margin (< 15%) - Margin improvement suggestions (Requirement 8.5)
    if (latestSnapshot.margin_percentage && latestSnapshot.margin_percentage < 15) {
        const currentMargin = latestSnapshot.margin_percentage
        const targetMargin = 25 // Target 25%
        const recipeName = (recipe as RecipeData).name
        const recipePrice = (recipe as RecipeData).selling_price
        const currentPrice = recipePrice || latestSnapshot.selling_price || 0
        const suggestedPrice = latestSnapshot.hpp_value / (1 - targetMargin / 100)
        const priceIncrease = suggestedPrice - currentPrice

        // Calculate potential additional profit
        const potentialAdditionalProfit = priceIncrease * 10 // Estimate based on 10 units

        recommendations.push({
            recipe_id: recipeId,
            recipe_name: recipeName,
            type: 'price_adjustment',
            priority: currentMargin < 10 ? 'high' : 'medium',
            title: 'Penyesuaian Harga Jual untuk Meningkatkan Margin',
            description: `Margin profit ${recipeName} hanya ${currentMargin.toFixed(1)}%. Dengan meningkatkan harga atau mengurangi HPP, margin bisa ditingkatkan ke target 25%.`,
            potential_savings: potentialAdditionalProfit,
            action_items: [
                `Opsi 1: Naikkan harga jual dari ${formatCurrency(currentPrice)} ke ${formatCurrency(suggestedPrice)} (margin 25%)`,
                'Opsi 2: Kurangi HPP melalui efisiensi bahan dan operasional',
                'Komunikasikan value proposition kepada pelanggan untuk justifikasi harga',
                'Monitor kompetitor untuk memastikan harga tetap kompetitif',
                'Pertimbangkan strategi bundling atau upselling'
            ]
        })
    }

    // Rule 4: Expensive ingredients - Calculate potential savings from alternatives (Requirement 8.4)
    if (breakdown && breakdown.ingredients && Array.isArray(breakdown.ingredients)) {
        const sortedIngredients = [...breakdown.ingredients].sort((a, b) => b.cost - a.cost)
        if (sortedIngredients.length > 0) {
            const topIngredient = sortedIngredients[0]
            const ingredientPercentage = (topIngredient.cost / latestSnapshot.material_cost) * 100
            const recipeName = (recipe as RecipeData).name

            if (ingredientPercentage > 30) {
                // Calculate potential savings if ingredient cost reduced by 20%
                const potentialSavingsPerUnit = topIngredient.cost * 0.2
                const potentialSavingsTotal = potentialSavingsPerUnit * 10 // Estimate based on 10 units

                recommendations.push({
                    recipe_id: recipeId,
                    recipe_name: recipeName,
                    type: 'ingredient_alternative',
                    priority: ingredientPercentage > 40 ? 'medium' : 'low',
                    title: 'Evaluasi Bahan Utama dan Alternatif',
                    description: `${topIngredient.name} menyumbang ${ingredientPercentage.toFixed(1)}% dari biaya bahan. Dengan mencari alternatif atau negosiasi harga, potensi penghematan bisa mencapai ${formatCurrency(potentialSavingsPerUnit)} per unit.`,
                    potential_savings: potentialSavingsTotal,
                    action_items: [
                        `Cari alternatif untuk ${topIngredient.name} dengan harga lebih rendah (target: hemat 20%)`,
                        'Evaluasi apakah jumlah yang digunakan bisa dikurangi tanpa mengurangi kualitas',
                        'Pertimbangkan bulk purchase untuk diskon volume',
                        'Test resep dengan proporsi bahan yang dioptimasi',
                        'Negosiasi harga dengan supplier untuk pembelian dalam jumlah besar'
                    ]
                })
            }
        }
    }

    return recommendations
}

// Helper function to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount)
}

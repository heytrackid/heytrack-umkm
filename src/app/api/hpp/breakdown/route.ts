import { createServerSupabaseAdmin } from '@/lib/supabase'
import { CostBreakdown } from '@/types/hpp-tracking'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/hpp/breakdown - Get detailed cost breakdown for a recipe
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const recipeId = searchParams.get('recipe_id')
        const date = searchParams.get('date')

        // Validate required parameters
        if (!recipeId) {
            return NextResponse.json(
                { error: 'Missing required parameter: recipe_id' },
                { status: 400 }
            )
        }

        const supabase = createServerSupabaseAdmin()

        // Get recipe name
        const { data: recipe, error: recipeError } = await supabase
            .from('recipes')
            .select('name')
            .eq('id', recipeId)
            .single()

        if (recipeError || !recipe) {
            return NextResponse.json(
                { error: 'Recipe not found' },
                { status: 404 }
            )
        }

        // Build query for snapshot
        let snapshotQuery = supabase
            .from('hpp_snapshots')
            .select('*')
            .eq('recipe_id', recipeId)
            .order('snapshot_date', { ascending: false })
            .limit(1)

        // If specific date provided, get snapshot for that date
        if (date) {
            const targetDate = new Date(date)
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).toISOString()
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999)).toISOString()

            snapshotQuery = supabase
                .from('hpp_snapshots')
                .select('*')
                .eq('recipe_id', recipeId)
                .gte('snapshot_date', startOfDay)
                .lte('snapshot_date', endOfDay)
                .order('snapshot_date', { ascending: false })
                .limit(1)
        }

        const { data: snapshots, error: snapshotError } = await snapshotQuery

        if (snapshotError) {
            console.error('Error fetching snapshot:', snapshotError)
            return NextResponse.json(
                { error: 'Failed to fetch snapshot', details: snapshotError.message },
                { status: 500 }
            )
        }

        if (!snapshots || snapshots.length === 0) {
            return NextResponse.json(
                { error: 'No snapshot found for this recipe' },
                { status: 404 }
            )
        }

        const snapshot = snapshots[0]
        const breakdown = snapshot.cost_breakdown as CostBreakdown

        // Sort ingredients by cost (descending) and get top 5
        const sortedIngredients = [...breakdown.ingredients].sort((a, b) => b.cost - a.cost)
        const top5Ingredients = sortedIngredients.slice(0, 5)

        // Check for previous snapshot to identify significant changes
        const { data: previousSnapshots } = await supabase
            .from('hpp_snapshots')
            .select('cost_breakdown')
            .eq('recipe_id', recipeId)
            .lt('snapshot_date', snapshot.snapshot_date)
            .order('snapshot_date', { ascending: false })
            .limit(1)

        let ingredientsWithChanges = top5Ingredients

        // If we have a previous snapshot, calculate changes
        if (previousSnapshots && previousSnapshots.length > 0) {
            const previousBreakdown = previousSnapshots[0].cost_breakdown as CostBreakdown

            ingredientsWithChanges = top5Ingredients.map(ingredient => {
                const previousIngredient = previousBreakdown.ingredients.find(
                    i => i.id === ingredient.id
                )

                if (previousIngredient) {
                    const changePercentage = ((ingredient.cost - previousIngredient.cost) / previousIngredient.cost) * 100

                    return {
                        ...ingredient,
                        previous_cost: previousIngredient.cost,
                        change_percentage: changePercentage,
                        has_significant_change: Math.abs(changePercentage) > 15
                    }
                }

                return ingredient
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                total_hpp: snapshot.hpp_value,
                material_cost: snapshot.material_cost,
                operational_cost: snapshot.operational_cost,
                breakdown: {
                    ingredients: ingredientsWithChanges,
                    operational: breakdown.operational,
                    all_ingredients: breakdown.ingredients
                },
                snapshot_date: snapshot.snapshot_date
            },
            meta: {
                recipe_name: recipe.name,
                total_ingredients: breakdown.ingredients.length,
                has_previous_data: !!(previousSnapshots && previousSnapshots.length > 0)
            }
        })

    } catch (error: any) {
        console.error('Error in breakdown endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

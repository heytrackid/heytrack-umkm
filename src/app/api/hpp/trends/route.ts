import { createServerSupabaseAdmin } from '@/lib/supabase'
import { HPPTrendData, TimePeriod } from '@/types/hpp-tracking'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/hpp/trends - Get HPP trend data for multiple recipes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const recipeIdsParam = searchParams.get('recipe_ids')
        const period = (searchParams.get('period') || '30d') as TimePeriod

        // Validate required parameters
        if (!recipeIdsParam) {
            return NextResponse.json(
                { error: 'Missing required parameter: recipe_ids' },
                { status: 400 }
            )
        }

        // Parse recipe IDs (comma-separated)
        const recipeIds = recipeIdsParam.split(',').filter(id => id.trim())

        // Validate max 5 recipes
        if (recipeIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one recipe_id is required' },
                { status: 400 }
            )
        }

        if (recipeIds.length > 5) {
            return NextResponse.json(
                { error: 'Maximum 5 recipes allowed for comparison' },
                { status: 400 }
            )
        }

        // Calculate date range
        const dateRange = calculateDateRange(period)

        const supabase = createServerSupabaseAdmin()

        // Get recipe names
        const { data: recipes, error: recipesError } = await supabase
            .from('recipes')
            .select('id, name')
            .in('id', recipeIds)

        if (recipesError) {
            console.error('Error fetching recipes:', recipesError)
            return NextResponse.json(
                { error: 'Failed to fetch recipes', details: recipesError.message },
                { status: 500 }
            )
        }

        if (!recipes || recipes.length === 0) {
            return NextResponse.json(
                { error: 'No recipes found with provided IDs' },
                { status: 404 }
            )
        }

        // Fetch snapshots for all recipes
        const { data: snapshots, error: snapshotsError } = await supabase
            .from('hpp_snapshots')
            .select('recipe_id, snapshot_date, hpp_value, material_cost, operational_cost')
            .in('recipe_id', recipeIds)
            .gte('snapshot_date', dateRange.start)
            .lte('snapshot_date', dateRange.end)
            .order('snapshot_date', { ascending: true })

        if (snapshotsError) {
            console.error('Error fetching snapshots:', snapshotsError)
            return NextResponse.json(
                { error: 'Failed to fetch snapshots', details: snapshotsError.message },
                { status: 500 }
            )
        }

        // Aggregate data by recipe
        const trendData: { [recipe_id: string]: HPPTrendData[] } = {}

        recipeIds.forEach(recipeId => {
            const recipeSnapshots = (snapshots || []).filter(s => s.recipe_id === recipeId)

            trendData[recipeId] = recipeSnapshots.map(snapshot => ({
                date: snapshot.snapshot_date,
                hpp: snapshot.hpp_value,
                material_cost: snapshot.material_cost,
                operational_cost: snapshot.operational_cost
            }))
        })

        return NextResponse.json({
            success: true,
            data: trendData,
            meta: {
                recipes: recipes.map(r => ({ id: r.id, name: r.name })),
                period,
                date_range: dateRange,
                total_snapshots: snapshots?.length || 0
            }
        })

    } catch (error: any) {
        console.error('Error in trends endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

// Helper function to calculate date range based on period
function calculateDateRange(period: TimePeriod): { start: string; end: string } {
    const end = new Date()
    const start = new Date(end)

    switch (period) {
        case '7d':
            start.setDate(start.getDate() - 7)
            break
        case '30d':
            start.setDate(start.getDate() - 30)
            break
        case '90d':
            start.setDate(start.getDate() - 90)
            break
        case '1y':
            start.setFullYear(start.getFullYear() - 1)
            break
        default:
            start.setDate(start.getDate() - 30)
    }

    return {
        start: start.toISOString(),
        end: end.toISOString()
    }
}

import { createServerSupabaseAdmin } from '@/lib/supabase'
import { TimePeriod } from '@/types/hpp-tracking'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/hpp/snapshots - Get HPP snapshots with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const recipeId = searchParams.get('recipe_id')
        const period = (searchParams.get('period') || '30d') as TimePeriod
        const startDate = searchParams.get('start_date')
        const endDate = searchParams.get('end_date')
        const limit = parseInt(searchParams.get('limit') || '100')
        const offset = parseInt(searchParams.get('offset') || '0')

        // Validate required parameters
        if (!recipeId) {
            return NextResponse.json(
                { error: 'Missing required parameter: recipe_id' },
                { status: 400 }
            )
        }

        // Calculate date range based on period
        const dateRange = calculateDateRange(period, startDate, endDate)

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

        // Query snapshots with date range
        let query = supabase
            .from('hpp_snapshots')
            .select('*', { count: 'exact' })
            .eq('recipe_id', recipeId)
            .gte('snapshot_date', dateRange.start)
            .lte('snapshot_date', dateRange.end)
            .order('snapshot_date', { ascending: false })
            .range(offset, offset + limit - 1)

        const { data: snapshots, error, count } = await query

        if (error) {
            console.error('Error fetching snapshots:', error)
            return NextResponse.json(
                { error: 'Failed to fetch snapshots', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            data: snapshots || [],
            meta: {
                count: count || 0,
                limit,
                offset,
                period,
                date_range: dateRange,
                recipe_name: recipe.name
            }
        })

    } catch (error: any) {
        console.error('Error in snapshots endpoint:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

// Helper function to calculate date range based on period
function calculateDateRange(
    period: TimePeriod,
    startDate?: string | null,
    endDate?: string | null
): { start: string; end: string } {
    const end = endDate ? new Date(endDate) : new Date()
    let start: Date

    // If custom date range provided, use it
    if (startDate) {
        start = new Date(startDate)
    } else {
        // Calculate based on period
        start = new Date(end)
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
    }

    return {
        start: start.toISOString(),
        end: end.toISOString()
    }
}

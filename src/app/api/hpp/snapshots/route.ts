import { TimePeriod } from '@/types/hpp-tracking'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { apiLogger } from '@/lib/logger'

// GET /api/hpp/snapshots - Get HPP snapshots with filters
export async function GET(request: NextRequest) {
    try {
        // Create authenticated Supabase client
        const supabase = await createClient()

        // Validate session
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            apiLogger.error({ error: authError }, 'Unauthorized access to GET /api/hpp/snapshots')
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

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

        // Get recipe name and verify ownership
        const { data: recipe, error: recipeError } = await supabase
            .from('recipes')
            .select('name')
            .eq('id', recipeId)
            .eq('user_id', user.id)
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
            .eq('user_id', user.id)
            .gte('snapshot_date', dateRange.start)
            .lte('snapshot_date', dateRange.end)
            .order('snapshot_date', { ascending: false })
            .range(offset, offset + limit - 1)

        const { data: snapshots, error, count } = await query

        if (error) {
            apiLogger.error({ error }, 'Error fetching HPP snapshots from database')
            return NextResponse.json(
                { error: 'Failed to fetch snapshots', details: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({
            snapshots: snapshots || [],
            recipe_name: recipe.nama,
            total: count || 0,
            period,
            date_range: dateRange
        })

    } catch (error: unknown) {
        apiLogger.error({ error }, 'Unexpected error in GET /api/hpp/snapshots')
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to calculate date range
function calculateDateRange(
    period: TimePeriod,
    startDate?: string | null,
    endDate?: string | null
): { start: string; end: string } {
    const end = endDate || new Date().toISOString().split('T')[0]
    let start: string

    if (startDate) {
        start = startDate
    } else {
        const date = new Date()
        switch (period) {
            case '7d':
                date.setDate(date.getDate() - 7)
                break
            case '30d':
                date.setDate(date.getDate() - 30)
                break
            case '90d':
                date.setDate(date.getDate() - 90)
                break
            case '1y':
                date.setFullYear(date.getFullYear() - 1)
                break
            default:
                date.setDate(date.getDate() - 30)
        }
        start = date.toISOString().split('T')[0]
    }

    return { start, end }
}

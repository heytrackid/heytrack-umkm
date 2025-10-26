import { createServiceRoleClient } from '@/utils/supabase'
import { getErrorMessage } from '@/lib/type-guards'
import type { HPPComparison, TimePeriod } from '@/types/hpp-tracking'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import { apiLogger } from '@/lib/logger'
// GET /api/hpp/comparison - Compare HPP between current and previous period
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const recipeId = searchParams.get('recipe_id')
        const period = (searchParams.get('period') || '30d') as TimePeriod

        // Validate required parameters
        if (!recipeId) {
            return NextResponse.json(
                { error: 'Missing required parameter: recipe_id' },
                { status: 400 }
            )
        }

        const supabase = createServiceRoleClient()

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

        // Calculate date ranges for current and previous periods
        const currentPeriod = calculatePeriodRange(period, 0)
        const previousPeriod = calculatePeriodRange(period, 1)

        // Fetch snapshots for current period
        const { data: currentSnapshots, error: currentError } = await supabase
            .from('hpp_snapshots')
            .select('hpp_value')
            .eq('recipe_id', recipeId)
            .gte('snapshot_date', currentPeriod.start)
            .lte('snapshot_date', currentPeriod.end)

        if (currentError) {
            apiLogger.error({ error: currentError }, 'Error fetching current period snapshots:')
            return NextResponse.json(
                { error: 'Failed to fetch current period data', details: (currentError as any).message },
                { status: 500 }
            )
        }

        // Fetch snapshots for previous period
        const { data: previousSnapshots, error: previousError } = await supabase
            .from('hpp_snapshots')
            .select('hpp_value')
            .eq('recipe_id', recipeId)
            .gte('snapshot_date', previousPeriod.start)
            .lte('snapshot_date', previousPeriod.end)

        if (previousError) {
            apiLogger.error({ error: previousError }, 'Error fetching previous period snapshots:')
            return NextResponse.json(
                { error: 'Failed to fetch previous period data', details: (previousError as any).message },
                { status: 500 }
            )
        }

        // Check if we have sufficient data
        if (!currentSnapshots || currentSnapshots.length === 0) {
            return NextResponse.json(
                { error: 'Insufficient data for current period' },
                { status: 404 }
            )
        }

        // Calculate statistics for current period
        const currentStats = calculateStatistics(
            currentSnapshots.map(s => (s as any).hpp_value),
            currentPeriod.start,
            currentPeriod.end
        )

        // Calculate statistics for previous period (if available)
        const previousStats = previousSnapshots && previousSnapshots.length > 0
            ? calculateStatistics(
                previousSnapshots.map(s => (s as any).hpp_value),
                previousPeriod.start,
                previousPeriod.end
            )
            : null

        // Calculate change metrics
        const change = previousStats
            ? {
                absolute: currentStats.avg_hpp - previousStats.avg_hpp,
                percentage: ((currentStats.avg_hpp - previousStats.avg_hpp) / previousStats.avg_hpp) * 100,
                trend: determineTrend(currentStats.avg_hpp, previousStats.avg_hpp)
            }
            : {
                absolute: 0,
                percentage: 0,
                trend: 'stable' as const
            }

        const comparison: HPPComparison = {
            current_period: currentStats,
            previous_period: previousStats || {
                avg_hpp: 0,
                min_hpp: 0,
                max_hpp: 0,
                start_date: previousPeriod.start,
                end_date: previousPeriod.end
            },
            change
        }

        return NextResponse.json({
            success: true,
            data: comparison,
            meta: {
                recipe_name: (recipe as any).nama,
                period,
                has_previous_data: !!previousStats
            }
        })

    } catch (error: unknown) {
        apiLogger.error({ error: error }, 'Error in comparison endpoint:')
        return NextResponse.json(
            { error: 'Internal server error', details: getErrorMessage(error) },
            { status: 500 }
        )
    }
}

// Helper function to calculate period range
function calculatePeriodRange(
    period: TimePeriod,
    periodsAgo: number = 0
): { start: string; end: string } {
    const end = new Date()
    const start = new Date(end)

    // Calculate period length in days
    let periodDays: number
    switch (period) {
        case '7d':
            periodDays = 7
            break
        case '30d':
            periodDays = 30
            break
        case '90d':
            periodDays = 90
            break
        case '1y':
            periodDays = 365
            break
        default:
            periodDays = 30
    }

    // Adjust for periods ago
    if (periodsAgo > 0) {
        end.setDate(end.getDate() - (periodDays * periodsAgo))
        start.setDate(end.getDate() - periodDays)
    } else {
        start.setDate(start.getDate() - periodDays)
    }

    return {
        start: start.toISOString(),
        end: end.toISOString()
    }
}

// Helper function to calculate statistics
function calculateStatistics(
    values: number[],
    startDate: string,
    endDate: string
): {
    avg_hpp: number
    min_hpp: number
    max_hpp: number
    start_date: string
    end_date: string
} {
    if (values.length === 0) {
        return {
            avg_hpp: 0,
            min_hpp: 0,
            max_hpp: 0,
            start_date: startDate,
            end_date: endDate
        }
    }

    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return {
        avg_hpp: avg,
        min_hpp: min,
        max_hpp: max,
        start_date: startDate,
        end_date: endDate
    }
}

// Helper function to determine trend
function determineTrend(current: number, previous: number): 'up' | 'down' | 'stable' {
    const changePercentage = ((current - previous) / previous) * 100

    if (changePercentage > 5) {return 'up'}
    if (changePercentage < -5) {return 'down'}
    return 'stable'
}

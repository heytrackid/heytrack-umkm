import type { Database } from '@/types'
import type { HPPComparison, TimePeriod } from '@/types/hpp-tracking'
import { calculateHPP, HPPCalculationResult } from './hpp-calculator'
import { createSupabaseClient } from './supabase'

import { apiLogger } from '@/lib/logger'
type HPPSnapshotInsert = Database['public']['Tables']['hpp_snapshots']['Insert']
type HPPSnapshotRow = Database['public']['Tables']['hpp_snapshots']['Row']

/**
 * Create a new HPP snapshot for a recipe
 * Calculates current HPP and saves it to the database
 */
export async function createSnapshot(
    recipeId: string,
    userId: string,
    sellingPrice?: number
): Promise<HPPSnapshotRow> {
    // Calculate current HPP
    const hppResult: HPPCalculationResult = await calculateHPP(recipeId, userId)

    // Calculate margin if selling price is provided
    let marginPercentage: number | null = null
    if (sellingPrice && sellingPrice > 0) {
        marginPercentage = ((sellingPrice - hppResult.total_hpp) / sellingPrice) * 100
    }

    // Prepare snapshot data
    const snapshotData: HPPSnapshotInsert = {
        recipe_id: recipeId,
        user_id: userId,
        snapshot_date: new Date().toISOString(),
        hpp_value: hppResult.total_hpp,
        material_cost: hppResult.material_cost,
        operational_cost: hppResult.operational_cost,
        cost_breakdown: hppResult.breakdown as any,
        selling_price: sellingPrice || null,
        margin_percentage: marginPercentage
    }

    // Validate data
    if (snapshotData.hpp_value < 0) {
        throw new Error('Invalid HPP value: cannot be negative')
    }

    if (snapshotData.material_cost < 0 || snapshotData.operational_cost < 0) {
        throw new Error('Invalid cost values: cannot be negative')
    }

    // Save to database
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
        .from('hpp_snapshots')
        .insert(snapshotData)
        .select()
        .single()

    if (error) {
        apiLogger.error({ error: error }, 'Failed to create snapshot:')
        throw new Error(`Failed to create snapshot: ${error.message}`)
    }

    return data
}

/**
 * Get recent snapshots for a recipe with optional date filtering
 */
export async function getRecentSnapshots(
    recipeId: string,
    userId: string,
    options?: {
        limit?: number
        startDate?: string
        endDate?: string
        period?: TimePeriod
    }
): Promise<HPPSnapshotRow[]> {
    const supabase = createSupabaseClient()

    let query = supabase
        .from('hpp_snapshots')
        .select('*')
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)
        .order('snapshot_date', { ascending: false })

    // Apply date filters
    if (options?.startDate) {
        query = query.gte('snapshot_date', options.startDate)
    }

    if (options?.endDate) {
        query = query.lte('snapshot_date', options.endDate)
    }

    // Apply period filter
    if (options?.period) {
        const dateRange = getPeriodDateRange(options.period)
        query = query.gte('snapshot_date', dateRange.start).lte('snapshot_date', dateRange.end)
    }

    // Apply limit
    if (options?.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
        apiLogger.error({ error: error }, 'Failed to fetch snapshots:')
        throw new Error(`Failed to fetch snapshots: ${error.message}`)
    }

    return data || []
}

/**
 * Compare snapshots between two periods
 * Returns comparison data with statistics and trend analysis
 */
export async function compareSnapshots(
    recipeId: string,
    userId: string,
    period: TimePeriod
): Promise<HPPComparison> {
    const currentPeriod = getPeriodDateRange(period)
    const previousPeriod = getPreviousPeriodDateRange(period)

    // Get snapshots for current period
    const currentSnapshots = await getRecentSnapshots(recipeId, userId, {
        startDate: currentPeriod.start,
        endDate: currentPeriod.end
    })

    // Get snapshots for previous period
    const previousSnapshots = await getRecentSnapshots(recipeId, userId, {
        startDate: previousPeriod.start,
        endDate: previousPeriod.end
    })

    // Calculate statistics for current period
    const currentStats = calculatePeriodStats(currentSnapshots, currentPeriod)

    // Calculate statistics for previous period
    const previousStats = calculatePeriodStats(previousSnapshots, previousPeriod)

    // Calculate change
    const absoluteChange = currentStats.avg_hpp - previousStats.avg_hpp
    const percentageChange = previousStats.avg_hpp > 0
        ? (absoluteChange / previousStats.avg_hpp) * 100
        : 0

    // Determine trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (Math.abs(percentageChange) > 5) {
        trend = percentageChange > 0 ? 'up' : 'down'
    }

    return {
        current_period: currentStats,
        previous_period: previousStats,
        change: {
            absolute: absoluteChange,
            percentage: percentageChange,
            trend
        }
    }
}

/**
 * Calculate statistics for a period
 */
function calculatePeriodStats(
    snapshots: HPPSnapshotRow[],
    period: { start: string; end: string }
): {
    avg_hpp: number
    min_hpp: number
    max_hpp: number
    start_date: string
    end_date: string
} {
    if (snapshots.length === 0) {
        return {
            avg_hpp: 0,
            min_hpp: 0,
            max_hpp: 0,
            start_date: period.start,
            end_date: period.end
        }
    }

    const hppValues = snapshots.map(s => s.hpp_value)
    const sum = hppValues.reduce((acc, val) => acc + val, 0)
    const avg = sum / hppValues.length
    const min = Math.min(...hppValues)
    const max = Math.max(...hppValues)

    return {
        avg_hpp: avg,
        min_hpp: min,
        max_hpp: max,
        start_date: period.start,
        end_date: period.end
    }
}

/**
 * Get date range for a time period
 */
export function getPeriodDateRange(period: TimePeriod): { start: string; end: string } {
    const end = new Date()
    const start = new Date()

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
    }

    return {
        start: start.toISOString(),
        end: end.toISOString()
    }
}

/**
 * Get date range for the previous period (for comparison)
 */
function getPreviousPeriodDateRange(period: TimePeriod): { start: string; end: string } {
    const currentRange = getPeriodDateRange(period)
    const currentStart = new Date(currentRange.start)
    const currentEnd = new Date(currentRange.end)

    // Calculate period duration in milliseconds
    const duration = currentEnd.getTime() - currentStart.getTime()

    // Calculate previous period
    const previousEnd = new Date(currentStart.getTime())
    const previousStart = new Date(currentStart.getTime() - duration)

    return {
        start: previousStart.toISOString(),
        end: previousEnd.toISOString()
    }
}

/**
 * Delete old snapshots (for archival purposes)
 * Returns the number of snapshots deleted
 */
export async function deleteOldSnapshots(
    userId: string,
    olderThanDate: string
): Promise<number> {
    const supabase = createSupabaseClient()

    const { data, error } = await supabase
        .from('hpp_snapshots')
        .delete()
        .eq('user_id', userId)
        .lt('snapshot_date', olderThanDate)
        .select()

    if (error) {
        apiLogger.error({ error: error }, 'Failed to delete old snapshots:')
        throw new Error(`Failed to delete old snapshots: ${error.message}`)
    }

    return data?.length || 0
}

/**
 * Get snapshot count for a recipe
 */
export async function getSnapshotCount(
    recipeId: string,
    userId: string
): Promise<number> {
    const supabase = createSupabaseClient()

    const { count, error } = await supabase
        .from('hpp_snapshots')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', recipeId)
        .eq('user_id', userId)

    if (error) {
        apiLogger.error({ error: error }, 'Failed to get snapshot count:')
        return 0
    }

    return count || 0
}

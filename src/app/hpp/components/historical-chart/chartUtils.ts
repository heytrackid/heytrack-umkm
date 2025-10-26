import type { HPPSnapshot, TimePeriod } from '@/types/hpp-tracking'

// Period filter options - using utility function
export const PERIOD_OPTIONS: Array<{ value: TimePeriod; label: string }> = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '90d', label: '90 Hari' },
    { value: '1y', label: '1 Tahun' }
]

// Chart colors for single product
export const CHART_COLORS = {
    hpp: '#3b82f6',
    material: '#10b981',
    operational: '#f59e0b'
}

// Colors for multi-product comparison
export const MULTI_PRODUCT_COLORS = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // orange
    '#ef4444', // red
    '#8b5cf6'  // purple
]

export interface ChartStatistics {
    min: number
    max: number
    avg: number
    trend: 'up' | 'down' | 'neutral'
}

interface Recipe {
    id: string
    name: string
}

export interface ChartDataPoint {
    date: string
    hpp?: number
    material?: number
    operational?: number
    fullDate: string
    [key: string]: any // For multi-product keys
}

// Format chart data for single product
export function formatSingleProductChartData(snapshots: HPPSnapshot[]): ChartDataPoint[] {
    return snapshots.map(snapshot => ({
        date: new Date(snapshot.snapshot_date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short'
        }),
        hpp: snapshot.hpp_value,
        material: snapshot.material_cost,
        operational: snapshot.operational_cost,
        fullDate: snapshot.snapshot_date
    }))
}

// Format chart data for multi-product comparison
export function formatMultiProductChartData(
    multiProductData: Record<string, HPPSnapshot[]>,
    recipes: Recipe[]
): ChartDataPoint[] {
    const dateMap = new Map<string, ChartDataPoint>()

    Object.entries(multiProductData).forEach(([recipeId, snapshots]) => {
        const recipe = recipes.find(r => r.id === recipeId)
        const recipeName = recipe?.name || recipeId

        snapshots.forEach(snapshot => {
            const dateKey = new Date(snapshot.snapshot_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short'
            })

            if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, { date: dateKey, fullDate: snapshot.snapshot_date })
            }

            const entry = dateMap.get(dateKey)!
            entry[recipeId] = snapshot.hpp_value
            entry[`${recipeId}_name`] = recipeName
        })
    })

    return Array.from(dateMap.values()).sort((a, b) =>
        new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    )
}

// Calculate statistics for single product
export function calculateSingleProductStats(snapshots: HPPSnapshot[]): ChartStatistics {
    if (snapshots.length === 0) {
        return { min: 0, max: 0, avg: 0, trend: 'neutral' }
    }

    const values = snapshots.map(s => s.hpp_value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    // Calculate trend
    let trend: 'up' | 'down' | 'neutral' = 'neutral'
    if (snapshots.length >= 2) {
        const first = snapshots[snapshots.length - 1].hpp_value
        const last = snapshots[0].hpp_value
        const change = ((last - first) / first) * 100

        if (change > 5) trend = 'up'
        else if (change < -5) trend = 'down'
    }

    return { min, max, avg, trend }
}

// Calculate statistics for multi-product comparison
export function calculateMultiProductStats(multiProductData: Record<string, HPPSnapshot[]>): ChartStatistics {
    const allValues: number[] = []
    Object.values(multiProductData).forEach(snapshots => {
        allValues.push(...snapshots.map(s => s.hpp_value))
    })

    if (allValues.length === 0) {
        return { min: 0, max: 0, avg: 0, trend: 'neutral' }
    }

    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const avg = allValues.reduce((a, b) => a + b, 0) / allValues.length

    return { min, max, avg, trend: 'neutral' }
}

// Get trend icon and color utilities
export function getTrendIcon(trend: 'up' | 'down' | 'neutral') {
    switch (trend) {
        case 'up':
            return 'trending-up'
        case 'down':
            return 'trending-down'
        default:
            return 'minus'
    }
}

export function getTrendColor(trend: 'up' | 'down' | 'neutral') {
    switch (trend) {
        case 'up':
            return 'destructive'
        case 'down':
            return 'default'
        default:
            return 'secondary'
    }
}

export function getTrendLabel(trend: 'up' | 'down' | 'neutral') {
    switch (trend) {
        case 'up':
            return 'Naik'
        case 'down':
            return 'Turun'
        default:
            return 'Stabil'
    }
}

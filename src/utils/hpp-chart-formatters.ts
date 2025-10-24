/**
 * HPP Chart Data Formatters
 * Formats snapshot data for Recharts visualization
 */

import { HPPSnapshot, HPPTrendData, TimePeriod } from '@/types/hpp-tracking'
import { formatChartDate, isSameDay } from './hpp-date-utils'

export interface ChartDataPoint {
    date: string
    displayDate: string
    hpp: number
    material_cost: number
    operational_cost: number
    timestamp: number
}

export interface MultiProductChartData {
    date: string
    displayDate: string
    timestamp: number
    [key: string]: string | number // Dynamic keys for each product
}

/**
 * Format snapshots for single product chart
 * @param snapshots - Array of HPP snapshots
 * @param period - Time period for date formatting
 * @returns Formatted chart data points
 */
export function formatSnapshotsForChart(
    snapshots: HPPSnapshot[],
    period: TimePeriod = '30d'
): ChartDataPoint[] {
    if (!snapshots || snapshots.length === 0) {
        return []
    }

    // Sort by date ascending
    const sorted = [...snapshots].sort(
        (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    )

    return sorted.map((snapshot) => {
        const date = new Date(snapshot.snapshot_date)
        return {
            date: snapshot.snapshot_date,
            displayDate: formatChartDate(date, period),
            hpp: snapshot.hpp_value,
            material_cost: snapshot.material_cost,
            operational_cost: snapshot.operational_cost,
            timestamp: date.getTime()
        }
    })
}

/**
 * Format trend data for chart
 * @param trendData - Array of trend data
 * @param period - Time period for date formatting
 * @returns Formatted chart data points
 */
export function formatTrendDataForChart(
    trendData: HPPTrendData[],
    period: TimePeriod = '30d'
): ChartDataPoint[] {
    if (!trendData || trendData.length === 0) {
        return []
    }

    return trendData.map((data) => {
        const date = new Date(data.date)
        return {
            date: data.date,
            displayDate: formatChartDate(date, period),
            hpp: data.hpp,
            material_cost: data.material_cost,
            operational_cost: data.operational_cost,
            timestamp: date.getTime()
        }
    })
}

/**
 * Format multiple products data for comparison chart
 * @param productsData - Map of recipe_id to snapshots
 * @param recipeNames - Map of recipe_id to recipe name
 * @param period - Time period for date formatting
 * @returns Formatted multi-product chart data
 */
export function formatMultiProductData(
    productsData: Record<string, HPPSnapshot[]>,
    recipeNames: Record<string, string>,
    period: TimePeriod = '30d'
): MultiProductChartData[] {
    // Get all unique dates across all products
    const allDates = new Set<string>()
    Object.values(productsData).forEach((snapshots) => {
        snapshots.forEach((snapshot) => {
            const date = new Date(snapshot.snapshot_date)
            date.setHours(0, 0, 0, 0)
            allDates.add(date.toISOString())
        })
    })

    // Sort dates
    const sortedDates = Array.from(allDates).sort()

    // Create data points for each date
    return sortedDates.map((dateStr) => {
        const date = new Date(dateStr)
        const dataPoint: MultiProductChartData = {
            date: dateStr,
            displayDate: formatChartDate(date, period),
            timestamp: date.getTime()
        }

        // Add HPP value for each product
        Object.entries(productsData).forEach(([recipeId, snapshots]) => {
            const snapshot = snapshots.find((s) =>
                isSameDay(s.snapshot_date, dateStr)
            )

            const recipeName = recipeNames[recipeId] || recipeId
            dataPoint[recipeName] = snapshot ? snapshot.hpp_value : null
        })

        return dataPoint
    })
}

/**
 * Aggregate snapshots by date (for multiple snapshots per day)
 * @param snapshots - Array of HPP snapshots
 * @param aggregation - Aggregation method ('avg', 'last', 'first')
 * @returns Aggregated snapshots
 */
export function aggregateSnapshotsByDate(
    snapshots: HPPSnapshot[],
    aggregation: 'avg' | 'last' | 'first' = 'last'
): HPPSnapshot[] {
    if (!snapshots || snapshots.length === 0) {
        return []
    }

    // Group by date
    const grouped = snapshots.reduce((acc, snapshot) => {
        const date = new Date(snapshot.snapshot_date)
        date.setHours(0, 0, 0, 0)
        const dateKey = date.toISOString()

        if (!acc[dateKey]) {
            acc[dateKey] = []
        }
        acc[dateKey].push(snapshot)
        return acc
    }, {} as Record<string, HPPSnapshot[]>)

    // Aggregate each group
    return Object.entries(grouped).map(([dateKey, group]) => {
        switch (aggregation) {
            case 'avg':
                return aggregateAverage(group, dateKey)
            case 'first':
                return group.sort(
                    (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
                )[0]
            case 'last':
            default:
                return group.sort(
                    (a, b) => new Date(b.snapshot_date).getTime() - new Date(a.snapshot_date).getTime()
                )[0]
        }
    })
}

/**
 * Calculate average of snapshots for a date
 */
function aggregateAverage(snapshots: HPPSnapshot[], dateKey: string): HPPSnapshot {
    const count = snapshots.length
    const sum = snapshots.reduce(
        (acc, s) => ({
            hpp_value: acc.hpp_value + s.hpp_value,
            material_cost: acc.material_cost + s.material_cost,
            operational_cost: acc.operational_cost + s.operational_cost
        }),
        { hpp_value: 0, material_cost: 0, operational_cost: 0 }
    )

    return {
        ...snapshots[0],
        snapshot_date: dateKey,
        hpp_value: sum.hpp_value / count,
        material_cost: sum.material_cost / count,
        operational_cost: sum.operational_cost / count
    }
}

/**
 * Fill missing data points with interpolation or null
 * @param data - Chart data points
 * @param fillMethod - Method to fill gaps ('interpolate', 'null', 'previous')
 * @returns Data with filled gaps
 */
export function fillMissingDataPoints(
    data: ChartDataPoint[],
    fillMethod: 'interpolate' | 'null' | 'previous' = 'null'
): ChartDataPoint[] {
    if (!data || data.length < 2) {
        return data
    }

    const filled: ChartDataPoint[] = []
    const sorted = [...data].sort((a, b) => a.timestamp - b.timestamp)

    for (let i = 0; i < sorted.length - 1; i++) {
        filled.push(sorted[i])

        const current = sorted[i]
        const next = sorted[i + 1]
        const daysDiff = Math.floor(
            (next.timestamp - current.timestamp) / (1000 * 60 * 60 * 24)
        )

        // If gap is more than 1 day, fill it
        if (daysDiff > 1) {
            for (let j = 1; j < daysDiff; j++) {
                const gapDate = new Date(current.timestamp + j * 24 * 60 * 60 * 1000)

                let gapValue: Partial<ChartDataPoint>

                switch (fillMethod) {
                    case 'interpolate':
                        const ratio = j / daysDiff
                        gapValue = {
                            hpp: current.hpp + (next.hpp - current.hpp) * ratio,
                            material_cost: current.material_cost + (next.material_cost - current.material_cost) * ratio,
                            operational_cost: current.operational_cost + (next.operational_cost - current.operational_cost) * ratio
                        }
                        break
                    case 'previous':
                        gapValue = {
                            hpp: current.hpp,
                            material_cost: current.material_cost,
                            operational_cost: current.operational_cost
                        }
                        break
                    case 'null':
                    default:
                        gapValue = {
                            hpp: null,
                            material_cost: null,
                            operational_cost: null
                        }
                }

                filled.push({
                    date: gapDate.toISOString(),
                    displayDate: current.displayDate,
                    timestamp: gapDate.getTime(),
                    ...gapValue
                } as ChartDataPoint)
            }
        }
    }

    filled.push(sorted[sorted.length - 1])
    return filled
}

/**
 * Calculate moving average for smoothing chart data
 * @param data - Chart data points
 * @param windowSize - Number of points to average (default: 3)
 * @returns Data with moving average
 */
export function calculateMovingAverage(
    data: ChartDataPoint[],
    windowSize: number = 3
): ChartDataPoint[] {
    if (!data || data.length < windowSize) {
        return data
    }

    return data.map((point, index) => {
        const start = Math.max(0, index - Math.floor(windowSize / 2))
        const end = Math.min(data.length, start + windowSize)
        const window = data.slice(start, end)

        const avg = window.reduce(
            (acc, p) => ({
                hpp: acc.hpp + p.hpp / window.length,
                material_cost: acc.material_cost + p.material_cost / window.length,
                operational_cost: acc.operational_cost + p.operational_cost / window.length
            }),
            { hpp: 0, material_cost: 0, operational_cost: 0 }
        )

        return {
            ...point,
            hpp: avg.hpp,
            material_cost: avg.material_cost,
            operational_cost: avg.operational_cost
        }
    })
}

/**
 * Get chart domain (min/max) with padding
 * @param data - Chart data points
 * @param field - Field to calculate domain for
 * @param padding - Padding percentage (default: 0.1 = 10%)
 * @returns [min, max] domain
 */
export function getChartDomain(
    data: ChartDataPoint[],
    field: keyof Pick<ChartDataPoint, 'hpp' | 'material_cost' | 'operational_cost'>,
    padding: number = 0.1
): [number, number] {
    if (!data || data.length === 0) {
        return [0, 100]
    }

    const values = data.map((d) => d[field]).filter((v) => v != null) as number[]

    if (values.length === 0) {
        return [0, 100]
    }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min

    return [
        Math.max(0, min - range * padding),
        max + range * padding
    ]
}

/**
 * Format tooltip value for charts
 * @param value - Value to format
 * @param type - Type of value ('currency', 'percentage', 'number')
 * @returns Formatted string
 */
export function formatTooltipValue(
    value: number,
    type: 'currency' | 'percentage' | 'number' = 'currency'
): string {
    if (value == null) {
        return '-'
    }

    switch (type) {
        case 'currency':
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value)
        case 'percentage':
            return `${value.toFixed(1)}%`
        case 'number':
            return value.toLocaleString('id-ID')
        default:
            return String(value)
    }
}

'use client'

import { BarChart3, DollarSign, Receipt, TrendingUp } from '@/components/icons'

import { StatsCards, type StatCardData } from '@/components/ui/stats-cards'

import type { Row } from '@/types/database'


type OperationalCost = Row<'operational_costs'>

interface OperationalCostStatsProps {
    costs: OperationalCost[]
    formatCurrency: (amount: number) => string
    calculateMonthlyCost: (cost: OperationalCost) => number
}

export const OperationalCostStats = ({
    costs,
    formatCurrency,
    calculateMonthlyCost,
}: OperationalCostStatsProps) => {
    // Calculate stats
    const totalCosts = costs.length
    const fixedCosts = costs.filter((c) => c.recurring).length
    const variableCosts = costs.filter((c) => !c.recurring).length
    const totalMonthly = costs.reduce((sum, cost) => sum + calculateMonthlyCost(cost), 0)

    const stats: StatCardData[] = [
        {
            title: 'Total Biaya',
            value: totalCosts,
            description: 'item biaya',
            icon: Receipt,
        },
        {
            title: 'Biaya Tetap',
            value: fixedCosts,
            description: 'biaya rutin',
            icon: TrendingUp,
        },
        {
            title: 'Biaya Variabel',
            value: variableCosts,
            description: 'biaya tidak tetap',
            icon: BarChart3,
        },
        {
            title: 'Total Bulanan',
            value: formatCurrency(totalMonthly),
            description: 'per bulan',
            icon: DollarSign,
        },
    ]

    return (
        <StatsCards stats={stats} gridClassName="grid grid-cols-2 gap-4 lg:grid-cols-4" />
    )
}



'use client'

import { Receipt, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

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

    return (
        <div className="grid gap-4 md:grid-cols-4">
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Biaya</p>
                            <p className="text-2xl font-bold">{totalCosts}</p>
                            <p className="text-xs text-muted-foreground">item biaya</p>
                        </div>
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Biaya Tetap</p>
                            <p className="text-2xl font-bold">{fixedCosts}</p>
                            <p className="text-xs text-muted-foreground">biaya rutin</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Biaya Variabel</p>
                            <p className="text-2xl font-bold">{variableCosts}</p>
                            <p className="text-xs text-muted-foreground">biaya tidak tetap</p>
                        </div>
                        <BarChart3 className="h-8 w-8 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Bulanan</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
                            <p className="text-xs text-muted-foreground">per bulan</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}



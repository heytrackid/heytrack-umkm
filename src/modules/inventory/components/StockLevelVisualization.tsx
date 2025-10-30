'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/supabase-generated'
type Ingredient = Database['public']['Tables']['ingredients']['Row']
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useCurrency } from '@/hooks/useCurrency'
import {
    Package,
    AlertTriangle,
    CheckCircle,
    TrendingDown,
    TrendingUp,
    DollarSign
} from 'lucide-react'

interface StockLevelVisualizationProps {
    ingredients: Ingredient[]
}

type StockStatus = 'critical' | 'low' | 'normal' | 'good'

const getStockStatus = (current: number, min: number): StockStatus => {
    if (current <= 0) {return 'critical'}
    if (current <= min * 0.5) {return 'critical'}
    if (current <= min) {return 'low'}
    if (current <= min * 2) {return 'normal'}
    return 'good'
}

const getStockColor = (status: StockStatus) => {
    switch (status) {
        case 'critical': return 'text-red-600 bg-red-50 border-red-200'
        case 'low': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'normal': return 'text-blue-600 bg-blue-50 border-blue-200'
        case 'good': return 'text-green-600 bg-green-50 border-green-200'
    }
}

const getStockIcon = (status: StockStatus) => {
    switch (status) {
        case 'critical': return AlertTriangle
        case 'low': return TrendingDown
        case 'normal': return Package
        case 'good': return CheckCircle
    }
}

const getStockLabel = (status: StockStatus) => {
    switch (status) {
        case 'critical': return 'Kritis'
        case 'low': return 'Rendah'
        case 'normal': return 'Normal'
        case 'good': return 'Baik'
    }
}

export const StockLevelVisualization = ({ ingredients }: StockLevelVisualizationProps) => {
    const { formatCurrency } = useCurrency()

    // Group by status
    const byStatus = ingredients.reduce((acc, ing) => {
        const status = getStockStatus(ing.current_stock ?? 0, ing.min_stock ?? 0)
        if (!acc[status]) {acc[status] = []}
        acc[status].push(ing)
        return acc
    }, {} as Record<StockStatus, Ingredient[]>)

    // Calculate stats
    const criticalCount = byStatus.critical?.length || 0
    const lowCount = byStatus.low?.length || 0
    const normalCount = byStatus.normal?.length || 0
    const goodCount = byStatus.good?.length || 0
    const totalCount = ingredients.length
    const safeTotalCount = totalCount === 0 ? 1 : totalCount

    const criticalValue = byStatus.critical?.reduce((sum, i) =>
        sum + ((i.current_stock ?? 0) * i.price_per_unit), 0) || 0
    const totalValue = ingredients.reduce((sum, i) =>
        sum + ((i.current_stock ?? 0) * i.price_per_unit), 0)

    return (
        <div className="space-y-4">
            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-2 border-red-200 bg-red-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <Badge variant="destructive" className="text-xs">
                                Urgent
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{criticalCount}</div>
                        <div className="text-xs text-red-700 mt-1">Stok Kritis</div>
                        {criticalCount > 0 && (
                            <div className="text-xs text-red-600 mt-2 font-medium">
                                Nilai: {formatCurrency(criticalValue)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-orange-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingDown className="h-5 w-5 text-orange-600" />
                            <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                Warning
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">{lowCount}</div>
                        <div className="text-xs text-orange-700 mt-1">Stok Rendah</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                OK
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{normalCount}</div>
                        <div className="text-xs text-blue-700 mt-1">Stok Normal</div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <Badge variant="default" className="text-xs bg-green-600">
                                Good
                            </Badge>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{goodCount}</div>
                        <div className="text-xs text-green-700 mt-1">Stok Baik</div>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Distribusi Status Stok
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Visual Bar */}
                        <div className="relative h-12 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            {criticalCount > 0 && (
                                <div
                                    className="absolute h-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white text-xs font-medium"
                                    style={{ width: `${(criticalCount / totalCount) * 100}%` }}
                                >
                                    {((criticalCount / totalCount) * 100).toFixed(0)}%
                                </div>
                            )}
                            {lowCount > 0 && (
                                <div
                                    className="absolute h-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-medium"
                                    style={{
                                        left: `${(criticalCount / safeTotalCount) * 100}%`,
                                        width: `${(lowCount / safeTotalCount) * 100}%`
                                    }}
                                >
                                    {((lowCount / safeTotalCount) * 100).toFixed(0)}%
                                </div>
                            )}
                            {normalCount > 0 && (
                                <div
                                    className="absolute h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium"
                                    style={{
                                        left: `${((criticalCount + lowCount) / safeTotalCount) * 100}%`,
                                        width: `${(normalCount / safeTotalCount) * 100}%`
                                    }}
                                >
                                    {((normalCount / safeTotalCount) * 100).toFixed(0)}%
                                </div>
                            )}
                            {goodCount > 0 && (
                                <div
                                    className="absolute h-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-medium"
                                    style={{
                                        left: `${((criticalCount + lowCount + normalCount) / safeTotalCount) * 100}%`,
                                        width: `${(goodCount / safeTotalCount) * 100}%`
                                    }}
                                >
                                    {((goodCount / safeTotalCount) * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>🔴 Kritis ({criticalCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span>🟠 Rendah ({lowCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>🔵 Normal ({normalCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>🟢 Baik ({goodCount})</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed List by Status */}
            {(['critical', 'low', 'normal', 'good'] as StockStatus[]).map(status => {
                const items = byStatus[status] || []
                if (items.length === 0) {return null}

                const Icon = getStockIcon(status)
                const colorClass = getStockColor(status)

                return (
                    <Card key={status} className={`border-2 ${colorClass}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Icon className="h-5 w-5" />
                                {getStockLabel(status)} ({items.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {items.map(ing => {
                                    const currentStock = ing.current_stock ?? 0
                                    const minStock = ing.min_stock ?? 0
                                    const maxStockBaseline = Math.max(minStock * 2, 1)
                                    const stockPercent = (currentStock / maxStockBaseline) * 100
                                    const value = currentStock * (ing.price_per_unit ?? 0)

                                    return (
                                        <div key={ing.id} className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <div className="font-medium">{ing.name}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">
                                                        {currentStock} {ing.unit ?? ''} / Min: {minStock} {ing.unit ?? ''}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-sm">{formatCurrency(value)}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatCurrency(ing.price_per_unit ?? 0)}/{ing.unit ?? ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <Progress
                                                value={Math.min(stockPercent, 100)}
                                                className="h-2"
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}

            {/* Total Value Summary */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Total Nilai Inventory</div>
                                <div className="text-3xl font-bold text-purple-600">
                                    {formatCurrency(totalValue)}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Items</div>
                            <div className="text-2xl font-bold">{totalCount}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

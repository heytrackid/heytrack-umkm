'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useCurrency } from '@/hooks/useCurrency'
import { Calculator, TrendingUp, TrendingDown, AlertTriangle, Sparkles } from 'lucide-react'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Scenario {
    id: string
    name: string
    changes: Array<{
        ingredient: string
        type: 'price' | 'quantity'
        change: number // percentage
    }>
    impact: {
        newCost: number
        costDiff: number
        costDiffPercent: number
        newMargin: number
        marginDiff: number
    }
}

interface HppScenarioPlannerProps {
    recipe: {
        id: string
        name: string
        total_cost: number
        selling_price?: number
        recipe_ingredients?: Array<{
            quantity: number
            unit: string
            ingredient?: {
                id: string
                name: string
                price_per_unit: number
            }
        }>
    }
}

export function HppScenarioPlanner({ recipe }: HppScenarioPlannerProps) {
    const { formatCurrency } = useCurrency()
    const [scenarios, setScenarios] = useState<Scenario[]>([])
    const [selectedIngredient, setSelectedIngredient] = useState('')
    const [changeType, setChangeType] = useState<'price' | 'quantity'>('price')
    const [changePercent, setChangePercent] = useState(10)

    const currentCost = recipe.total_cost
    const sellingPrice = recipe.selling_price || 0
    const currentMargin = sellingPrice > 0 ? ((sellingPrice - currentCost) / sellingPrice) * 100 : 0

    const calculateScenario = (
        ingredientId: string,
        type: 'price' | 'quantity',
        changePercent: number
    ) => {
        const ingredient = recipe.recipe_ingredients?.find(
            ri => ri.ingredient?.id === ingredientId
        )
        if (!ingredient?.ingredient) return null

        const originalCost = ingredient.ingredient.price_per_unit * ingredient.quantity
        const multiplier = 1 + (changePercent / 100)

        let newIngredientCost = originalCost
        if (type === 'price') {
            newIngredientCost = ingredient.ingredient.price_per_unit * multiplier * ingredient.quantity
        } else {
            newIngredientCost = ingredient.ingredient.price_per_unit * ingredient.quantity * multiplier
        }

        const costDiff = newIngredientCost - originalCost
        const newTotalCost = currentCost + costDiff
        const newMargin = sellingPrice > 0 ? ((sellingPrice - newTotalCost) / sellingPrice) * 100 : 0

        return {
            newCost: newTotalCost,
            costDiff,
            costDiffPercent: (costDiff / currentCost) * 100,
            newMargin,
            marginDiff: newMargin - currentMargin
        }
    }

    const addScenario = () => {
        if (!selectedIngredient) return

        const ingredient = recipe.recipe_ingredients?.find(
            ri => ri.ingredient?.id === selectedIngredient
        )
        if (!ingredient?.ingredient) return

        const impact = calculateScenario(selectedIngredient, changeType, changePercent)
        if (!impact) return

        const newScenario: Scenario = {
            id: Date.now().toString(),
            name: `${ingredient.ingredient.name} ${changeType === 'price' ? 'harga' : 'qty'} ${changePercent > 0 ? '+' : ''}${changePercent}%`,
            changes: [{
                ingredient: ingredient.ingredient.name,
                type: changeType,
                change: changePercent
            }],
            impact
        }

        setScenarios([...scenarios, newScenario])
    }

    const removeScenario = (id: string) => {
        setScenarios(scenarios.filter(s => s.id !== id))
    }

    const quickScenarios = [
        { label: 'Inflasi 5%', type: 'price' as const, change: 5 },
        { label: 'Inflasi 10%', type: 'price' as const, change: 10 },
        { label: 'Inflasi 15%', type: 'price' as const, change: 15 },
        { label: 'Efisiensi -10%', type: 'quantity' as const, change: -10 },
    ]

    const applyQuickScenario = (type: 'price' | 'quantity', change: number) => {
        // Apply to all ingredients
        const allIngredients = recipe.recipe_ingredients?.filter(ri => ri.ingredient) || []

        let totalNewCost = currentCost
        allIngredients.forEach(ri => {
            if (!ri.ingredient) return
            const impact = calculateScenario(ri.ingredient.id, type, change)
            if (impact) {
                totalNewCost = impact.newCost
            }
        })

        const newMargin = sellingPrice > 0 ? ((sellingPrice - totalNewCost) / sellingPrice) * 100 : 0

        const newScenario: Scenario = {
            id: Date.now().toString(),
            name: `Semua bahan ${type === 'price' ? 'harga' : 'qty'} ${change > 0 ? '+' : ''}${change}%`,
            changes: allIngredients.map(ri => ({
                ingredient: ri.ingredient!.name,
                type,
                change
            })),
            impact: {
                newCost: totalNewCost,
                costDiff: totalNewCost - currentCost,
                costDiffPercent: ((totalNewCost - currentCost) / currentCost) * 100,
                newMargin,
                marginDiff: newMargin - currentMargin
            }
        }

        setScenarios([...scenarios, newScenario])
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Calculator className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div>Scenario Planning</div>
                            <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                Simulasi "What-If" untuk antisipasi perubahan biaya
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold">{formatCurrency(currentCost)}</div>
                            <div className="text-xs text-muted-foreground">HPP Saat Ini</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold">{formatCurrency(sellingPrice)}</div>
                            <div className="text-xs text-muted-foreground">Harga Jual</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-green-600">{currentMargin.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">Margin Saat Ini</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-blue-600">{scenarios.length}</div>
                            <div className="text-xs text-muted-foreground">Skenario Aktif</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-600" />
                        Skenario Cepat
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {quickScenarios.map((scenario, idx) => (
                            <Button
                                key={idx}
                                variant="outline"
                                className="h-auto py-3 flex flex-col items-center gap-2"
                                onClick={() => applyQuickScenario(scenario.type, scenario.change)}
                            >
                                <span className="text-2xl">
                                    {scenario.change > 0 ? '📈' : '📉'}
                                </span>
                                <span className="text-sm font-medium">{scenario.label}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Custom Scenario Builder */}
            <Card>
                <CardHeader>
                    <CardTitle>Buat Skenario Custom</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <Label>Pilih Bahan</Label>
                            <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih bahan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {recipe.recipe_ingredients?.map((ri) => (
                                        ri.ingredient && (
                                            <SelectItem key={ri.ingredient.id} value={ri.ingredient.id}>
                                                {ri.ingredient.name}
                                            </SelectItem>
                                        )
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Tipe Perubahan</Label>
                            <Select value={changeType} onValueChange={(v) => setChangeType(v as 'price' | 'quantity')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="price">Harga</SelectItem>
                                    <SelectItem value="quantity">Kuantitas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Perubahan (%)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={changePercent}
                                    onChange={(e) => setChangePercent(Number(e.target.value))}
                                    placeholder="10"
                                />
                                <Button onClick={addScenario} disabled={!selectedIngredient}>
                                    <Calculator className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        💡 <strong>Tips:</strong> Gunakan nilai negatif (contoh: -10) untuk simulasi penurunan harga atau efisiensi penggunaan bahan.
                    </div>
                </CardContent>
            </Card>

            {/* Scenarios List */}
            {scenarios.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Hasil Simulasi ({scenarios.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {scenarios.map((scenario) => {
                            const isNegative = scenario.impact.costDiff > 0
                            const marginImpact = scenario.impact.marginDiff

                            return (
                                <div
                                    key={scenario.id}
                                    className={`p-4 rounded-lg border-2 ${isNegative
                                            ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'
                                            : 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold">{scenario.name}</span>
                                                <Badge variant={isNegative ? "destructive" : "default"}>
                                                    {isNegative ? (
                                                        <TrendingUp className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <TrendingDown className="h-3 w-3 mr-1" />
                                                    )}
                                                    {scenario.impact.costDiffPercent > 0 ? '+' : ''}
                                                    {scenario.impact.costDiffPercent.toFixed(1)}%
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {scenario.changes.length} perubahan diterapkan
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeScenario(scenario.id)}
                                        >
                                            ✕
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                            <div className="text-sm font-bold">
                                                {formatCurrency(scenario.impact.newCost)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">HPP Baru</div>
                                        </div>

                                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                            <div className={`text-sm font-bold ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                                                {scenario.impact.costDiff > 0 ? '+' : ''}
                                                {formatCurrency(scenario.impact.costDiff)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">Selisih</div>
                                        </div>

                                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                            <div className="text-sm font-bold">
                                                {scenario.impact.newMargin.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">Margin Baru</div>
                                        </div>

                                        <div className="text-center p-2 bg-white dark:bg-gray-900 rounded">
                                            <div className={`text-sm font-bold ${marginImpact < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {marginImpact > 0 ? '+' : ''}
                                                {marginImpact.toFixed(1)}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">Dampak Margin</div>
                                        </div>
                                    </div>

                                    {scenario.impact.newMargin < 30 && (
                                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                                <strong>Peringatan:</strong> Margin di bawah 30% berisiko untuk sustainability bisnis.
                                                Pertimbangkan untuk menaikkan harga jual atau cari supplier alternatif.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {scenarios.length === 0 && (
                <Card className="border-2 border-dashed">
                    <CardContent className="py-12">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                <Calculator className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                                <p className="font-semibold mb-1">Belum Ada Skenario</p>
                                <p className="text-sm text-muted-foreground">
                                    Mulai dengan memilih skenario cepat di atas atau buat skenario custom
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

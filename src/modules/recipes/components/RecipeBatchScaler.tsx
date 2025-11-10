'use client'

import { Scale, TrendingUp, Package, DollarSign, Download, Calculator } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'



interface RecipeBatchScalerProps {
    recipe: {
        id: string
        name: string
        servings: number
        total_cost: number
        recipe_ingredients?: Array<{
            quantity: number
            unit: string
            ingredient?: {
                id?: string
                name: string
                price_per_unit: number
                stock_quantity?: number
            }
        }>
    }
}

export const RecipeBatchScaler = ({ recipe }: RecipeBatchScalerProps) => {
    const { formatCurrency } = useCurrency()
    const { toast } = useToast()
    const baseServings = Math.max(1, recipe.servings || 1)
    const baseCost = recipe.total_cost || 0

    const [targetServings, setTargetServings] = useState<number>(baseServings)
    const [targetBatches, setTargetBatches] = useState<number>(1)

    const safeServings = targetServings > 0 ? targetServings : 1
    const safeBatches = targetBatches > 0 ? targetBatches : 1
    const totalServings = safeServings * safeBatches
    const scaleFactor = totalServings / baseServings
    const scaledCost = baseCost * scaleFactor
    const costPerServing = totalServings > 0 ? scaledCost / totalServings : 0

    const quickScales = useMemo(() => ([
        { label: '2x', multiplier: 2 },
        { label: '5x', multiplier: 5 },
        { label: '10x', multiplier: 10 },
        { label: '20x', multiplier: 20 }
    ]), [])

    const applyQuickScale = (multiplier: number) => {
        setTargetBatches(multiplier)
        setTargetServings(baseServings)
    }

    const stockIssues = useMemo(() => {
        const issues: string[] = []
        recipe.recipe_ingredients?.forEach((ri) => {
            if (!ri.ingredient) { return }
            const needed = ri.quantity * scaleFactor
            const available = ri.ingredient.stock_quantity ?? 0
            if (available < needed) {
                issues.push(`${ri.ingredient.name}: butuh ${needed.toFixed(2)} ${ri.unit}, tersedia ${available.toFixed(2)} ${ri.unit}`)
            }
        })
        return issues
    }, [recipe.recipe_ingredients, scaleFactor])

    const hasStockIssues = stockIssues.length > 0

    const exportShoppingList = () => {
        toast({
            title: 'Fitur akan segera tersedia',
            description: 'Export shopping list akan segera tersedia!',
            variant: 'default'
        })
    }

    const recipeIngredients = recipe.recipe_ingredients ?? []

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="border-2 border-gray-300 dark:border-gray-800 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-950/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center">
                            <Scale className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <div>Batch Scaler</div>
                            <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                Hitung kebutuhan bahan untuk produksi batch besar
                            </p>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-gray-600">{baseServings}</div>
                            <div className="text-xs text-muted-foreground">Resep Asli</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-gray-600">{totalServings}</div>
                            <div className="text-xs text-muted-foreground">Target Produksi</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-gray-600">{scaleFactor.toFixed(1)}x</div>
                            <div className="text-xs text-muted-foreground">Scale Factor</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-orange-600">{formatCurrency(scaledCost)}</div>
                            <div className="text-xs text-muted-foreground">Total Biaya</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Scale Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Atur Skala Produksi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Quick Scale Buttons */}
                    <div>
                        <Label className="mb-2 block">Quick Scale</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {quickScales.map((scale) => {
                                const isActive = safeBatches === scale.multiplier && safeServings === baseServings
                                return (
                                    <Button
                                        key={scale.label}
                                        variant={isActive ? 'default' : 'outline'}
                                        onClick={() => applyQuickScale(scale.multiplier)}
                                        className="h-auto py-3"
                                    >
                                        <div className="text-center">
                                            <div className="text-lg font-bold">{scale.label}</div>
                                            <div className="text-xs opacity-70">
                                                {baseServings * scale.multiplier} porsi
                                            </div>
                                        </div>
                                    </Button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Custom Scale */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="servings">Porsi per Batch</Label>
                            <Input
                                id="servings"
                                type="number"
                                value={targetServings}
                                onChange={(e) => {
                                    const value = Number(e.target.value)
                                    setTargetServings(Number.isFinite(value) ? Math.max(1, value) : 1)
                                }}
                                min={1}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Resep asli: {baseServings} porsi
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="batches">Jumlah Batch</Label>
                            <Input
                                id="batches"
                                type="number"
                                value={targetBatches}
                                onChange={(e) => {
                                    const value = Number(e.target.value)
                                    setTargetBatches(Number.isFinite(value) ? Math.max(1, value) : 1)
                                }}
                                min={1}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Total: {totalServings} porsi
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-950/20 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">Ringkasan Produksi</span>
                            <Badge variant="default" className="gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {scaleFactor.toFixed(1)}x dari resep asli
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-muted-foreground">Total Porsi</div>
                                <div className="font-bold text-lg">{totalServings}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Total Biaya</div>
                                <div className="font-bold text-lg text-gray-600">{formatCurrency(scaledCost)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Biaya per Porsi</div>
                                <div className="font-medium">{formatCurrency(costPerServing)}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">Jumlah Batch</div>
                                <div className="font-medium">{safeBatches} batch</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stock Availability Check */}
            {hasStockIssues && (
                <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                            <Package className="h-5 w-5" />
                            ⚠️ Peringatan Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                                Beberapa bahan tidak mencukupi untuk produksi ini:
                            </p>
                            {stockIssues.map((issue) => (
                                <div key={issue} className="text-sm p-2 bg-white dark:bg-gray-900 rounded border border-yellow-200 dark:border-yellow-800">
                                    {issue}
                                </div>
                            ))}
                            <Button variant="outline" className="w-full mt-3">
                                <Package className="h-4 w-4 mr-2" />
                                Buat Purchase Order
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Scaled Ingredients Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Kebutuhan Bahan (Scaled)
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={exportShoppingList}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Shopping List
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bahan</TableHead>
                                <TableHead className="text-right">Resep Asli</TableHead>
                                <TableHead className="text-right">Kebutuhan</TableHead>
                                <TableHead className="text-right">Stock</TableHead>
                                <TableHead className="text-right">Biaya</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recipeIngredients.map((ri) => {
                                if (!ri.ingredient) { return null }

                                const originalQty = ri.quantity
                                const scaledQty = ri.quantity * scaleFactor
                                const stock = ri.ingredient.stock_quantity ?? 0
                                const cost = scaledQty * ri.ingredient.price_per_unit
                                const isEnough = stock >= scaledQty
                                const ingredientKey = `${ri.ingredient['id'] ?? ri.ingredient.name}-${ri.unit}-${ri.quantity}`

                                return (
                                    <TableRow key={ingredientKey}>
                                        <TableCell className="font-medium">
                                            {ri.ingredient.name}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {originalQty.toFixed(2)} {ri.unit}
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {scaledQty.toFixed(2)} {ri.unit}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={isEnough ? 'text-gray-600' : 'text-red-600'}>
                                                {stock.toFixed(2)} {ri.unit}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(cost)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isEnough ? (
                                                <Badge variant="default" className="gap-1">
                                                    ✓ Cukup
                                                </Badge>
                                            ) : (
                                                <Badge variant="destructive" className="gap-1">
                                                    ✗ Kurang
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>

                    {/* Total */}
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border-t-2 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-gray-600" />
                                <span className="font-semibold">Total Biaya Produksi</span>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-gray-600">
                                    {formatCurrency(scaledCost)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(costPerServing)} per porsi
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Production Tips */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        💡 Tips Produksi Batch
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                            <span className="text-gray-600 font-bold">1.</span>
                            <span>Siapkan semua bahan sebelum mulai produksi untuk efisiensi maksimal</span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                            <span className="text-gray-600 font-bold">2.</span>
                            <span>Gunakan timbangan digital untuk akurasi takaran, terutama untuk batch besar</span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                            <span className="text-gray-600 font-bold">3.</span>
                            <span>Bagi produksi menjadi beberapa batch kecil jika kapasitas alat terbatas</span>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                            <span className="text-gray-600 font-bold">4.</span>
                            <span>Catat waktu mulai dan selesai setiap batch untuk tracking efisiensi</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

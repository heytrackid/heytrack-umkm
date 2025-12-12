'use client'

import { AlertTriangle, Calculator, ChevronDown, ChevronUp, Loader2, ShoppingBag, TrendingDown, TrendingUp, Zap } from '@/components/icons'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'

import type { RecipeWithCosts } from '@/modules/hpp/hooks/useUnifiedHpp'




interface CostCalculationCardProps {
    recipe: RecipeWithCosts
    onRecalculate: () => void
    isCalculating?: boolean
}

export const CostCalculationCard = ({ recipe, onRecalculate, isCalculating }: CostCalculationCardProps): JSX.Element => {
    const { formatCurrency } = useCurrency()
    const [isExpanded, setIsExpanded] = useState(false)
    const hasIngredientsWithoutPrice = recipe.ingredients.some((ingredient) => ingredient.unit_price === 0)
    const ingredientsCost = recipe.ingredients.reduce((sum, ingredient) => {
        const wasteFactor = Number(ingredient.waste_factor ?? 1)
        return sum + (ingredient.quantity * ingredient.unit_price * wasteFactor)
    }, 0)
    const yieldUnit = recipe.yield_unit || 'porsi'
    const yieldQuantity = Number(recipe.servings ?? 1)
    const totalBatchCost = recipe.total_cost * yieldQuantity

    // Calculate HPP change
    const hppChange = recipe.previous_cost ? recipe.total_cost - recipe.previous_cost : 0
    const changePercentage = recipe.previous_cost && recipe.previous_cost > 0
        ? (hppChange / recipe.previous_cost) * 100
        : 0
    const hasSignificantChange = Math.abs(changePercentage) >= 5 // 5% threshold

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Biaya Produksi
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Warning jika ada bahan tanpa harga */}
                {hasIngredientsWithoutPrice && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <p className="font-semibold mb-1">Ada bahan yang belum ada harganya</p>
                            <p className="text-sm mb-2">
                                Biaya produksi belum akurat. Silakan update harga bahan terlebih dahulu.
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open('/ingredients', '_blank')}
                            >
                                Update Harga Bahan →
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Empty state */}
                {recipe.ingredients.length === 0 && (
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Belum ada bahan. Tambahkan bahan terlebih dahulu di halaman Resep.
                        </AlertDescription>
                    </Alert>
                )}

                {/* COLLAPSED STATE - Summary View */}
                {!isExpanded && (
                    <div className="space-y-4">
                        {/* Quick Summary */}
                        <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 rounded-lg border-2 border-border/20">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Total Biaya Produksi</div>
                                    <div className="text-4xl font-bold text-foreground">
                                        {formatCurrency(recipe.total_cost)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Per 1 {yieldUnit}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Total batch ({yieldQuantity} {yieldUnit}): {formatCurrency(totalBatchCost)}
                                    </p>
                                </div>
                                {hasSignificantChange && (
                                    <Badge
                                        variant={hppChange > 0 ? 'destructive' : 'default'}
                                        className="gap-1"
                                    >
                                        {hppChange > 0 ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {hppChange > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                                    </Badge>
                                )}
                            </div>

                            {/* Quick Breakdown */}
                            <div className="bg-card p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Bahan Baku</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency(ingredientsCost)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Tenaga Kerja</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency(recipe.labor_costs)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Overhead</span>
                                    </div>
                                    <span className="font-medium">{formatCurrency(recipe.overhead_costs)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Expand Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(true)}
                            className="w-full"
                        >
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Lihat Detail Perhitungan
                        </Button>
                    </div>
                )}

                {/* EXPANDED STATE - Full Details */}
                {isExpanded && (
                    <>
                        {/* Ingredients */}
                        {recipe.ingredients.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    <ShoppingBag className="h-4 w-4" />
                                    Bahan-bahan
                                </div>
                                <div className="space-y-2 pl-6">
                                    {recipe.ingredients.map((ingredient) => {
                                        const ingredientKey = ingredient['id'] || `${ingredient.name}-${ingredient.unit}-${ingredient.quantity}`
                                        const wasteFactor = Number(ingredient.waste_factor ?? 1)
                                        const ingredientTotal = ingredient.quantity * ingredient.unit_price * wasteFactor

                                        return (
                                            <div key={ingredientKey} className="flex justify-between items-center text-sm">
                                                <span className="text-muted-foreground">
                                                    {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                                                    {ingredient.unit_price === 0 && (
                                                        <span className="ml-2 text-xs text-destructive">⚠️ Belum ada harga</span>
                                                    )}
                                                    {wasteFactor !== 1 && (
                                                        <span className="ml-2 text-xs text-muted-foreground">× waste</span>
                                                    )}
                                                </span>
                                                <span className="font-medium">
                                                    {formatCurrency(ingredientTotal)}
                                                </span>
                                            </div>
                                        )
                                    })}
                                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                                        <span className="font-medium">Subtotal Bahan (termasuk waste)</span>
                                        <span className="font-semibold">{formatCurrency(ingredientsCost)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Labor Costs */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Zap className="h-4 w-4" />
                                Biaya Tenaga Kerja
                            </div>
                            <div className="pl-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Gaji karyawan, upah produksi
                                    </span>
                                    <span className="font-medium">{formatCurrency(recipe.labor_costs)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Overhead Costs */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                <Zap className="h-4 w-4" />
                                Biaya Overhead
                            </div>
                            <div className="pl-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        Sewa tempat, listrik, air, gas, kemasan
                                    </span>
                                    <span className="font-medium">{formatCurrency(recipe.overhead_costs)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Cost */}
                        <div className="pt-4 border-t bg-muted/20 -mx-6 px-6 py-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-base font-semibold">Total Biaya Produksi</span>
                                    <p className="text-xs text-muted-foreground mt-0.5">Per 1 {yieldUnit}</p>
                                    {recipe.previous_cost && recipe.previous_cost > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Sebelumnya: {formatCurrency(recipe.previous_cost)}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-foreground">
                                        {formatCurrency(recipe.total_cost)}
                                    </div>
                                    {hasSignificantChange && (
                                        <Badge
                                            variant={hppChange > 0 ? 'destructive' : 'default'}
                                            className="mt-2"
                                        >
                                            {hppChange > 0 ? (
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3 mr-1" />
                                            )}
                                            {hppChange > 0 ? '+' : ''}{changePercentage.toFixed(1)}%
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Collapse Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(false)}
                            className="w-full"
                        >
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Sembunyikan Detail
                        </Button>
                    </>
                )}

                {/* Recalculate Button - Always visible */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRecalculate}
                    disabled={isCalculating}
                    className="w-full sm:w-auto"
                >
                    {isCalculating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menghitung...
                        </>
                    ) : (
                        <>
                            <Calculator className="h-4 w-4 mr-2" />
                            Hitung Ulang
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

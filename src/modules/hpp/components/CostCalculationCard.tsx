'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Database } from '@/types/supabase-generated'
type Ingredient = Database['public']['Tables']['ingredients']['Row']
type Recipe = Database['public']['Tables']['recipes']['Row']
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertTriangle, Calculator, ShoppingBag, Zap, TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

// Extended type for cost calculation display
interface IngredientForCost {
    name: string
    quantity: number
    unit: string
    unit_price: number
}

interface RecipeForCost {
    id: string
    ingredients: IngredientForCost[]
    operational_costs: number
    total_cost: number
    previous_cost?: number // For showing change
}

interface CostCalculationCardProps {
    recipe: RecipeForCost
    onRecalculate: () => void
    isCalculating?: boolean
}

export const CostCalculationCard = ({ recipe, onRecalculate, isCalculating }: CostCalculationCardProps) => {
    const { formatCurrency } = useCurrency()
    const hasIngredientsWithoutPrice = recipe.ingredients.some((i) => i.unit_price === 0)
    const ingredientsCost = recipe.ingredients.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0)

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
                    Rincian Biaya Produksi
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

                {/* Ingredients */}
                {recipe.ingredients.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <ShoppingBag className="h-4 w-4" />
                            Bahan-bahan
                        </div>
                        <div className="space-y-2 pl-6">
                            {recipe.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">
                                        {ingredient.name} ({ingredient.quantity} {ingredient.unit})
                                        {ingredient.unit_price === 0 && (
                                            <span className="ml-2 text-xs text-red-600">⚠️ Belum ada harga</span>
                                        )}
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(ingredient.quantity * ingredient.unit_price)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center text-sm pt-2 border-t">
                                <span className="font-medium">Subtotal Bahan</span>
                                <span className="font-semibold">{formatCurrency(ingredientsCost)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Operational Costs */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Zap className="h-4 w-4" />
                        Biaya Operasional
                    </div>
                    <div className="pl-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                                Gas, Listrik, Kemasan, dll
                                <span className="text-xs ml-1">(15% dari bahan)</span>
                            </span>
                            <span className="font-medium">{formatCurrency(recipe.operational_costs)}</span>
                        </div>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="pt-4 border-t bg-blue-50 dark:bg-blue-900/20 -mx-6 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-base font-semibold">Total Biaya Produksi</span>
                            <p className="text-xs text-muted-foreground mt-0.5">Per 1 porsi/unit</p>
                            {recipe.previous_cost && recipe.previous_cost > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sebelumnya: {formatCurrency(recipe.previous_cost)}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
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

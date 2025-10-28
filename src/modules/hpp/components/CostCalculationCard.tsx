'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Loader2, AlertTriangle } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface Ingredient {
    name: string
    quantity: number
    unit: string
    unit_price: number
}

interface Recipe {
    id: string
    ingredients: Ingredient[]
    operational_costs: number
    total_cost: number
}

interface CostCalculationCardProps {
    recipe: Recipe
    onRecalculate: () => void
    isCalculating?: boolean
}

export const CostCalculationCard = ({ recipe, onRecalculate, isCalculating }: CostCalculationCardProps) => {
    const { formatCurrency } = useCurrency()
    const hasIngredientsWithoutPrice = recipe.ingredients.some((i) => i.unit_price === 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🧮 Langkah 2: Hitung Berapa Modal Buat 1 Porsi
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold mb-1">HPP = Harga Pokok Produksi</p>
                            <p>Artinya: Total uang yang keluar untuk buat 1 porsi</p>
                            <p className="text-xs mt-2">Termasuk:</p>
                            <ul className="text-xs list-disc list-inside">
                                <li>Bahan-bahan (tepung, gula, dll)</li>
                                <li>Gas/listrik untuk masak</li>
                                <li>Kemasan</li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-2">Contoh: Brownies = Rp 26.000</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Ingredients */}
                <div>
                    <h4 className="font-semibold mb-2">🛒 Bahan-bahan yang Dibutuhkan:</h4>
                    <div className="space-y-2">
                        {recipe.ingredients.length > 0 ? (
                            <>
                                {recipe.ingredients.map((ingredient, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">
                                            • {ingredient.name} {ingredient.quantity} {ingredient.unit}
                                            {ingredient.unit_price === 0 && (
                                                <span className="ml-2 text-xs text-red-600">⚠️ Belum ada harga</span>
                                            )}
                                        </span>
                                        <span className="font-medium">
                                            {formatCurrency(ingredient.quantity * ingredient.unit_price)}
                                        </span>
                                    </div>
                                ))}

                                {/* Warning jika ada bahan tanpa harga */}
                                {hasIngredientsWithoutPrice && (
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg mt-3">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                                                    Perhatian: Ada bahan yang belum ada harganya
                                                </p>
                                                <p className="text-yellow-700 dark:text-yellow-300 mb-2">
                                                    Biaya produksi belum bisa dihitung akurat karena ada bahan yang belum diisi harganya.
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open('/ingredients', '_blank')}
                                                    className="text-xs"
                                                >
                                                    Update Harga Bahan →
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    ⚠️ Belum ada bahan. Tambahkan bahan terlebih dahulu di halaman Resep.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Operational Costs */}
                <div>
                    <h4 className="font-semibold mb-2">⚡ Biaya Lain-lain:</h4>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                            • Gas, Listrik, Kemasan, dll
                            <span className="text-xs ml-1">(otomatis 15% dari bahan)</span>
                        </span>
                        <span className="font-medium">{formatCurrency(recipe.operational_costs)}</span>
                    </div>
                </div>

                {/* Total Cost */}
                <div className="pt-4 border-t bg-blue-50 dark:bg-blue-900/20 -mx-6 px-6 py-4 mt-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-lg font-semibold">💰 Total Modal Buat 1 Porsi:</span>
                            <p className="text-xs text-muted-foreground mt-1">Ini yang harus Anda keluarkan</p>
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(recipe.total_cost)}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRecalculate}
                        disabled={isCalculating}
                    >
                        {isCalculating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Menghitung...
                            </>
                        ) : (
                            '🔄 Hitung Ulang'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

'use client'

/**
 * HPP Estimator Component
 * Sprint 1 Feature: Real-time HPP calculation
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { calculateEstimatedHPP } from '@/lib/utils/recipe-helpers'

interface HppEstimatorProps {
    selectedIngredients: Array<{
        id: string
        name: string
        price_per_unit: number
        unit: string
        current_stock?: number
    }>
    servings: number
    targetPrice?: number
}

export function HppEstimator({ selectedIngredients, servings, targetPrice }: HppEstimatorProps) {
    const [estimatedHPP, setEstimatedHPP] = useState(0)
    const [materialCost, setMaterialCost] = useState(0)
    const [operationalCost, setOperationalCost] = useState(0)

    useEffect(() => {
        if (selectedIngredients.length > 0 && servings > 0) {
            // Calculate material cost (rough estimate)
            const material = selectedIngredients.reduce((sum, ing) => {
                // Estimate typical usage per serving
                const typicalUsage = 50 // grams per serving (rough average)
                const costPerGram = ing.price_per_unit / 1000 // Assuming price is per kg
                return sum + (costPerGram * typicalUsage * servings)
            }, 0)

            // Operational cost (30% of material)
            const operational = material * 0.3

            // Total HPP
            const total = material + operational

            setMaterialCost(material)
            setOperationalCost(operational)
            setEstimatedHPP(total)
        } else {
            setEstimatedHPP(0)
            setMaterialCost(0)
            setOperationalCost(0)
        }
    }, [selectedIngredients, servings])

    // Calculate margin if target price is set
    const margin = targetPrice && estimatedHPP > 0
        ? ((targetPrice - estimatedHPP) / targetPrice) * 100
        : 0

    const marginStatus = margin >= 50 ? 'excellent' : margin >= 30 ? 'good' : margin >= 20 ? 'fair' : 'low'

    const getMarginColor = () => {
        if (margin >= 50) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
        if (margin >= 30) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
        if (margin >= 20) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    }

    if (selectedIngredients.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                        <Calculator className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Pilih bahan untuk melihat estimasi HPP</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                    <Calculator className="h-5 w-5 text-primary" />
                    Estimasi HPP Real-Time
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main HPP Display */}
                <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Estimasi HPP Total</div>
                    <div className="text-3xl font-bold text-primary">
                        {formatCurrency(estimatedHPP)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Untuk {servings} porsi
                    </div>
                </div>

                {/* HPP Breakdown */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Bahan</span>
                        <span className="font-semibold">{formatCurrency(materialCost)}</span>
                    </div>
                    <Progress value={(materialCost / estimatedHPP) * 100} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Operasional (30%)</span>
                        <span className="font-semibold">{formatCurrency(operationalCost)}</span>
                    </div>
                    <Progress value={(operationalCost / estimatedHPP) * 100} className="h-2" />
                </div>

                {/* Per Serving */}
                <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">HPP per porsi</span>
                        <span className="font-semibold">{formatCurrency(estimatedHPP / servings)}</span>
                    </div>
                </div>

                {/* Margin Analysis (if target price set) */}
                {targetPrice && targetPrice > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Target Harga Jual</span>
                            <span className="font-semibold">{formatCurrency(targetPrice)}</span>
                        </div>

                        <div className={`p-3 rounded-lg ${getMarginColor()}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {margin >= 30 ? (
                                    <CheckCircle className="h-4 w-4" />
                                ) : (
                                    <AlertCircle className="h-4 w-4" />
                                )}
                                <span className="font-semibold text-sm">
                                    Margin: {margin.toFixed(1)}%
                                </span>
                            </div>
                            <div className="text-xs">
                                {marginStatus === 'excellent' && '🎉 Margin sangat bagus! Produk ini sangat profitable.'}
                                {marginStatus === 'good' && '👍 Margin bagus! Produk ini cukup menguntungkan.'}
                                {marginStatus === 'fair' && '⚠️ Margin cukup. Pertimbangkan untuk optimasi biaya.'}
                                {marginStatus === 'low' && '❌ Margin terlalu tipis! Naikkan harga atau kurangi biaya.'}
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Profit per porsi</span>
                            <span className="font-semibold text-green-600">
                                {formatCurrency((targetPrice - estimatedHPP) / servings)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Stock Warning */}
                {selectedIngredients.some(ing => ing.current_stock === 0) && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-red-600">
                                <div className="font-semibold mb-1">Peringatan Stok!</div>
                                <div>
                                    Beberapa bahan stoknya habis. Pastikan restock sebelum produksi.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Info Note */}
                <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <div>
                            <span className="font-semibold">Catatan:</span> Ini estimasi kasar berdasarkan bahan yang dipilih.
                            AI akan hitung HPP akurat setelah generate resep lengkap dengan takaran pasti.
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

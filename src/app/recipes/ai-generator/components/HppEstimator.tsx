 'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Calculator, TrendingUp, AlertCircle, CheckCircle, Settings } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'


/**
 * HPP Estimator Component
 * Sprint 1 Feature: Real-time HPP calculation with adjustable operational costs
 */


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

export const HppEstimator = ({ selectedIngredients, servings, targetPrice }: HppEstimatorProps) => {
    const [estimatedHPP, setEstimatedHPP] = useState(0)
    const [materialCost, setMaterialCost] = useState(0)
    const [operationalCost, setOperationalCost] = useState(0)
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
    const { formatCurrency } = useCurrency()

    // Adjustable operational cost percentages
    const [operationalCosts, setOperationalCosts] = useState({
        labor: 20, // % of material cost
        utilities: 8, // electricity, water, gas
        packaging: 12, // packaging materials
        overhead: 10, // rent, insurance, etc.
        profit: 25, // desired profit margin
    })

    useEffect(() => {
        if (selectedIngredients.length > 0 && servings > 0) {
            // Calculate material cost (rough estimate)
            const material = selectedIngredients.reduce((sum, ing) => {
                // Estimate typical usage per serving
                const typicalUsage = 50 // grams per serving (rough average)
                const costPerGram = ing.price_per_unit / 1000 // Assuming price is per kg
                return sum + (costPerGram * typicalUsage * servings)
            }, 0)

            // Calculate operational costs based on adjustable percentages
            const laborCost = material * (operationalCosts.labor / 100)
            const utilitiesCost = material * (operationalCosts.utilities / 100)
            const packagingCost = material * (operationalCosts.packaging / 100)
            const overheadCost = material * (operationalCosts.overhead / 100)
            const profitCost = material * (operationalCosts.profit / 100)

            const totalOperational = laborCost + utilitiesCost + packagingCost + overheadCost + profitCost

            // Total HPP
            const total = material + totalOperational

            setMaterialCost(material)
            setOperationalCost(totalOperational)
            setEstimatedHPP(total)
        } else {
            setEstimatedHPP(0)
            setMaterialCost(0)
            setOperationalCost(0)
        }
    }, [selectedIngredients, servings, operationalCosts])

    // Calculate margin if target price is set
    const margin = targetPrice && estimatedHPP > 0
        ? ((targetPrice - estimatedHPP) / targetPrice) * 100
        : 0

    const getMarginStatus = (margin: number): string => {
        if (margin >= 50) {
            return 'excellent'
        }
        if (margin >= 30) {
            return 'good'
        }
        if (margin >= 20) {
            return 'fair'
        }
        return 'low'
    }
    
    const marginStatus = getMarginStatus(margin)

    const getMarginColor = () => {
        if (margin >= 50) {return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'}
        if (margin >= 30) {return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'}
        if (margin >= 20) {return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'}
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

    const updateOperationalCost = (key: keyof typeof operationalCosts, value: number) => {
        setOperationalCosts(prev => ({ ...prev, [key]: value }))
    }

    return (
        <Card className="border-2 border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Calculator className="h-5 w-5 text-primary" />
                        Estimasi HPP Real-Time
                    </CardTitle>
                    <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                </div>
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

                {/* Advanced Operational Cost Settings */}
                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                    <CollapsibleContent className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-sm font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Sesuaikan Biaya Operasional
                        </div>

                        <div className="space-y-4">
                            {/* Labor Cost */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Tenaga Kerja</Label>
                                    <span className="text-sm font-medium">{operationalCosts.labor}%</span>
                                </div>
                                <Slider
                                    value={[operationalCosts.labor]}
                                    onValueChange={(value) => updateOperationalCost('labor', value[0])}
                                    max={50}
                                    min={5}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(materialCost * (operationalCosts.labor / 100))}
                                </div>
                            </div>

                            {/* Utilities */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Utilitas (Listrik, Air, Gas)</Label>
                                    <span className="text-sm font-medium">{operationalCosts.utilities}%</span>
                                </div>
                                <Slider
                                    value={[operationalCosts.utilities]}
                                    onValueChange={(value) => updateOperationalCost('utilities', value[0])}
                                    max={20}
                                    min={2}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(materialCost * (operationalCosts.utilities / 100))}
                                </div>
                            </div>

                            {/* Packaging */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Kemasan & Bahan Pendukung</Label>
                                    <span className="text-sm font-medium">{operationalCosts.packaging}%</span>
                                </div>
                                <Slider
                                    value={[operationalCosts.packaging]}
                                    onValueChange={(value) => updateOperationalCost('packaging', value[0])}
                                    max={25}
                                    min={5}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(materialCost * (operationalCosts.packaging / 100))}
                                </div>
                            </div>

                            {/* Overhead */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Overhead (Sewa, Asuransi, dll)</Label>
                                    <span className="text-sm font-medium">{operationalCosts.overhead}%</span>
                                </div>
                                <Slider
                                    value={[operationalCosts.overhead]}
                                    onValueChange={(value) => updateOperationalCost('overhead', value[0])}
                                    max={30}
                                    min={2}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(materialCost * (operationalCosts.overhead / 100))}
                                </div>
                            </div>

                            {/* Profit Margin */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm">Margin Keuntungan</Label>
                                    <span className="text-sm font-medium">{operationalCosts.profit}%</span>
                                </div>
                                <Slider
                                    value={[operationalCosts.profit]}
                                    onValueChange={(value) => updateOperationalCost('profit', value[0])}
                                    max={50}
                                    min={10}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="text-xs text-muted-foreground">
                                    {formatCurrency(materialCost * (operationalCosts.profit / 100))}
                                </div>
                            </div>
                        </div>

                        <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                            💡 Sesuaikan persentase sesuai kondisi bisnis Anda untuk estimasi HPP yang lebih akurat
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* HPP Breakdown */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Bahan</span>
                        <span className="font-semibold">{formatCurrency(materialCost)}</span>
                    </div>
                    <Progress value={(materialCost / estimatedHPP) * 100} className="h-2" />

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Biaya Operasional</span>
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

                {/* Operational Cost Breakdown */}
                <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <div className="text-sm font-semibold mb-2">Rincian Biaya Operasional:</div>
                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span>Tenaga Kerja:</span>
                            <span>{formatCurrency(materialCost * (operationalCosts.labor / 100))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Utilitas:</span>
                            <span>{formatCurrency(materialCost * (operationalCosts.utilities / 100))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kemasan:</span>
                            <span>{formatCurrency(materialCost * (operationalCosts.packaging / 100))}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Overhead:</span>
                            <span>{formatCurrency(materialCost * (operationalCosts.overhead / 100))}</span>
                        </div>
                        <div className="flex justify-between font-medium">
                            <span>Keuntungan:</span>
                            <span>{formatCurrency(materialCost * (operationalCosts.profit / 100))}</span>
                        </div>
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
                            <span className="font-semibold text-gray-600">
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
                            <span className="font-semibold">Catatan:</span> Sesuaikan persentase biaya operasional dengan kondisi bisnis Anda.
                            AI akan hitung HPP akurat setelah generate resep lengkap dengan takaran pasti.
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle, TrendingUp, TrendingDown, DollarSign, Lightbulb } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface PricingCalculatorCardProps {
    totalCost: number
    currentPrice?: number | null
    marginPercentage: number
    suggestedPrice: number
    onMarginChange: (margin: number) => void
    onSavePrice: (price: number, margin: number) => void
    isSaving?: boolean
}

export const PricingCalculatorCard = ({
    totalCost,
    currentPrice,
    marginPercentage,
    suggestedPrice,
    onMarginChange,
    onSavePrice,
    isSaving
}: PricingCalculatorCardProps) => {
    const { formatCurrency } = useCurrency()
    const [mode, setMode] = useState<'auto' | 'manual'>('auto')
    const [manualPrice, setManualPrice] = useState(suggestedPrice)

    // Update manual price when suggested price changes (only in auto mode)
    useEffect(() => {
        if (mode === 'auto') {
            setManualPrice(suggestedPrice)
        }
    }, [suggestedPrice, mode])

    const displayPrice = mode === 'manual' ? manualPrice : suggestedPrice
    const profit = displayPrice - totalCost
    const hasCurrentPrice = currentPrice && currentPrice > 0
    const currentProfit = hasCurrentPrice ? currentPrice - totalCost : 0
    const currentMargin = hasCurrentPrice ? ((currentProfit / totalCost) * 100) : 0
    const displayMargin = mode === 'manual' ? ((profit / totalCost) * 100) : marginPercentage

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Kalkulator Harga Jual
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Price Info */}
                {hasCurrentPrice && (
                    <Alert>
                        <DollarSign className="h-4 w-4" />
                        <AlertDescription>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">Harga Jual Saat Ini</p>
                                    <p className="text-sm text-muted-foreground">
                                        Margin: {currentMargin.toFixed(0)}% • Untung: {formatCurrency(currentProfit)}
                                    </p>
                                </div>
                                <span className="text-xl font-bold">{formatCurrency(currentPrice)}</span>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Current Cost */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Biaya Produksi</span>
                        <span className="text-lg font-semibold">{formatCurrency(totalCost)}</span>
                    </div>
                </div>

                {/* Mode Tabs */}
                <Tabs value={mode} onValueChange={(v) => setMode(v as 'auto' | 'manual')}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="auto">Otomatis (Margin)</TabsTrigger>
                        <TabsTrigger value="manual">Manual</TabsTrigger>
                    </TabsList>

                    <TabsContent value="auto" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Target Margin Keuntungan</span>
                                <Badge
                                    variant={marginPercentage >= 50 ? "default" : "secondary"}
                                    className="text-base"
                                >
                                    {marginPercentage}%
                                </Badge>
                            </div>
                            <Slider
                                value={[marginPercentage]}
                                onValueChange={(value) => {
                                    const newValue = value[0]
                                    if (newValue !== undefined) {
                                        onMarginChange(newValue)
                                    }
                                }}
                                min={30}
                                max={150}
                                step={5}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>30%</span>
                                <span>60% (Rekomendasi)</span>
                                <span>150%</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Masukkan Harga Jual</span>
                                <Badge
                                    variant={displayMargin >= 50 ? "default" : displayMargin >= 30 ? "secondary" : "destructive"}
                                    className="text-base"
                                >
                                    Margin: {displayMargin.toFixed(0)}%
                                </Badge>
                            </div>
                            <Input
                                type="number"
                                value={manualPrice}
                                onChange={(e) => setManualPrice(Number(e.target.value))}
                                placeholder="Masukkan harga jual"
                                min={totalCost}
                                step={1000}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimal: {formatCurrency(totalCost)} (biaya produksi)
                            </p>
                            {manualPrice < totalCost && (
                                <p className="text-xs text-red-600">
                                    ⚠️ Harga jual tidak boleh lebih rendah dari biaya produksi
                                </p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Display Price */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">
                                Harga Jual {mode === 'manual' ? 'yang Anda Masukkan' : 'yang Disarankan'}
                            </div>
                            <div className="text-4xl font-bold text-purple-600">
                                {formatCurrency(displayPrice)}
                            </div>
                        </div>
                        <Badge
                            variant={displayMargin >= 50 ? "default" : displayMargin >= 30 ? "secondary" : "destructive"}
                            className="gap-1"
                        >
                            {displayMargin >= 50 ? (
                                <>
                                    <TrendingUp className="h-3 w-3" />
                                    Margin Bagus
                                </>
                            ) : displayMargin >= 30 ? (
                                <>
                                    <TrendingUp className="h-3 w-3" />
                                    Margin Standar
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3" />
                                    Margin Rendah
                                </>
                            )}
                        </Badge>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Produksi</span>
                            <span className="font-medium">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>Keuntungan ({displayMargin.toFixed(0)}%)</span>
                            <span className="font-semibold">+ {formatCurrency(profit)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Harga Jual</span>
                            <span className="text-purple-600">{formatCurrency(displayPrice)}</span>
                        </div>
                    </div>

                    {/* Profit per item */}
                    <div className="mt-3 text-center">
                        <span className="text-sm text-muted-foreground">Keuntungan per produk: </span>
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(profit)}
                        </span>
                    </div>
                </div>

                {/* Tips */}
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                        <p className="font-semibold mb-2">Tips Menentukan Harga</p>
                        <ul className="text-sm space-y-1">
                            <li>• <strong>50-70%</strong> untuk produk premium/kue</li>
                            <li>• <strong>30-50%</strong> untuk bersaing dengan kompetitor</li>
                            <li>• Cek harga pasar di area Anda</li>
                            <li>• Pertimbangkan biaya kemasan & ongkir</li>
                        </ul>
                    </AlertDescription>
                </Alert>

                {/* Actions */}
                <Button
                    onClick={() => onSavePrice(displayPrice, displayMargin)}
                    className="w-full"
                    disabled={isSaving || displayPrice === currentPrice || (mode === 'manual' && manualPrice < totalCost)}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Menyimpan...
                        </>
                    ) : displayPrice === currentPrice ? (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Harga Sudah Tersimpan
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {hasCurrentPrice ? 'Update Harga' : 'Simpan Harga Ini'}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Loader2, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'

interface PricingCalculatorCardProps {
    totalCost: number
    marginPercentage: number
    suggestedPrice: number
    onMarginChange: (margin: number) => void
    onSavePrice: () => void
    isSaving?: boolean
}

export const PricingCalculatorCard = ({
    totalCost,
    marginPercentage,
    suggestedPrice,
    onMarginChange,
    onSavePrice,
    isSaving
}: PricingCalculatorCardProps) => {
    const { formatCurrency } = useCurrency()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    💵 Langkah 3: Tentukan Harga Jual yang Pas
                    <Tooltip>
                        <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-semibold mb-1">Cara Hitung Harga Jual:</p>
                            <p className="text-xs">Modal + Untung = Harga Jual</p>
                            <p className="text-xs mt-2">Contoh:</p>
                            <ul className="text-xs list-disc list-inside">
                                <li>Modal: Rp 25.000</li>
                                <li>Untung 60%: Rp 15.000</li>
                                <li>Harga Jual: Rp 40.000</li>
                            </ul>
                            <p className="text-xs text-muted-foreground mt-2">Rekomendasi: 50-70% untuk makanan/kue</p>
                        </TooltipContent>
                    </Tooltip>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">💰 Modal Buat 1 Porsi:</span>
                        <span className="font-semibold text-lg">{formatCurrency(totalCost)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Ini uang yang keluar untuk bahan & operasional</p>
                </div>

                {/* Margin Slider */}
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">🎯 Mau Untung Berapa Persen?</span>
                        <Badge variant="secondary" className="text-base">{marginPercentage}%</Badge>
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
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>30% (Minimum)</span>
                        <span>60% (Rekomendasi)</span>
                        <span>150% (Premium)</span>
                    </div>
                </div>

                {/* Enhanced Suggested Price with Status */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-lg border-2 border-purple-200 dark:border-purple-800 relative overflow-hidden">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <Badge
                            variant={marginPercentage >= 50 ? "default" : marginPercentage >= 30 ? "secondary" : "destructive"}
                            className="gap-1"
                        >
                            {marginPercentage >= 50 ? (
                                <>
                                    <TrendingUp className="h-3 w-3" />
                                    Margin Bagus
                                </>
                            ) : marginPercentage >= 30 ? (
                                <>
                                    <Info className="h-3 w-3" />
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

                    <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">
                            ✨ Harga Jual yang Disarankan:
                        </div>
                        <div className="text-5xl font-bold text-purple-600 mb-3">
                            {formatCurrency(suggestedPrice)}
                        </div>

                        {/* Breakdown */}
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg inline-block min-w-[280px]">
                            <div className="text-xs text-muted-foreground mb-2">Rincian Perhitungan:</div>
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between gap-8 pb-2 border-b">
                                    <span className="text-muted-foreground">Modal Produksi:</span>
                                    <span className="font-semibold">{formatCurrency(totalCost)}</span>
                                </div>
                                <div className="flex justify-between gap-8 text-green-600">
                                    <span>Keuntungan ({marginPercentage}%):</span>
                                    <span className="font-semibold">+ {formatCurrency(suggestedPrice - totalCost)}</span>
                                </div>
                                <div className="flex justify-between gap-8 pt-2 border-t text-base">
                                    <span className="font-semibold">Total Harga Jual:</span>
                                    <span className="font-bold text-purple-600">{formatCurrency(suggestedPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Profit Indicator */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                            <span className="text-muted-foreground">Keuntungan per produk:</span>
                            <span className="font-bold text-green-600 text-lg">
                                {formatCurrency(suggestedPrice - totalCost)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tips */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm space-y-2">
                            <div><span className="font-semibold">💡 Tips Biar Untung Maksimal:</span></div>
                            <ul className="ml-4 space-y-1.5">
                                <li>• <strong>50-70% untung</strong> → Cocok untuk kue/makanan premium</li>
                                <li>• <strong>30-50% untung</strong> → Buat bersaing dengan tetangga</li>
                                <li>• <strong>Cek harga kompetitor</strong> di area Anda dulu</li>
                                <li>• <strong>Jangan lupa</strong> tambahkan biaya kemasan & ongkir</li>
                            </ul>
                            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                                <strong>⚠️ Ingat:</strong> Harga terlalu murah = rugi. Harga terlalu mahal = gak laku!
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={onSavePrice}
                        className="flex-1"
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Pakai Harga Ini
                            </>
                        )}
                    </Button>
                    <Button variant="outline">Masukkan Harga Sendiri</Button>
                </div>
            </CardContent>
        </Card>
    )
}

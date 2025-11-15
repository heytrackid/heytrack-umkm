'use client'

import { CheckCircle, ChevronDown, ChevronUp, DollarSign, Lightbulb, Loader2, TrendingDown, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentType } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'


type MarginLevel = 'high' | 'low' | 'medium'

const getMarginLevel = (margin: number): MarginLevel => {
    if (margin >= 50) { return 'high' }
    if (margin >= 30) { return 'medium' }
    return 'low'
}

const marginVariantMap: Record<MarginLevel, 'default' | 'destructive' | 'secondary'> = {
    high: 'default',
    medium: 'secondary',
    low: 'destructive',
}

const marginBadgeContent: Record<MarginLevel, { label: string; Icon: ComponentType<{ className?: string }> }> = {
    high: { label: 'Margin Bagus', Icon: TrendingUp },
    medium: { label: 'Margin Standar', Icon: TrendingUp },
    low: { label: 'Margin Rendah', Icon: TrendingDown },
}

const getMarginVariant = (margin: number) => marginVariantMap[getMarginLevel(margin)]

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
    const [isExpanded, setIsExpanded] = useState(false)

    // Update manual price when mode changes to auto
    const prevModeRef = useRef(mode)
    const suggestedPriceRef = useRef(suggestedPrice)
    
    useEffect(() => {
        suggestedPriceRef.current = suggestedPrice
    }, [suggestedPrice])
    
    useEffect(() => {
        if (prevModeRef.current !== mode && mode === 'auto') { // mode changed to auto
            setManualPrice(suggestedPriceRef.current)
        }
        prevModeRef.current = mode
    }, [mode])

    const displayPrice = mode === 'manual' ? manualPrice : suggestedPrice
    const profit = displayPrice - totalCost
    const hasCurrentPrice = typeof currentPrice === 'number' && currentPrice > 0
    const currentProfit = hasCurrentPrice ? currentPrice - totalCost : 0
    const currentMargin = hasCurrentPrice ? ((currentProfit / totalCost) * 100) : 0
    const displayMargin = mode === 'manual' ? ((profit / totalCost) * 100) : marginPercentage
    const autoMarginVariant = getMarginVariant(marginPercentage)
    const manualMarginVariant = getMarginVariant(displayMargin)
    const marginLevel = getMarginLevel(displayMargin)
    const { Icon: MarginStatusIcon, label: marginLabel } = marginBadgeContent[marginLevel]
    const actionContent = (() => {
        if (isSaving) {
            return (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                </>
            )
        }

        if (displayPrice === currentPrice) {
            return (
                <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Harga Sudah Tersimpan
                </>
            )
        }

        return (
            <>
                <CheckCircle className="h-4 w-4 mr-2" />
                {hasCurrentPrice ? 'Update Harga' : 'Simpan Harga Ini'}
            </>
        )
    })()

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Harga Jual & Margin
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* COLLAPSED STATE - Quick Summary */}
                {!isExpanded && (
                    <div className="space-y-4">
                        {/* Display Price Summary */}
                        <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 rounded-lg border-2 border-border/20">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Harga Jual yang Disarankan</div>
                                    <div className="text-4xl font-bold text-foreground">
                                        {formatCurrency(displayPrice)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Margin: {displayMargin.toFixed(0)}% • Untung: {formatCurrency(profit)}
                                    </p>
                                </div>
                                <Badge variant={manualMarginVariant} className="gap-1">
                                    <MarginStatusIcon className="h-3 w-3" />
                                    {marginLabel}
                                </Badge>
                            </div>

                            {/* Quick Breakdown */}
                            <div className="bg-card p-4 rounded-lg space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Biaya Produksi</span>
                                    <span className="font-medium">{formatCurrency(totalCost)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Keuntungan ({displayMargin.toFixed(0)}%)</span>
                                    <span className="font-semibold">+ {formatCurrency(profit)}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t font-semibold">
                                    <span>Harga Jual</span>
                                    <span className="text-foreground">{formatCurrency(displayPrice)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Current Price Info (if exists) */}
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

                        {/* Quick Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => onSavePrice(displayPrice, displayMargin)}
                                className="flex-1"
                                disabled={Boolean(isSaving || displayPrice === currentPrice || (mode === 'manual' && manualPrice < totalCost))}
                            >
                                {actionContent}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsExpanded(true)}
                            >
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* EXPANDED STATE - Full Calculator */}
                {isExpanded && (
                    <>
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
                        <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Biaya Produksi</span>
                                <span className="text-lg font-semibold">{formatCurrency(totalCost)}</span>
                            </div>
                        </div>

                {/* Mode Tabs */}
                <SwipeableTabs value={mode} onValueChange={(v) => setMode(v as 'auto' | 'manual')}>
                    <SwipeableTabsList className="grid w-full grid-cols-2">
                        <SwipeableTabsTrigger value="auto">Otomatis (Margin)</SwipeableTabsTrigger>
                        <SwipeableTabsTrigger value="manual">Manual</SwipeableTabsTrigger>
                    </SwipeableTabsList>

                    <SwipeableTabsContent value="auto" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Target Margin Keuntungan</span>
                                <Badge variant={autoMarginVariant} className="text-base">
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
                                aria-valuetext={`${marginPercentage}%`}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>30%</span>
                                <span>50-70% (Rekomendasi)</span>
                                <span>150%</span>
                            </div>
                        </div>
                    </SwipeableTabsContent>

                    <SwipeableTabsContent value="manual" className="space-y-4 mt-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Masukkan Harga Jual</span>
                                <Badge variant={manualMarginVariant} className="text-base">
                                    Margin: {displayMargin.toFixed(0)}%
                                </Badge>
                            </div>
                            <Input
                                type="number"
                                value={manualPrice}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setManualPrice(Number(e.target.value))}
                                placeholder="Masukkan harga jual"
                                min={totalCost}
                                step={1000}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimal: {formatCurrency(totalCost)} (biaya produksi)
                            </p>
                            {manualPrice < totalCost && (
                                <p className="text-xs text-destructive">
                                    ⚠️ Harga jual tidak boleh lebih rendah dari biaya produksi
                                </p>
                            )}
                        </div>
                    </SwipeableTabsContent>
                </SwipeableTabs>

                {/* Display Price */}
                <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20 rounded-lg border-2 border-border/20 ">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">
                                Harga Jual {mode === 'manual' ? 'yang Anda Masukkan' : 'yang Disarankan'}
                            </div>
                            <div className="text-4xl font-bold text-foreground">
                                {formatCurrency(displayPrice)}
                            </div>
                        </div>
                        <Badge variant={manualMarginVariant} className="gap-1">
                            <MarginStatusIcon className="h-3 w-3" />
                            {marginLabel}
                        </Badge>
                    </div>

                    {/* Breakdown */}
                    <div className="bg-card p-4 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Produksi</span>
                            <span className="font-medium">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                            <span>Keuntungan ({displayMargin.toFixed(0)}%)</span>
                            <span className="font-semibold">+ {formatCurrency(profit)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-semibold">
                            <span>Harga Jual</span>
                            <span className="text-foreground">{formatCurrency(displayPrice)}</span>
                        </div>
                    </div>

                    {/* Profit per item */}
                    <div className="mt-3 text-center">
                        <span className="text-sm text-muted-foreground">Keuntungan per produk: </span>
                        <span className="text-lg font-bold text-foreground">
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
                        <div className="flex gap-2">
                            <Button
                                onClick={() => onSavePrice(displayPrice, displayMargin)}
                                className="flex-1"
                                disabled={Boolean(isSaving || displayPrice === currentPrice || (mode === 'manual' && manualPrice < totalCost))}
                            >
                                {actionContent}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsExpanded(false)}
                            >
                                <ChevronUp className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

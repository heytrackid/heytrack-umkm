'use client'

import {
    ChevronDown,
    ChevronUp,
    Package,
    Zap,
    Users,
    TrendingUp,
    Download,
    Info
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { HtmlEscaper } from '@/utils/security/index'

import type { RecipeWithCosts } from '@/modules/hpp/hooks/useUnifiedHpp'
import type { RecipeIngredientWithPrice } from '@/modules/hpp/types/index'



interface IngredientDisplay extends RecipeIngredientWithPrice {
    category?: string
}

interface HppBreakdownVisualProps {
    recipe: RecipeWithCosts
    operationalCosts?: {
        labor: number
        utilities: number
        packaging: number
        overhead: number
    }
}

export const HppBreakdownVisual = ({ recipe, operationalCosts }: HppBreakdownVisualProps): JSX.Element => {
    const { toast } = useToast()
    const { formatCurrency } = useCurrency()
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['ingredients']))

    const toggleSection = (section: string): void => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const ingredients: IngredientDisplay[] = useMemo(() => {
        if (recipe.ingredients.length > 0) {
            return recipe.ingredients
        }

        const legacyIngredients = (recipe as { recipe_ingredients?: unknown }).recipe_ingredients
        if (Array.isArray(legacyIngredients)) {
            return legacyIngredients.map((ri) => {
                const record = ri as {
                    ingredient?: {
                        name?: string
                        price_per_unit?: number
                        category?: string
                        weighted_average_cost?: number
                    }
                    quantity?: number
                    unit?: string
                    ingredient_id?: string
                }

                return {
                    id: record.ingredient_id ?? Math.random().toString(36).slice(2),
                    name: record.ingredient?.name ?? 'Unknown',
                    quantity: record.quantity ?? 0,
                    unit: record.unit ?? 'unit',
                    unit_price: record.ingredient?.weighted_average_cost ?? record.ingredient?.price_per_unit ?? 0,
                    category: record.ingredient?.category ?? undefined
                }
            })
        }

        return []
    }, [recipe])

    // Calculate costs
    const ingredientCost = ingredients.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

    const opCosts = operationalCosts ?? {
        labor: ingredientCost * 0.10,
        utilities: ingredientCost * 0.03,
        packaging: ingredientCost * 0.05,
        overhead: ingredientCost * 0.07
    }

    const totalOperational = Object.values(opCosts).reduce((a, b) => a + b, 0)
    const totalCost = ingredientCost + totalOperational
    const sellingPrice = recipe.selling_price ?? 0
    const profit = sellingPrice - totalCost
    const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0
    const ingredientSharePercent = totalCost > 0 ? (ingredientCost / totalCost) * 100 : 0
    const operationalSharePercent = totalCost > 0 ? (totalOperational / totalCost) * 100 : 0

    // Group ingredients by category
    const ingredientsByCategory = ingredients.reduce((acc, item) => {
        const category = item.category ?? 'Lainnya'
        acc[category] ??= []
        acc[category].push(item)
        return acc
    }, {} as Record<string, IngredientDisplay[]>)

    const exportToPDF = (): void => {
        try {
            if (typeof window === 'undefined') {
                throw new Error('Export hanya tersedia di browser')
            }

            // Escape all dynamic content to prevent XSS
            const escapedRecipeName = HtmlEscaper.escape(recipe.name)
            const escapedExportDate = HtmlEscaper.escape(new Date().toLocaleString('id-ID'))
            const escapedIngredientCost = HtmlEscaper.escape(formatCurrency(ingredientCost))
            const escapedOperationalCost = HtmlEscaper.escape(formatCurrency(totalOperational))
            const escapedTotalCost = HtmlEscaper.escape(formatCurrency(totalCost))
            const escapedSellingPrice = HtmlEscaper.escape(formatCurrency(sellingPrice))
            const escapedMargin = HtmlEscaper.escape(marginPercent.toFixed(2))

            const summary = `
                <h1>Ringkasan HPP - ${escapedRecipeName}</h1>
                <p>Diekspor pada: ${escapedExportDate}</p>
                <table>
                    <tr><th>HPP Bahan</th><td>${escapedIngredientCost}</td></tr>
                    <tr><th>Biaya Operasional</th><td>${escapedOperationalCost}</td></tr>
                    <tr><th>Total HPP</th><td>${escapedTotalCost}</td></tr>
                    <tr><th>Harga Jual</th><td>${escapedSellingPrice}</td></tr>
                    <tr><th>Margin</th><td>${escapedMargin}%</td></tr>
                </table>
                <h2>Komponen Operasional</h2>
                <ul>
                    ${Object.entries(opCosts).map(([key, value]) => `<li>${HtmlEscaper.escape(key.toUpperCase())}: ${HtmlEscaper.escape(formatCurrency(value))}</li>`).join('')}
                </ul>
            `

            const ingredientRows = ingredients
                .map((item) => `<tr>
                    <td>${HtmlEscaper.escape(item.name)}</td>
                    <td>${HtmlEscaper.escape(item.quantity)} ${HtmlEscaper.escape(item.unit)}</td>
                    <td>${HtmlEscaper.escape(formatCurrency(item.unit_price))}</td>
                    <td>${HtmlEscaper.escape(formatCurrency(item.unit_price * item.quantity))}</td>
                </tr>`)
                .join('')

            // PDF export styles - inline styles required for PDF generation
            const htmlContent = `
                <html>
                    <head>
                        <title>HeyTrack - Ringkasan HPP</title>
                        <style>
                            body { font-family: 'Inter', sans-serif; padding: 24px; color: #111827; }
                            h1, h2 { margin-bottom: 8px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
                            th { background: #f3f4f6; }
                            ul { padding-left: 20px; }
                            @media print { body { margin: 0; } }
                        </style>
                    </head>
                    <body>
                        ${summary}
                        <h2>Detail Bahan</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Kuantitas</th>
                                    <th>Harga Satuan</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${ingredientRows}</tbody>
                        </table>
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(function() { window.close(); }, 1000);
                            }
                        </script>
                    </body>
                </html>
            `

            // Use secure Blob approach instead of document.write
            const secureWindow = HtmlEscaper.openSecureWindow(htmlContent, '_blank')
            if (!secureWindow) {
                throw new Error('Pop-up diblokir oleh browser')
            }

            toast({
                title: 'Export siap',
                description: 'Gunakan dialog cetak untuk menyimpan sebagai PDF.',
            })
        } catch (error) {
            toast({
                title: 'Gagal mengekspor PDF',
                description: error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat PDF.',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <Card className="border-2 border-border/20 bg-gradient-to-br from-muted/30 to-muted/50 dark:from-muted/10 dark:to-muted/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-foreground" />
                            Ringkasan HPP - {recipe.name}
                        </CardTitle>
                        <Button variant="outline" size="sm" onClick={exportToPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-card rounded-lg border">
                            <div className="text-2xl font-bold text-foreground">
                                {formatCurrency(ingredientCost)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Bahan Baku</div>
                            <div className="text-xs font-medium text-muted-foreground mt-1">
                                {ingredientSharePercent.toFixed(0)}% dari total
                            </div>
                        </div>

                        <div className="text-center p-4 bg-card rounded-lg border">
                            <div className="text-2xl font-bold text-foreground">
                                {formatCurrency(totalOperational)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Operasional</div>
                            <div className="text-xs font-medium text-muted-foreground mt-1">
                                {operationalSharePercent.toFixed(0)}% dari total
                            </div>
                        </div>

                        <div className="text-center p-4 bg-card rounded-lg border">
                            <div className="text-2xl font-bold text-foreground">
                                {formatCurrency(totalCost)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Total HPP</div>
                            <Badge variant="outline" className="mt-1 text-xs">
                                Modal Produksi
                            </Badge>
                        </div>

                        <div className="text-center p-4 bg-card rounded-lg border">
                            <div className="text-2xl font-bold text-foreground">
                                {marginPercent.toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Margin</div>
                            <Badge
                                variant={marginPercent >= 50 ? "default" : "secondary"}
                                className="mt-1 text-xs"
                            >
                                {marginPercent >= 50 ? 'Sehat' : 'Perlu Review'}
                            </Badge>
                        </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="mt-6 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Komposisi Biaya</span>
                            <span className="text-muted-foreground">Total: {formatCurrency(totalCost)}</span>
                        </div>
                        <div className="relative h-8 bg-muted rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-gradient-to-r from-muted-foreground/60 to-muted-foreground/80 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${ingredientSharePercent}%` }}
                            >
                                {ingredientSharePercent.toFixed(0)}%
                            </div>
                            <div
                                className="absolute h-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-medium"
                                style={{
                                    left: `${ingredientSharePercent}%`,
                                    width: `${operationalSharePercent}%`
                                }}
                            >
                                {operationalSharePercent.toFixed(0)}%
                            </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>🔵 Bahan Baku</span>
                            <span>🟠 Operasional</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ingredient Breakdown */}
            <Card>
                <CardHeader
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleSection('ingredients')}
                >
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-foreground" />
                            Detail Bahan Baku
                            <Badge variant="secondary">{formatCurrency(ingredientCost)}</Badge>
                        </CardTitle>
                        {expandedSections.has('ingredients') ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </div>
                </CardHeader>
                {expandedSections.has('ingredients') && (
                    <CardContent className="space-y-4">
                        {Object.entries(ingredientsByCategory).map(([category, items]) => {
                            const categoryCost = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
                            const categoryPercent = ingredientCost > 0 ? (categoryCost / ingredientCost) * 100 : 0

                            return (
                                <div key={category} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-sm">{category}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {categoryPercent.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <span className="font-medium text-sm">{formatCurrency(categoryCost)}</span>
                                    </div>
                                    <Progress value={categoryPercent} className="h-2" />

                                    <div className="ml-4 space-y-2">
                                        {items.map((item) => {
                                            const itemCost = item.unit_price * item.quantity
                                            const itemPercent = ingredientCost > 0 ? (itemCost / ingredientCost) * 100 : 0

                                            return (
                                                <div key={item['id']} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span>{item.name}</span>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Info className="h-3 w-3 text-muted-foreground" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p className="text-xs">
                                                                        {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}/{item.unit}
                                                                    </p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.quantity} {item.unit} • {itemPercent.toFixed(1)}% dari total bahan
                                                        </div>
                                                    </div>
                                                    <span className="font-medium">{formatCurrency(itemCost)}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                )}
            </Card>

            {/* Operational Costs Breakdown */}
            <Card>
                <CardHeader
                    className="cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => toggleSection('operational')}
                >
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-foreground" />
                            Biaya Operasional
                            <Badge variant="secondary">{formatCurrency(totalOperational)}</Badge>
                        </CardTitle>
                        {expandedSections.has('operational') ? (
                            <ChevronUp className="h-5 w-5" />
                        ) : (
                            <ChevronDown className="h-5 w-5" />
                        )}
                    </div>
                </CardHeader>
                {expandedSections.has('operational') && (
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Tenaga Kerja', value: opCosts.labor, icon: Users, color: 'text-muted-foreground' },
                            { label: 'Utilitas (Listrik, Air, Gas)', value: opCosts.utilities, icon: Zap, color: 'text-muted-foreground' },
                            { label: 'Packaging & Kemasan', value: opCosts.packaging, icon: Package, color: 'text-muted-foreground' },
                            { label: 'Overhead Lainnya', value: opCosts.overhead, icon: TrendingUp, color: 'text-muted-foreground' },
                        ].map((item) => {
                            const percent = (item.value / totalOperational) * 100
                            const Icon = item.icon

                            return (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className="h-4 w-4 text-foreground" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {percent.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <span className="font-medium text-sm">{formatCurrency(item.value)}</span>
                                    </div>
                                    <Progress value={percent} className="h-2" />
                                </div>
                            )
                        })}

                        <div className="mt-4 p-3 bg-muted/20 rounded-lg border border-border/20 ">
                            <p className="text-xs text-foreground dark:text-muted-foreground">
                                💡 <strong>Tips:</strong> Biaya operasional dihitung sebagai persentase dari biaya bahan baku.
                                Anda bisa customize nilai ini di halaman Settings untuk hasil yang lebih akurat.
                            </p>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Profit Analysis */}
            {sellingPrice > 0 && (
                <Card className="border-2 border-border/20 ">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-foreground" />
                            Analisis Profit
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-muted/20 rounded-lg">
                                <div className="text-xl font-bold text-foreground">
                                    {formatCurrency(sellingPrice)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Harga Jual</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="text-xl font-bold text-foreground">
                                    {formatCurrency(totalCost)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Total HPP</div>
                            </div>
                            <div className="text-center p-4 bg-muted/20 rounded-lg">
                                <div className="text-xl font-bold text-foreground">
                                    {formatCurrency(profit)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">Profit Bersih</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Margin Profit</span>
                                <span className="font-bold text-foreground">{marginPercent.toFixed(1)}%</span>
                            </div>
                            <Progress value={marginPercent} className="h-3" />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-card rounded-lg border">
                                <div className="text-muted-foreground mb-1">Break-even Point</div>
                                <div className="font-bold">
                                    {profit > 0 ? Math.ceil(100000 / profit) : '-'} unit
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    untuk profit Rp 100.000
                                </div>
                            </div>
                            <div className="p-3 bg-card rounded-lg border">
                                <div className="text-muted-foreground mb-1">Target Harian</div>
                                <div className="font-bold">
                                    {profit > 0 ? Math.ceil(500000 / profit) : '-'} unit
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    untuk profit Rp 500.000/hari
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

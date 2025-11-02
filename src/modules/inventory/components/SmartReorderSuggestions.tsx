'use client'


import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import type { IngredientsTable } from '@/types/database'
import { ShoppingCart, TrendingUp, Calendar, Package, Sparkles, AlertCircle } from 'lucide-react'




type Ingredient = IngredientsTable

interface ReorderSuggestion {
    ingredient: Ingredient
    suggestedQuantity: number
    urgency: 'critical' | 'high' | 'medium' | 'low'
    estimatedCost: number
    reason: string
    daysUntilOut?: number
}

interface SmartReorderSuggestionsProps {
    ingredients: Ingredient[]
    usageHistory?: Record<string, number> // ingredient_id -> avg daily usage
    onCreatePurchaseOrder?: (suggestions: ReorderSuggestion[]) => void
}

export const SmartReorderSuggestions = ({
    ingredients,
    usageHistory = {},
    onCreatePurchaseOrder
}: SmartReorderSuggestionsProps) => {
    const { formatCurrency } = useCurrency()
    const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set())

    // Generate smart suggestions
    const suggestions: ReorderSuggestion[] = ingredients
        .filter(ing => {
            const currentStock = ing.current_stock || 0
            const minStock = ing.min_stock || 0
            return currentStock <= minStock
        })
        .map(ing => {
            const currentStock = ing.current_stock || 0
            const minStock = ing.min_stock || 0
            const avgDailyUsage = usageHistory[ing.id] || (minStock * 0.1) // fallback estimate
            const daysUntilOut = avgDailyUsage > 0 ? Math.floor(currentStock / avgDailyUsage) : 0

            // Calculate suggested quantity (2x min stock for safety)
            const suggestedQuantity = Math.max(
                minStock * 2 - currentStock,
                minStock
            )

            // Determine urgency
            let urgency: ReorderSuggestion['urgency'] = 'low'
            let reason = 'Stok mendekati minimum'

            if (currentStock <= 0) {
                urgency = 'critical'
                reason = 'Stok habis! Tidak dapat produksi'
            } else if (daysUntilOut <= 2) {
                urgency = 'critical'
                reason = `Stok habis dalam ${daysUntilOut} hari`
            } else if (currentStock <= minStock * 0.5) {
                urgency = 'high'
                reason = `Stok sangat rendah (${Math.round((currentStock / minStock) * 100)}% dari minimum)`
            } else if (daysUntilOut <= 7) {
                urgency = 'medium'
                reason = `Stok habis dalam ${daysUntilOut} hari`
            }

            return {
                ingredient: ing,
                suggestedQuantity,
                urgency,
                estimatedCost: suggestedQuantity * (ing.price_per_unit || 0),
                reason,
                daysUntilOut: daysUntilOut > 0 ? daysUntilOut : undefined
            }
        })
        .sort((a, b) => {
            // Sort by urgency
            const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
            return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
        })

    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedSuggestions)
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        setSelectedSuggestions(newSelection)
    }

    const selectAll = () => {
        setSelectedSuggestions(new Set(suggestions.map(s => s.ingredient.id)))
    }

    const clearSelection = () => {
        setSelectedSuggestions(new Set())
    }

    const selectedTotal = suggestions
        .filter(s => selectedSuggestions.has(s.ingredient.id))
        .reduce((sum, s) => sum + s.estimatedCost, 0)

    const handleCreatePO = () => {
        const selected = suggestions.filter(s => selectedSuggestions.has(s.ingredient.id))
        onCreatePurchaseOrder?.(selected)
    }

    const getUrgencyColor = (urgency: ReorderSuggestion['urgency']) => {
        switch (urgency) {
            case 'critical': return 'bg-red-100 text-red-700 border-red-300'
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-300'
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-300'
        }
    }

    const getUrgencyLabel = (urgency: ReorderSuggestion['urgency']) => {
        switch (urgency) {
            case 'critical': return 'Urgent'
            case 'high': return 'Tinggi'
            case 'medium': return 'Sedang'
            case 'low': return 'Rendah'
        }
    }

    if (suggestions.length === 0) {
        return (
            <Card className="border-2 border-green-200 bg-green-50/50">
                <CardContent className="p-8">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-green-900">✅ Semua Stok Aman!</p>
                            <p className="text-sm text-green-700 mt-1">
                                Tidak ada bahan yang perlu di-reorder saat ini
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div>Smart Reorder Suggestions</div>
                                <p className="text-sm font-normal text-muted-foreground mt-0.5">
                                    AI-powered recommendations based on usage patterns
                                </p>
                            </div>
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-2xl font-bold text-purple-600">{suggestions.length}</div>
                            <div className="text-xs text-muted-foreground mt-1">Items to Reorder</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-2xl font-bold text-red-600">
                                {suggestions.filter(s => s.urgency === 'critical').length}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Critical</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">{selectedSuggestions.size}</div>
                            <div className="text-xs text-muted-foreground mt-1">Selected</div>
                        </div>
                        <div className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border">
                            <div className="text-lg font-bold text-blue-600">{formatCurrency(selectedTotal)}</div>
                            <div className="text-xs text-muted-foreground mt-1">Est. Cost</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll}>
                        Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                        Clear
                    </Button>
                </div>
                <Button
                    onClick={handleCreatePO}
                    disabled={selectedSuggestions.size === 0}
                    className="gap-2"
                >
                    <ShoppingCart className="h-4 w-4" />
                    Create PO ({selectedSuggestions.size})
                </Button>
            </div>

            {/* Suggestions List */}
            <div className="space-y-3">
                {suggestions.map(suggestion => {
                    const isSelected = selectedSuggestions.has(suggestion.ingredient.id)
                    const urgencyColor = getUrgencyColor(suggestion.urgency)

                    return (
                        <Card
                            key={suggestion.ingredient.id}
                            className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-purple-500 border-purple-300' : ''
                                }`}
                            onClick={() => toggleSelection(suggestion.ingredient.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <div className="flex items-center pt-1">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSelection(suggestion.ingredient.id)}
                                            className="w-5 h-5 rounded border-gray-300"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold">{suggestion.ingredient.name}</span>
                                                    <Badge className={urgencyColor}>
                                                        {getUrgencyLabel(suggestion.urgency)}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <AlertCircle className="h-3 w-3" />
                                                    <span>{suggestion.reason}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-purple-600">
                                                    {formatCurrency(suggestion.estimatedCost)}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Est. Cost</div>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                                <div className="text-xs text-muted-foreground mb-1">Current Stock</div>
                                                <div className="font-medium">
                                                    {(suggestion.ingredient.current_stock || 0)} {suggestion.ingredient.unit || ''}
                                                </div>
                                            </div>

                                            <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded">
                                                <div className="text-xs text-muted-foreground mb-1">Min Stock</div>
                                                <div className="font-medium">
                                                    {(suggestion.ingredient.min_stock || 0)} {suggestion.ingredient.unit || ''}
                                                </div>
                                            </div>

                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200">
                                                <div className="text-xs text-purple-700 dark:text-purple-300 mb-1">
                                                    Suggested Order
                                                </div>
                                                <div className="font-bold text-purple-600">
                                                    {suggestion.suggestedQuantity} {suggestion.ingredient.unit || ''}
                                                </div>
                                            </div>

                                            {suggestion.daysUntilOut !== undefined && (
                                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200">
                                                    <div className="text-xs text-orange-700 dark:text-orange-300 mb-1 flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        Days Left
                                                    </div>
                                                    <div className="font-bold text-orange-600">
                                                        {suggestion.daysUntilOut} days
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* AI Insight */}
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                                            <div className="flex items-start gap-2 text-sm">
                                                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-blue-800 dark:text-blue-200">
                                                    <strong>AI Recommendation:</strong> Order {suggestion.suggestedQuantity} {suggestion.ingredient.unit || ''}
                                                    {' '}(2x minimum stock) untuk safety buffer.
                                                    Harga per unit: {formatCurrency(suggestion.ingredient.price_per_unit || 0)}.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Summary Footer */}
            {selectedSuggestions.size > 0 && (
                <Card className="border-2 border-purple-200 bg-purple-50/50">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-semibold">Selected Items Summary</div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {selectedSuggestions.size} items selected for purchase order
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(selectedTotal)}
                                </div>
                                <div className="text-xs text-muted-foreground">Total Estimated Cost</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

'use client'

import React from 'react'
import { Package, AlertCircle } from '@/components/icons'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrency } from '@/hooks/useCurrency'
import { BaseIngredientSelector } from './BaseIngredientSelector'

interface SmartIngredientSelectorProps {
    availableIngredients: Array<{
        id: string
        name: string
        unit: string
        price_per_unit: number
        current_stock: number
        minimum_stock?: number
    }>
    selectedIngredients: string[]
    onSelectionChange: (selected: string[]) => void
    productType: string
    customIngredients?: string[]
    onCustomIngredientsChange?: (custom: string[]) => void
}

export const SmartIngredientSelector = ({
    availableIngredients,
    selectedIngredients,
    onSelectionChange,
    productType,
    customIngredients = [],
    onCustomIngredientsChange
}: SmartIngredientSelectorProps) => {
    const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({})
    const [customIngredientsText, setCustomIngredientsText] = useState('')
    const { formatCurrency } = useCurrency()

    const getDefaultQuantity = (unit: string): number => {
        // Smart defaults based on unit
        if (unit.toLowerCase().includes('kg')) return 0.5
        if (unit.toLowerCase().includes('gram') || unit.toLowerCase().includes('g')) return 100
        if (unit.toLowerCase().includes('liter') || unit.toLowerCase().includes('l')) return 0.25
        if (unit.toLowerCase().includes('ml')) return 50
        if (unit.toLowerCase().includes('pcs') || unit.toLowerCase().includes('buah')) return 2
        return 1 // fallback
    }

    // Sync custom ingredients text when props change
    React.useEffect(() => {
        setCustomIngredientsText(customIngredients.join(', '))
    }, [customIngredients])

    // Auto-set quantities when ingredients are selected
    useEffect(() => {
        const newQuantities = { ...ingredientQuantities }
        selectedIngredients.forEach(id => {
            if (!(id in newQuantities)) {
                const ingredient = availableIngredients.find(ing => ing.id === id)
                if (ingredient) {
                    newQuantities[id] = getDefaultQuantity(ingredient.unit)
                }
            }
        })
        // Remove quantities for deselected ingredients
        Object.keys(newQuantities).forEach(id => {
            if (!selectedIngredients.includes(id)) {
                delete newQuantities[id]
            }
        })
        setIngredientQuantities(newQuantities)
    }, [selectedIngredients, availableIngredients, ingredientQuantities])

    const updateQuantity = (id: string, quantity: number) => {
        setIngredientQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, quantity)
        }))
    }

    const handleCustomIngredientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomIngredientsText(e.target.value)
    }

    const handleCustomIngredientsBlur = () => {
        const parsed = customIngredientsText
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)

        if (onCustomIngredientsChange) {
            onCustomIngredientsChange(parsed)
        }
    }

    return (
        <BaseIngredientSelector
            availableIngredients={availableIngredients}
            selectedIngredients={selectedIngredients}
            onSelectionChange={onSelectionChange}
            productType={productType}
            title="Pilih Bahan"
        >
            {/* Custom Ingredients Input */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Bahan Tambahan (Opsional)</label>
                    <Badge variant="outline" className="text-xs">
                        {customIngredients.length} bahan custom
                    </Badge>
                </div>
                <Textarea
                    placeholder="Ketik bahan tambahan yang tidak ada di inventory, pisahkan dengan koma (contoh: ekstrak vanila, pewarna makanan merah)"
                    value={customIngredientsText}
                    onChange={handleCustomIngredientsChange}
                    onBlur={handleCustomIngredientsBlur}
                    rows={2}
                    className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                    Bahan ini akan digunakan AI untuk generate resep, meskipun belum ada di inventory Anda
                </p>
            </div>

            {/* Selected Ingredients with Quantities */}
            {selectedIngredients.length > 0 && (
                <div className="space-y-3">
                    <div className="text-sm font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Bahan Terpilih ({selectedIngredients.length})
                    </div>

                    <div className="space-y-2">
                        {selectedIngredients.map(ingredientId => {
                            const ingredient = availableIngredients.find(ing => ing.id === ingredientId)
                            if (!ingredient) return null

                            const quantity = ingredientQuantities[ingredientId] ?? getDefaultQuantity(ingredient.unit)
                            const totalCost = quantity * ingredient.price_per_unit

                            return (
                                <div key={ingredientId} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm">{ingredient.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {formatCurrency(ingredient.price_per_unit)}/{ingredient.unit}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={quantity}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuantity(ingredientId, parseFloat(e.target.value.replace(',', '.')) || 0)}
                                            className="w-20 h-8 text-sm"
                                            placeholder="Qty"
                                        />
                                        <span className="text-sm text-muted-foreground min-w-8">
                                            {ingredient.unit}
                                        </span>
                                    </div>

                                    <div className="text-right min-w-20">
                                        <div className="font-medium text-sm">
                                            {formatCurrency(totalCost)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                            onSelectionChange(selectedIngredients.filter(id => id !== ingredientId))
                                            const newQuantities = { ...ingredientQuantities }
                                            delete newQuantities[ingredientId]
                                            setIngredientQuantities(newQuantities)
                                        }}
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                    >
                                        ×
                                    </Button>
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        💡 Sesuaikan quantity bahan sesuai kebutuhan resep Anda
                    </div>
                </div>
            )}

            {/* Warning if no ingredients selected */}
            {selectedIngredients.length + customIngredients.length === 0 && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-yellow-600">
                            <div className="font-semibold mb-1">Pilih minimal 3 bahan</div>
                            <div>
                                AI butuh minimal 3 bahan untuk generate resep yang bagus.
                                Klik &quot;Pilih Semua Saran&quot; untuk quick start, atau ketik bahan tambahan di atas!
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </BaseIngredientSelector>
    )
}
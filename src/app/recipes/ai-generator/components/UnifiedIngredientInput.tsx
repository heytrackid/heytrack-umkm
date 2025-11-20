'use client'

import React, { useState, useEffect } from 'react'
import { Package, Search, Plus, X, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCurrency } from '@/hooks/useCurrency'
import { getSmartIngredientSuggestions } from '@/lib/utils/recipe-helpers'

interface UnifiedIngredientInputProps {
  availableIngredients: Array<{
    id: string
    name: string
    unit: string
    price_per_unit: number
    current_stock: number
    minimum_stock?: number
  }>
  selectedIngredients: string[]
  customIngredients: string[]
  onSelectionChange: (selected: string[]) => void
  onCustomIngredientsChange: (custom: string[]) => void
  productType: string
  disabled?: boolean
}

export const UnifiedIngredientInput = ({
  availableIngredients,
  selectedIngredients,
  customIngredients,
  onSelectionChange,
  onCustomIngredientsChange,
  productType,
  disabled = false
}: UnifiedIngredientInputProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [customInput, setCustomInput] = useState('')
  const { formatCurrency } = useCurrency()

  // Get smart suggestions based on product type
  const suggestions = getSmartIngredientSuggestions(productType)

  // Auto-select suggested ingredients on product type change
  useEffect(() => {
    if (productType && selectedIngredients.length === 0) {
      const suggestedIds: string[] = []

      suggestions.forEach(suggestion => {
        const match = availableIngredients.find(ing =>
          ing.name.toLowerCase().includes(suggestion.name.toLowerCase()) ||
          suggestion.name.toLowerCase().includes(ing.name.toLowerCase())
        )

        if (match && suggestion.priority === 'essential') {
          suggestedIds.push(match.id)
        }
      })

      if (suggestedIds.length > 0) {
        onSelectionChange(suggestedIds)
      }
    }
  }, [productType, availableIngredients, suggestions, selectedIngredients.length, onSelectionChange])

  // Filter ingredients based on search (improved fuzzy search)
  const filteredIngredients = availableIngredients.filter(ing => {
    const lowerName = ing.name.toLowerCase()
    const lowerQuery = searchQuery.toLowerCase()

    // Direct match
    if (lowerName.includes(lowerQuery)) return true

    // Word boundary match (search term appears after space or at start)
    const words = lowerName.split(/\s+/)
    return words.some(word => word.startsWith(lowerQuery))
  })

  // Group ingredients: suggested vs others
  const suggestedIngredients = filteredIngredients.filter(ing =>
    suggestions.some(s =>
      ing.name.toLowerCase().includes(s.name.toLowerCase()) ||
      s.name.toLowerCase().includes(ing.name.toLowerCase())
    )
  )

  const otherIngredients = filteredIngredients.filter(ing =>
    !suggestedIngredients.includes(ing)
  )

  const toggleIngredient = (id: string) => {
    if (disabled) return

    if (selectedIngredients.includes(id)) {
      onSelectionChange(selectedIngredients.filter(i => i !== id))
    } else {
      onSelectionChange([...selectedIngredients, id])
    }
  }

  const addCustomIngredient = () => {
    if (disabled || !customInput.trim()) return

    const newCustom = customInput.trim()
    if (!customIngredients.includes(newCustom)) {
      onCustomIngredientsChange([...customIngredients, newCustom])
    }
    setCustomInput('')
  }

  const removeCustomIngredient = (ingredient: string) => {
    if (disabled) return
    onCustomIngredientsChange(customIngredients.filter(i => i !== ingredient))
  }

  const handleCustomInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomIngredient()
    }
  }

  const selectAllSuggested = () => {
    if (disabled) return

    const allSuggestedIds = suggestedIngredients.map(ing => ing.id)
    const newSelection = [...new Set([...selectedIngredients, ...allSuggestedIds])]
    onSelectionChange(newSelection)
  }

  const clearSelection = () => {
    if (disabled) return
    onSelectionChange([])
  }

  const getStockStatus = (ingredient: typeof availableIngredients[0]) => {
    if ((ingredient.current_stock || 0) === 0) {
      return { label: 'Habis', color: 'bg-red-500' }
    }
    const minimumStock = ingredient.minimum_stock ?? 0
    if ((ingredient.current_stock || 0) < minimumStock) {
      return { label: 'Menipis', color: 'bg-yellow-500' }
    }
    return { label: 'Tersedia', color: 'bg-muted' }
  }

  const totalIngredients = selectedIngredients.length + customIngredients.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Bahan yang Digunakan
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {totalIngredients} bahan dipilih
            </Badge>
            {totalIngredients >= 3 && (
              <Badge variant="default" className="text-xs bg-green-500">
                ✓ Siap Generate
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Custom Ingredient Input */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tambah Bahan Custom</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ketik bahan yang tidak ada di inventory..."
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyPress={handleCustomInputKeyPress}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={addCustomIngredient}
              disabled={disabled || !customInput.trim()}
              className="px-3"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tekan Enter atau klik + untuk menambah bahan custom
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari bahan dari inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="pl-9"
          />
        </div>

        {/* Quick Actions */}
        {suggestedIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={selectAllSuggested}
              disabled={disabled}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Pilih Semua Saran
            </Button>
            {selectedIngredients.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                disabled={disabled}
                className="text-xs"
              >
                Clear Selection
              </Button>
            )}
          </div>
        )}

        {/* Selected Custom Ingredients */}
        {customIngredients.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-orange-600">Bahan Custom:</Label>
            <div className="flex flex-wrap gap-2">
              {customIngredients.map((ingredient, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                >
                  {ingredient}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeCustomIngredient(ingredient)}
                    disabled={disabled}
                    className="h-4 w-4 p-0 ml-1 hover:bg-orange-200"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Ingredients */}
        {suggestedIngredients.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Bahan yang Disarankan</span>
              <Badge variant="secondary" className="text-xs">
                Untuk {productType}
              </Badge>
            </div>

            <div className="space-y-1 max-h-40 overflow-y-auto">
              {suggestedIngredients.map(ingredient => {
                const stockStatus = getStockStatus(ingredient)
                const isSelected = selectedIngredients.includes(ingredient.id)

                return (
                  <div
                    key={ingredient.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-primary/5 border-primary' : 'border-border/20'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => !disabled && toggleIngredient(ingredient.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => !disabled && toggleIngredient(ingredient.id)}
                      disabled={disabled}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{ingredient.name}</span>
                        <div className={`h-2 w-2 rounded-full ${stockStatus.color}`} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(ingredient.price_per_unit)}/{ingredient.unit} •
                        Stok: {ingredient.current_stock} {ingredient.unit}
                      </div>
                    </div>

                    {stockStatus.label !== 'Tersedia' && (
                      <Badge variant="secondary" className="text-xs">
                        {stockStatus.label}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Other Ingredients */}
        {otherIngredients.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Bahan Lainnya</div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {otherIngredients.slice(0, 10).map(ingredient => {
                const stockStatus = getStockStatus(ingredient)
                const isSelected = selectedIngredients.includes(ingredient.id)

                return (
                  <div
                    key={ingredient.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-primary/5 border-primary' : 'border-border/20'
                    } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    onClick={() => !disabled && toggleIngredient(ingredient.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => !disabled && toggleIngredient(ingredient.id)}
                      disabled={disabled}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{ingredient.name}</span>
                        <div className={`h-1.5 w-1.5 rounded-full ${stockStatus.color}`} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(ingredient.price_per_unit)}/{ingredient.unit}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredIngredients.length === 0 && searchQuery && (
          <div className="text-center py-6 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Tidak ada bahan yang cocok dengan &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {/* Minimum Ingredients Warning */}
        {totalIngredients < 3 && !disabled && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2">
              <Package className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-600">
                <div className="font-semibold mb-1">Minimal 3 bahan diperlukan</div>
                <div>
                  AI butuh minimal 3 bahan untuk membuat resep yang bagus.
                  Pilih dari inventory atau tambah bahan custom di atas!
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
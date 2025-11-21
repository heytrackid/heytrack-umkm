import React, { useState, useEffect } from 'react'
import { Package, Search, Sparkles } from '@/components/icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { useCurrency } from '@/hooks/useCurrency'
import { getSmartIngredientSuggestions } from '@/lib/utils/recipe-helpers'

interface Ingredient {
  id: string
  name: string
  unit: string
  price_per_unit: number
  current_stock: number
  minimum_stock?: number
}

interface BaseIngredientSelectorProps {
  availableIngredients: Ingredient[]
  selectedIngredients: string[]
  onSelectionChange: (selected: string[]) => void
  productType: string
  title?: string
  disabled?: boolean
  children?: React.ReactNode // For custom sections like quantities
}

export const BaseIngredientSelector = ({
  availableIngredients,
  selectedIngredients,
  onSelectionChange,
  productType,
  title = "Pilih Bahan",
  disabled = false,
  children
}: BaseIngredientSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('')
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

  // Filter ingredients based on search
  const filteredIngredients = availableIngredients.filter(ing =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const selectAllSuggested = () => {
    const allSuggestedIds = suggestedIngredients.map(ing => ing.id)
    const newSelection = [...new Set([...selectedIngredients, ...allSuggestedIds])]
    onSelectionChange(newSelection)
  }

  const clearSelection = () => {
    onSelectionChange([])
  }

  const getStockStatus = (ingredient: Ingredient) => {
    if ((ingredient.current_stock || 0) === 0) {
      return { label: 'Habis', color: 'bg-red-500' }
    }
    const minimumStock = ingredient.minimum_stock ?? 0
    if ((ingredient.current_stock || 0) < minimumStock) {
      return { label: 'Menipis', color: 'bg-yellow-500' }
    }
    return { label: 'Tersedia', color: 'bg-green-500' }
  }

  const renderIngredientItem = (ingredient: Ingredient, isSuggested: boolean = false) => {
    const stockStatus = getStockStatus(ingredient)
    const isSelected = selectedIngredients.includes(ingredient.id)

    return (
      <div
        key={ingredient.id}
        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? 'bg-primary/5 border-primary' : 'border-border/20'
        }`}
        onClick={() => toggleIngredient(ingredient.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            toggleIngredient(ingredient.id)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleIngredient(ingredient.id)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${isSuggested ? 'font-semibold' : ''}`}>
              {ingredient.name}
            </span>
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
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {suggestedIngredients.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={selectAllSuggested}
                className="text-xs"
                disabled={disabled}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Pilih Semua Saran
              </Button>
            )}
            {selectedIngredients.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
                className="text-xs"
                disabled={disabled}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{selectedIngredients.length} bahan dipilih</span>
          {selectedIngredients.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedIngredients.length >= 3 ? '✓ Cukup' : '⚠️ Minimal 3 bahan'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari bahan..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="pl-9"
            disabled={disabled}
          />
        </div>

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

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {suggestedIngredients.map(ingredient => renderIngredientItem(ingredient, true))}
            </div>
          </div>
        )}

        {/* Other Ingredients */}
        {otherIngredients.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-semibold">Bahan Lainnya</div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {otherIngredients.map(ingredient => renderIngredientItem(ingredient))}
            </div>
          </div>
        )}

        {/* Custom content from children */}
        {children}
      </CardContent>
    </Card>
  )
}
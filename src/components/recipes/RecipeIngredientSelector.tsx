'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useIngredients } from '@/hooks/api/use-ingredients'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface RecipeIngredient {
  ingredient_id: string
  quantity: number
  unit?: string
  notes?: string | null
}

interface RecipeIngredientSelectorProps {
  ingredients: RecipeIngredient[]
  onChange: (ingredients: RecipeIngredient[]) => void
  errors?: string
}

export function RecipeIngredientSelector({
  ingredients,
  onChange,
  errors,
}: RecipeIngredientSelectorProps): JSX.Element {
  const { data: availableIngredients, isLoading } = useIngredients()
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>('')

  const handleAdd = () => {
    if (!selectedIngredientId) return

    const ingredient = availableIngredients?.find((i) => i.id === selectedIngredientId)
    if (!ingredient) return

    onChange([
      ...ingredients,
      {
        ingredient_id: selectedIngredientId,
        quantity: 1,
        unit: ingredient.unit,
        notes: null,
      },
    ])
    setSelectedIngredientId('')
  }

  const handleRemove = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], quantity }
    onChange(updated)
  }

  const handleNotesChange = (index: number, notes: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], notes }
    onChange(updated)
  }

  const getIngredientName = (ingredientId: string) => {
    return availableIngredients?.find((i) => i.id === ingredientId)?.name || 'Unknown'
  }

  const getIngredientUnit = (ingredientId: string) => {
    return availableIngredients?.find((i) => i.id === ingredientId)?.unit || ''
  }

  const getIngredientPrice = (ingredientId: string) => {
    return availableIngredients?.find((i) => i.id === ingredientId)?.price_per_unit || 0
  }

  const calculateTotalCost = () => {
    return ingredients.reduce((total, item) => {
      const price = getIngredientPrice(item.ingredient_id)
      return total + price * item.quantity
    }, 0)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="ingredient-select">Pilih Bahan Baku</Label>
          <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
            <SelectTrigger id="ingredient-select">
              <SelectValue placeholder="Pilih bahan baku..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Memuat...
                </SelectItem>
              ) : availableIngredients && availableIngredients.length > 0 ? (
                availableIngredients
                  .filter((ing) => !ingredients.some((i) => i.ingredient_id === ing.id))
                  .map((ingredient) => (
                    <SelectItem key={ingredient.id} value={ingredient.id}>
                      {ingredient.name} ({ingredient.unit})
                    </SelectItem>
                  ))
              ) : (
                <SelectItem value="empty" disabled>
                  Tidak ada bahan baku
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={handleAdd} disabled={!selectedIngredientId}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah
        </Button>
      </div>

      {errors && <p className="text-sm text-destructive">{errors}</p>}

      {ingredients.length > 0 && (
        <div className="space-y-3">
          <div className="border rounded-lg divide-y">
            {ingredients.map((item, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{getIngredientName(item.ingredient_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(getIngredientPrice(item.ingredient_id))} /{' '}
                      {getIngredientUnit(item.ingredient_id)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    aria-label={`Remove ${getIngredientName(item.ingredient_id)}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Jumlah</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-${index}`}>Satuan</Label>
                    <Input
                      id={`unit-${index}`}
                      value={item.unit || getIngredientUnit(item.ingredient_id)}
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${index}`}>Catatan (opsional)</Label>
                  <Input
                    id={`notes-${index}`}
                    value={item.notes || ''}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    placeholder="Catatan tambahan..."
                  />
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Subtotal: </span>
                  <span className="font-medium">
                    {formatCurrency(getIngredientPrice(item.ingredient_id) * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-semibold">Total Biaya Bahan Baku:</span>
            <span className="text-lg font-bold">{formatCurrency(calculateTotalCost())}</span>
          </div>
        </div>
      )}

      {ingredients.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada bahan baku. Tambahkan bahan baku untuk resep ini.
        </div>
      )}
    </div>
  )
}

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
import { useRecipes } from '@/hooks/useRecipes'
import { Plus, Trash2 } from '@/components/icons'
import { useState } from 'react'

interface OrderItem {
  recipe_id?: string | null
  product_name: string
  quantity: number
  unit_price: number
  notes?: string | null
}

interface OrderItemsSelectorProps {
  items: OrderItem[]
  onChange: (items: OrderItem[]) => void
  errors?: string
}

export function OrderItemsSelector({
  items,
  onChange,
  errors,
}: OrderItemsSelectorProps): JSX.Element {
  const { data: recipes, isLoading } = useRecipes()
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('')
  const [_customProduct, setCustomProduct] = useState(false)

  const handleAddFromRecipe = () => {
    if (!selectedRecipeId) return

    const recipe = recipes?.find((r) => r.id === selectedRecipeId)
    if (!recipe) return

    onChange([
      ...items,
      {
        recipe_id: selectedRecipeId,
        product_name: recipe.name,
        quantity: 1,
        unit_price: recipe.selling_price || 0,
        notes: null,
      },
    ])
    setSelectedRecipeId('')
  }

  const handleAddCustom = () => {
    onChange([
      ...items,
      {
        recipe_id: null,
        product_name: '',
        quantity: 1,
        unit_price: 0,
        notes: null,
      },
    ])
    setCustomProduct(false)
  }

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const handleFieldChange = (index: number, field: keyof OrderItem, value: unknown) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value } as OrderItem
    onChange(updated)
  }



  const calculateSubtotal = (item: OrderItem) => {
    return (item.quantity || 0) * (item.unit_price || 0)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0)
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
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="recipe-select">Pilih dari Resep</Label>
          <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
            <SelectTrigger id="recipe-select">
              <SelectValue placeholder="Pilih resep..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Memuat...
                </SelectItem>
              ) : recipes && recipes.length > 0 ? (
                recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id}>
                    {recipe.name} - {formatCurrency(recipe.selling_price || 0)}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>
                  Tidak ada resep
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button type="button" onClick={handleAddFromRecipe} disabled={!selectedRecipeId}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah
          </Button>
          <Button type="button" variant="outline" onClick={handleAddCustom}>
            <Plus className="h-4 w-4 mr-2" />
            Custom
          </Button>
        </div>
      </div>

      {errors && <p className="text-sm text-destructive">{errors}</p>}

      {items.length > 0 && (
        <div className="space-y-3">
          <div className="border rounded-lg divide-y">
            {items.map((item, index) => (
              <div key={index} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label htmlFor={`product-name-${index}`}>Nama Produk *</Label>
                    <Input
                      id={`product-name-${index}`}
                      value={item.product_name}
                      onChange={(e) => handleFieldChange(index, 'product_name', e.target.value)}
                      placeholder="Nama produk"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(index)}
                    className="ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Jumlah *</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleFieldChange(index, 'quantity', parseInt(e.target.value))
                      }
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-price-${index}`}>Harga Satuan *</Label>
                    <Input
                      id={`unit-price-${index}`}
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        handleFieldChange(index, 'unit_price', parseFloat(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`notes-${index}`}>Catatan (opsional)</Label>
                  <Input
                    id={`notes-${index}`}
                    value={item.notes || ''}
                    onChange={(e) => handleFieldChange(index, 'notes', e.target.value)}
                    placeholder="Catatan tambahan..."
                  />
                </div>

                <div className="text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Subtotal: </span>
                  <span className="font-medium">{formatCurrency(calculateSubtotal(item))}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <span className="font-semibold">Total Pesanan:</span>
            <span className="text-lg font-bold">{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada item. Tambahkan produk untuk pesanan ini.
        </div>
      )}
    </div>
  )
}

'use client'

import { Plus, Trash2, Package, GripVertical } from 'lucide-react'
import { useState } from 'react'

import type { OrderItem } from '@/app/orders/new/hooks/useOrderLogic'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { Recipe } from '@/types/index'


interface OrderItemsStepProps {
  orderItems: OrderItem[]
  availableRecipes: Recipe[]
  subtotal: number
  onAddItem: () => void
  onUpdateItem: (index: number, field: keyof OrderItem, value: boolean | number | string) => void
  onRemoveItem: (index: number) => void
  onReorderItems?: (fromIndex: number, toIndex: number) => void
}

export const OrderItemsStep = ({
  orderItems,
  availableRecipes,
  subtotal,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onReorderItems
}: OrderItemsStepProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorderItems) {
      onReorderItems(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Item Pesanan</h3>
        <Button type="button" onClick={onAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Item
        </Button>
      </div>

      {orderItems.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Belum ada item ditambahkan</p>
          <p className="text-sm">Klik &quot;Tambah Item&quot; untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderItems.map((item, index) => {
            const itemKey = item['id'] ?? `${item.recipe_id}-${index}`

            return (
              <div
                key={itemKey}
                className={`border rounded-lg p-4 transition-all ${
                  draggedIndex === index ? 'opacity-50 shadow-lg' : ''
                } ${draggedIndex !== null && draggedIndex !== index ? 'hover:border-primary/50' : ''}`}
                draggable={Boolean(onReorderItems)}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
              >
                {onReorderItems && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="cursor-move text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Item {index + 1}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                  {/* Recipe Selection */}
                  <div className="md:col-span-2">
                    <Label htmlFor={`recipe-${index}`}>Resep</Label>
                    <Select
                      value={item.recipe_id}
                      onValueChange={(value: string) => onUpdateItem(index, 'recipe_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih resep" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRecipes.map((recipe) => (
                          <SelectItem key={recipe['id']} value={recipe['id']}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <Label htmlFor={`quantity-${index}`}>Jumlah</Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>

                  {/* Unit Price */}
                  <div>
                    <Label htmlFor={`price-${index}`}>Harga Satuan</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      min="0"
                      step="1000"
                      value={item.unit_price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'unit_price', parseFloat(e.target.value.replace(',', '.')) || 0)}
                      placeholder="0"
                    />
                  </div>

                  {/* Total Price */}
                  <div>
                    <Label>Total</Label>
                    <div className="flex items-center justify-between h-10 px-3 border rounded-md bg-muted">
                      <span className="font-medium">
                        Rp {(item.quantity * item.unit_price).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mt-3">
                  <Label htmlFor={`requests-${index}`}>Catatan Khusus (Opsional)</Label>
                  <Input
                    id={`requests-${index}`}
                     value={item.special_requests ?? ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'special_requests', e.target.value)}
                    placeholder="Contoh: Tidak pakai bawang, lebih manis"
                  />
                </div>

                {/* Remove Button */}
                <div className="flex justify-end mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus Item
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Subtotal */}
      {orderItems.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Subtotal:</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
        </div>
      )}
    </div>
  )
}
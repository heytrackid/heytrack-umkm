'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Package } from 'lucide-react'
import type { OrderItem } from '@/app/orders/new/hooks/useOrderLogic'
import type { Recipe } from '@/types'



interface OrderItemsStepProps {
  orderItems: OrderItem[]
  availableRecipes: Recipe[]
  subtotal: number
  onAddItem: () => void
  onUpdateItem: (index: number, field: keyof OrderItem, value: string | number | boolean) => void
  onRemoveItem: (index: number) => void
}

const OrderItemsStep = ({
  orderItems,
  availableRecipes,
  subtotal,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}: OrderItemsStepProps) => (
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
        <p className="text-sm">Klik "Tambah Item" untuk memulai</p>
      </div>
    ) : (
      <div className="space-y-4">
        {orderItems.map((item, index) => {
          const itemKey = item.id || `${item.recipe_id}-${index}`

          return (
            <div key={itemKey} className="border rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                <div>
                  <Label className="text-xs">Produk</Label>
                  <Select
                    value={item.recipe_id}
                    onValueChange={(value) => onUpdateItem(index, 'recipe_id', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRecipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {recipe.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Jumlah</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const parsedQuantity = Number.parseInt(e.target.value, 10)
                      onUpdateItem(index, 'quantity', Number.isNaN(parsedQuantity) ? 0 : parsedQuantity)
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Harga Satuan</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => {
                      const parsedPrice = Number.parseFloat(e.target.value)
                      onUpdateItem(index, 'unit_price', Number.isNaN(parsedPrice) ? 0 : parsedPrice)
                    }}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Total</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-medium">
                    Rp {item.total_price.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-3">
                <Label className="text-xs">Permintaan Khusus</Label>
                <Input
                  value={item.special_requests || ''}
                  onChange={(e) => onUpdateItem(index, 'special_requests', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )
        })}

        <div className="border-t pt-4">
          <div className="text-right text-lg font-semibold">
            Subtotal: Rp {subtotal.toLocaleString()}
          </div>
        </div>
      </div>
    )}
  </div>
)

export default OrderItemsStep

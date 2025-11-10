'use client'

import { AlertCircle, Package, Plus, Trash2 } from 'lucide-react'

import type { OrderItemWithRecipe } from '@/app/orders/types/orders-db.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCurrency } from '@/hooks/useCurrency'

import type { Row } from '@/types/database'




/**
 * Items Section Component
 * Handles order items management
 */

interface ItemsSectionProps {
    orderItems: OrderItemWithRecipe[]
    availableRecipes: Array<Row<'recipes'>>
    fieldErrors: Record<string, string>
    subtotal: number
    onAddItem: () => void
    onUpdateItem: <K extends keyof OrderItemWithRecipe>(index: number, field: K, value: OrderItemWithRecipe[K] | string) => void
    onRemoveItem: (index: number) => void
    onClearError: (field: string) => void
}

export const ItemsSection = ({
    orderItems,
    availableRecipes,
    fieldErrors,
    subtotal,
    onAddItem,
    onUpdateItem,
    onRemoveItem,
    onClearError
}: ItemsSectionProps) => {
    const { formatCurrency } = useCurrency()

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Item Pesanan ({orderItems.length})</h3>
                    {fieldErrors['items'] && (
                        <div className="flex items-center gap-1 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <span>{fieldErrors['items']}</span>
                        </div>
                    )}
                </div>
                <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                        onAddItem()
                        if (fieldErrors['items']) { onClearError('items') }
                    }}
                    className="w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                </Button>
            </div>

            {orderItems.length === 0 ? (
                <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Belum Ada Item Pesanan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Tambahkan produk yang dipesan oleh pelanggan
                    </p>
                    <Button type="button" onClick={onAddItem} size="lg">
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Item Pertama
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {orderItems.map((item, index: number) => {
                        const itemKey = item['id'] ?? `${item.recipe_id ?? 'recipe'}-${item.product_name ?? 'product'}-${item.total_price ?? '0'}-${item.special_requests ?? 'none'}`
                        return (
                            <div key={itemKey} className="border rounded-lg overflow-hidden">
                                {/* Mobile View */}
                                <div className="block sm:hidden">
                                    <div className="p-3 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                                                <select
                                                    className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                                                    value={item.recipe_id}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateItem(index, 'recipe_id', e.target.value)}
                                                >
                                                    {availableRecipes.map(recipe => (
                                                        <option key={recipe['id']} value={recipe['id']}>
                                                            {recipe.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-muted-foreground hover:text-destructive ml-2 mt-4"
                                                onClick={() => onRemoveItem(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Jumlah</Label>
                                                <Input
                                                    type="number"
                                                    className="text-sm mt-1"
                                                    value={item.quantity}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'quantity', e.target.value)}
                                                    min="1"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                                                <Input
                                                    className="text-sm font-medium mt-1 bg-muted"
                                                    value={formatCurrency(item.total_price)}
                                                    readOnly
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Harga Satuan (Rp)</Label>
                                            <Input
                                                type="number"
                                                className="text-sm mt-1"
                                                value={item.unit_price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'unit_price', e.target.value)}
                                                min="0"
                                                step="500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop View */}
                                <div className="hidden sm:flex sm:items-center gap-3 p-4">
                                    <div className="flex-1 grid grid-cols-4 gap-3">
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Produk</Label>
                                            <select
                                                className="w-full p-2 text-sm border border-input rounded-md bg-background mt-1"
                                                value={item.recipe_id}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdateItem(index, 'recipe_id', e.target.value)}
                                            >
                                                {availableRecipes.map(recipe => (
                                                    <option key={recipe['id']} value={recipe['id']}>
                                                        {recipe.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Jumlah</Label>
                                            <Input
                                                type="number"
                                                className="text-sm mt-1"
                                                value={item.quantity}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'quantity', e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Harga Satuan (Rp)</Label>
                                            <Input
                                                type="number"
                                                className="text-sm mt-1"
                                                value={item.unit_price}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateItem(index, 'unit_price', e.target.value)}
                                                min="0"
                                                step="500"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-medium text-muted-foreground">Total</Label>
                                            <Input
                                                className="text-sm font-medium mt-1 bg-muted"
                                                value={formatCurrency(item.total_price)}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => onRemoveItem(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                    <div className="pt-3 border-t">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

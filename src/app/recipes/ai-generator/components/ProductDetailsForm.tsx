'use client'

import { Package } from '@/components/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface ProductDetailsFormProps {
  productName: string
  productType: string
  servings: number
  targetPrice: string
  specialInstructions: string
  isProductNameValid: boolean
  isServingsValid: boolean
  isTargetPriceValid: boolean
  disabled?: boolean
  onProductNameChange: (value: string) => void
  onProductTypeChange: (value: string) => void
  onServingsChange: (value: number) => void
  onTargetPriceChange: (value: string) => void
  onSpecialInstructionsChange: (value: string) => void
}

export function ProductDetailsForm({
  productName,
  productType,
  servings,
  targetPrice,
  specialInstructions,
  isProductNameValid,
  isServingsValid,
  isTargetPriceValid,
  disabled = false,
  onProductNameChange,
  onProductTypeChange,
  onServingsChange,
  onTargetPriceChange,
  onSpecialInstructionsChange
}: ProductDetailsFormProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Detail Produk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="productName" className="flex items-center gap-1">
            Nama Produk *
            {!isProductNameValid && productName && (
              <span className="text-xs text-red-500">min 3 karakter</span>
            )}
          </Label>
          <Input
            id="productName"
            placeholder="Contoh: Roti Tawar Premium, Brownies Coklat"
            value={productName}
            onChange={(e) => onProductNameChange(e.target.value)}
            disabled={disabled}
            className={!isProductNameValid && productName ? "border-red-500 focus:border-red-500" : ""}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="productType">Jenis Produk *</Label>
            <Select value={productType} onValueChange={onProductTypeChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-dish">🍽️ Makanan Utama</SelectItem>
                <SelectItem value="side-dish">🥗 Lauk Pendamping</SelectItem>
                <SelectItem value="snack">🍿 Camilan</SelectItem>
                <SelectItem value="beverage">🥤 Minuman</SelectItem>
                <SelectItem value="dessert">🍰 Dessert</SelectItem>
                <SelectItem value="culinary">🥘 Masakan Umum</SelectItem>
                <SelectItem value="other">🍲 Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servings" className="flex items-center gap-1">
              Jumlah Hasil *
              {!isServingsValid && servings === 0 && (
                <span className="text-xs text-red-500">harus &gt; 0</span>
              )}
            </Label>
            <Input
              id="servings"
              type="number"
              min="1"
              placeholder="12"
              value={servings}
              onChange={(e) => onServingsChange(parseInt(e.target.value) || 12)}
              disabled={disabled}
              className={!isServingsValid && servings === 0 ? "border-red-500 focus:border-red-500" : ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetPrice" className="flex items-center gap-1">
            Target Harga Jual (opsional)
            {targetPrice && !isTargetPriceValid && (
              <span className="text-xs text-red-500">harga harus positif</span>
            )}
          </Label>
          <div className="flex gap-2">
            <div className="px-3 py-2 bg-muted rounded-md text-sm flex items-center">Rp</div>
            <Input
              id="targetPrice"
              type="number"
              min="0"
              placeholder="25000"
              value={targetPrice}
              onChange={(e) => onTargetPriceChange(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialInstructions">Instruksi Khusus (opsional)</Label>
          <Textarea
            id="specialInstructions"
            placeholder="Contoh: Buat versi diet, tanpa gula, atau dengan bahan lokal..."
            value={specialInstructions}
            onChange={(e) => onSpecialInstructionsChange(e.target.value)}
            disabled={disabled}
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { AvailableIngredient } from './types'

interface LivePreviewProps {
  productName: string
  productType: string
  servings: number
  targetPrice: string
  selectedIngredients: string[]
  customIngredients: string[]
  availableIngredients: AvailableIngredient[]
  isFormValid: boolean
}

function getProductTypeLabel(type: string): string {
  switch (type) {
    case 'main-dish': return '🍽️ Makanan Utama'
    case 'side-dish': return '🥗 Lauk Pendamping'
    case 'snack': return '🍿 Camilan'
    case 'beverage': return '🥤 Minuman'
    case 'dessert': return '🍰 Dessert'
    case 'culinary': return '🥘 Masakan Umum'
    default: return '🍲 Lainnya'
  }
}

export function LivePreview({
  productName,
  productType,
  servings,
  targetPrice,
  selectedIngredients,
  customIngredients,
  availableIngredients,
  isFormValid
}: LivePreviewProps) {
  const hasContent = productName || selectedIngredients.length > 0 || customIngredients.length > 0
  
  if (!hasContent) return null

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
            👁️
          </div>
          Live Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Nama:</span>
            <p className="font-medium truncate">{productName || 'Belum diisi'}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Jenis:</span>
            <p className="font-medium">{getProductTypeLabel(productType)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Porsi:</span>
            <p className="font-medium">{servings} porsi</p>
          </div>
          <div>
            <span className="text-muted-foreground">Bahan:</span>
            <p className="font-medium">{selectedIngredients.length + customIngredients.length} bahan</p>
          </div>
        </div>

        {targetPrice && (
          <div className="pt-2 border-t">
            <span className="text-muted-foreground text-sm">Target Harga:</span>
            <p className="font-medium">Rp {parseInt(targetPrice).toLocaleString('id-ID')}</p>
          </div>
        )}

        {(selectedIngredients.length > 0 || customIngredients.length > 0) && (
          <div className="pt-2 border-t">
            <span className="text-muted-foreground text-sm">Bahan Utama:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedIngredients.slice(0, 3).map((ingId, idx) => {
                const ingredient = availableIngredients.find(i => i.id === ingId)
                if (!ingredient?.name) return null
                return (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {ingredient.name}
                  </Badge>
                )
              })}
              {customIngredients.slice(0, 3).map((ing, idx) => (
                <Badge key={`custom-${idx}`} variant="secondary" className="text-xs">
                  {ing}
                </Badge>
              ))}
              {(selectedIngredients.length + customIngredients.length) > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{(selectedIngredients.length + customIngredients.length) - 3} lainnya
                </Badge>
              )}
            </div>
          </div>
        )}

        {isFormValid && (
          <div className="pt-2 border-t">
            <Badge className="bg-green-500 text-white">
              ✅ Siap untuk generate resep!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

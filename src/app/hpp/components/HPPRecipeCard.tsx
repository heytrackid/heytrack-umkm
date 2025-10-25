'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface HPPRecipeCardProps {
  recipe: {
    id: string
    name: string
    category: string
    hpp: number
    selling_price?: number
    margin: number
    profit: number
    recipe_ingredients?: unknown[]
  }
  formatCurrency: (amount: number) => string
  getMarginBadgeVariant: (margin: number) => 'default' | 'secondary' | 'destructive'
  getMarginStatus: (margin: number) => string
  isMobile?: boolean
}

export default function HPPRecipeCard({
  recipe,
  formatCurrency,
  getMarginBadgeVariant,
  getMarginStatus,
  isMobile = false
}: HPPRecipeCardProps) {
  const ingredients = recipe.recipe_ingredients?.map((ri: any) => ri.ingredient?.name).filter(Boolean) || []
  const margin = recipe.margin || 0

  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{recipe.name}</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Bahan: {ingredients.length > 0 ? ingredients.join(', ') : 'Tidak ada data bahan'}
              </p>
              <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Kategori: {recipe.category}
              </p>
            </div>
            <Badge variant={getMarginBadgeVariant(margin) as "default" | "secondary" | "destructive" | "outline"}>
              {recipe.margin.toFixed(1)}% margin
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">HPP:</span>
                <span className="font-medium">{formatCurrency(Math.round(recipe.hpp))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Harga Jual:</span>
                <span className="font-medium">{formatCurrency(recipe.selling_price || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Keuntungan:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(Math.round(recipe.profit))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Status:</span>
                <Badge variant={getMarginBadgeVariant(recipe.margin) as "default" | "secondary" | "destructive" | "outline"} className="text-xs">
                  {getMarginStatus(recipe.margin)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Recipe Preview Card - Shows live preview as user types
// Helps users understand what they'll get before generating

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, Package, DollarSign, Clock } from 'lucide-react'
import type { AvailableIngredient } from './types'

interface RecipePreviewCardProps {
  productName: string
  productType: string
  servings: number
  targetPrice: string
  selectedIngredients: string[]
  availableIngredients: AvailableIngredient[]
}

const productTypeLabels: Record<string, string> = {
  bread: 'Roti',
  cake: 'Kue',
  pastry: 'Pastry',
  cookies: 'Cookies',
  donuts: 'Donat',
  other: 'Lainnya',
}

const estimatedIngredients: Record<string, string[]> = {
  bread: ['Tepung terigu', 'Ragi', 'Gula', 'Garam', 'Mentega', 'Susu'],
  cake: ['Tepung terigu', 'Telur', 'Gula', 'Mentega', 'Baking powder', 'Susu'],
  pastry: ['Tepung terigu', 'Mentega', 'Telur', 'Gula', 'Garam'],
  cookies: ['Tepung terigu', 'Mentega', 'Gula', 'Telur', 'Baking powder'],
  donuts: ['Tepung terigu', 'Ragi', 'Gula', 'Telur', 'Mentega', 'Susu'],
  other: ['Tepung terigu', 'Gula', 'Telur', 'Mentega'],
}

export default function RecipePreviewCard({
  productName,
  productType,
  servings,
  targetPrice,
  selectedIngredients,
  availableIngredients,
}: RecipePreviewCardProps) {
  const hasInput = productName || servings > 0
  const estimatedCost = targetPrice ? parseFloat(targetPrice) * 0.45 : null
  const ingredients = selectedIngredients.length > 0 
    ? selectedIngredients 
    : estimatedIngredients[productType] || []

  if (!hasInput) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground space-y-4">
            <div className="h-20 w-20 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center">
              <ChefHat className="h-10 w-10 text-purple-500" />
            </div>
            <div>
              <p className="font-medium text-lg">Contoh Hasil Resep AI</p>
              <p className="text-sm mt-2 max-w-md mx-auto">
                Setelah Anda mengisi form, AI akan menghasilkan:
              </p>
            </div>
            <div className="text-left max-w-md mx-auto space-y-3 mt-6">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Package className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Daftar Bahan Lengkap</p>
                  <p className="text-xs text-muted-foreground">Dengan takaran akurat dalam gram/ml</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Langkah-langkah Detail</p>
                  <p className="text-xs text-muted-foreground">Instruksi mudah diikuti pemula</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Estimasi Modal & HPP</p>
                  <p className="text-xs text-muted-foreground">Perhitungan biaya produksi otomatis</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
          <ChefHat className="h-5 w-5" />
          Preview Resep
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div>
          <h3 className="font-semibold text-lg">
            {productName || 'Nama Produk'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {productTypeLabels[productType]} • {servings} porsi
          </p>
        </div>

        {/* Estimated Ingredients */}
        <div>
          <p className="text-sm font-medium mb-2">Estimasi Bahan Utama:</p>
          <div className="flex flex-wrap gap-2">
            {ingredients.slice(0, 6).map((ing, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full border"
              >
                {ing}
              </span>
            ))}
            {ingredients.length > 6 && (
              <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded-full border">
                +{ingredients.length - 6} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Cost Estimate */}
        {estimatedCost && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">Estimasi Modal Produksi:</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              Rp {estimatedCost.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ~45% dari target harga jual
            </p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
          💡 <strong>Tips:</strong> Hasil akhir akan lebih detail dengan takaran pasti, 
          langkah-langkah lengkap, dan tips profesional dari AI.
        </div>
      </CardContent>
    </Card>
  )
}

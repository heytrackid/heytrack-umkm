'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, Package, DollarSign, Clock } from 'lucide-react'
import type { AvailableIngredient } from './types'

// Recipe Preview Card - Shows live preview as user types
// Helps users understand what they'll get before generating
// ✅ OPTIMIZED: Wrapped with React.memo to prevent unnecessary re-renders



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

// ✅ OPTIMIZED: Memoized component with custom comparison
const RecipePreviewCard = memo(({
  productName,
  productType,
  servings,
  targetPrice,
  selectedIngredients,
  availableIngredients,
}: RecipePreviewCardProps) => {
  const hasInput = productName || servings > 0
  const estimatedCost = targetPrice ? parseFloat(targetPrice) * 0.45 : null
  const ingredients = selectedIngredients.length > 0
    ? selectedIngredients
    : estimatedIngredients[productType] || []

  if (!hasInput) {
    return (
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-800">
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="h-24 w-24 mx-auto bg-muted rounded-2xl flex items-center justify-center">
                <ChefHat className="h-12 w-12 text-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-gray-500 to-gray-1000 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✨</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-xl mb-2">Apa yang Akan Anda Dapatkan?</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Setelah mengisi form, AI akan menghasilkan resep profesional lengkap:
              </p>
            </div>
            <div className="text-left max-w-md mx-auto space-y-3 mt-8">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-950/20 rounded-xl border border-gray-300 dark:border-gray-800">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Daftar Bahan Lengkap</p>
                  <p className="text-xs text-muted-foreground">Takaran akurat dalam gram/ml, disesuaikan dengan jumlah hasil</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-950/20 rounded-xl border border-gray-300 dark:border-gray-800">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Langkah-langkah Detail</p>
                  <p className="text-xs text-muted-foreground">Instruksi mudah diikuti, cocok untuk pemula maupun profesional</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-950/20 rounded-xl border border-gray-300 dark:border-gray-800">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Estimasi Modal & HPP</p>
                  <p className="text-xs text-muted-foreground">Perhitungan biaya produksi otomatis untuk pricing yang tepat</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Suppress unused warning - keeping for future use
  void availableIngredients

  return (
    <Card>
      <CardHeader className="bg-card">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-1000 flex items-center justify-center">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <span>Preview Resep</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Product Info */}
        <div className="p-4 bg-background rounded-xl border">
          <h3 className="font-bold text-xl mb-1">
            {productName || 'Nama Produk'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-900/30 rounded-full text-gray-700 dark:text-gray-300 font-medium">
              {productTypeLabels[productType]}
            </span>
            <span>•</span>
            <span className="font-medium">{servings} porsi</span>
          </div>
        </div>

        {/* Estimated Ingredients */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            Estimasi Bahan Utama:
          </p>
          <div className="flex flex-wrap gap-2">
            {ingredients.slice(0, 6).map((ing, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border-2 border-purple-100 dark:border-purple-900 font-medium"
              >
                {ing}
              </span>
            ))}
            {ingredients.length > 6 && (
              <span className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-medium">
                +{ingredients.length - 6} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Cost Estimate */}
        {estimatedCost && (
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-950/20 rounded-xl border-2 border-gray-300 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">Estimasi Modal Produksi:</p>
            </div>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              Rp {estimatedCost.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">
              ~45% dari target harga jual (margin sehat untuk UMKM)
            </p>
          </div>
        )}

        {/* Info */}
        <div className="text-xs bg-gradient-to-r from-gray-50 to-cyan-50 dark:from-gray-900/20 dark:to-cyan-950/20 p-4 rounded-xl border-2 border-gray-300 dark:border-gray-800">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Tips:</p>
              <p className="text-gray-800 dark:text-gray-200">
                Hasil akhir akan lebih detail dengan takaran pasti, langkah-langkah lengkap,
                tips profesional, dan estimasi waktu produksi dari AI.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}, (prevProps, nextProps) =>
// Custom comparison for better performance
(
  prevProps.productName === nextProps.productName &&
  prevProps.productType === nextProps.productType &&
  prevProps.servings === nextProps.servings &&
  prevProps.targetPrice === nextProps.targetPrice &&
  prevProps.selectedIngredients.length === nextProps.selectedIngredients.length &&
  prevProps.selectedIngredients.every((ing, idx) => ing === nextProps.selectedIngredients[idx])
)
)

RecipePreviewCard.displayName = 'RecipePreviewCard'

export default RecipePreviewCard

'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChefHat, Package, DollarSign, Clock, Users, Star, Flame } from 'lucide-react'
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
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="py-16">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="h-24 w-24 mx-auto bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/20">
                <ChefHat className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">✨</span>
              </div>
            </div>
            <div>
              <p className="font-semibold text-xl mb-2">Preview Resep AI</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Isi form di sebelah kiri untuk melihat preview resep yang akan dihasilkan AI
              </p>
            </div>
            <div className="text-left max-w-md mx-auto space-y-3 mt-8">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Daftar Bahan Lengkap</p>
                  <p className="text-xs text-muted-foreground">Takaran akurat dalam gram/ml, disesuaikan dengan jumlah hasil</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1">Langkah-langkah Detail</p>
                  <p className="text-xs text-muted-foreground">Instruksi mudah diikuti, cocok untuk pemula maupun profesional</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
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

  // Estimate preparation time based on product type
  const getEstimatedTime = (type: string): { prep: number; cook: number } => {
    const times: Record<string, { prep: number; cook: number }> = {
      bread: { prep: 15, cook: 45 },
      cake: { prep: 20, cook: 35 },
      pastry: { prep: 25, cook: 20 },
      cookies: { prep: 15, cook: 12 },
      donuts: { prep: 20, cook: 8 },
      other: { prep: 15, cook: 30 }
    }
    return times[type] || times.other
  }

  const estimatedTime = getEstimatedTime(productType)
  const totalTime = estimatedTime.prep + estimatedTime.cook

  // Estimate difficulty based on ingredients count
  const getDifficulty = (ingredientsCount: number): { level: string; color: string } => {
    if (ingredientsCount <= 3) {return { level: 'Mudah', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }}
    if (ingredientsCount <= 6) {return { level: 'Sedang', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }}
    return { level: 'Advanced', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
  }

  const difficulty = getDifficulty(ingredients.length)

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <ChefHat className="h-4 w-4 text-white" />
          </div>
          <span>Preview Resep AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Product Info */}
        <div className="p-4 bg-gradient-to-r from-background to-muted/30 rounded-xl border-2 border-primary/10">
          <h3 className="font-bold text-xl mb-2">
            {productName || 'Nama Produk'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Badge variant="secondary" className="text-xs">
              {productTypeLabels[productType]}
            </Badge>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {servings} porsi
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-background/50 rounded-lg">
              <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs font-medium">{totalTime}min</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg">
              <Package className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs font-medium">{ingredients.length}</div>
              <div className="text-xs text-muted-foreground">Bahan</div>
            </div>
            <div className="p-2 bg-background/50 rounded-lg">
              <Star className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
              <div className={`text-xs font-medium px-1 py-0.5 rounded ${difficulty.color}`}>
                {difficulty.level}
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Ingredients */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            Bahan Utama ({ingredients.length}):
          </p>
          <div className="space-y-2">
            {ingredients.slice(0, 8).map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                <span className="text-sm font-medium">{ing}</span>
              </div>
            ))}
            {ingredients.length > 8 && (
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  +{ingredients.length - 8} bahan lainnya
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Process Preview */}
        <div>
          <p className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            Proses Pembuatan:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
              <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <div className="text-sm font-medium">Persiapan Bahan</div>
                <div className="text-xs text-muted-foreground">{estimatedTime.prep} menit</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <div className="text-sm font-medium">Proses Pembakaran/Pengolahan</div>
                <div className="text-xs text-muted-foreground">{estimatedTime.cook} menit</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <div className="text-sm font-medium">Finishing & Packaging</div>
                <div className="text-xs text-muted-foreground">5-10 menit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Estimate */}
        {estimatedCost && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">Estimasi Bisnis:</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Modal per porsi</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">
                  Rp {(estimatedCost / servings).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Target jual</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  Rp {targetPrice}
                </p>
              </div>
            </div>
            <div className="text-center p-2 bg-primary/10 rounded-lg">
              <p className="text-xs font-medium text-primary">
                💰 Potensi profit: Rp {((parseFloat(targetPrice) - (estimatedCost / servings)) * servings).toLocaleString('id-ID')} per batch
              </p>
            </div>
          </div>
        )}

        {/* AI Features Preview */}
        <div className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <span className="text-lg">🤖</span>
            <div>
              <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Yang Akan Anda Dapatkan:</p>
              <div className="space-y-1 text-blue-800 dark:text-blue-200">
                <p>• ✅ Takaran bahan yang presisi & akurat</p>
                <p>• ✅ Langkah-langkah detail dengan tips profesional</p>
                <p>• ✅ Estimasi waktu produksi yang realistis</p>
                <p>• ✅ Perhitungan HPP otomatis & akurat</p>
                <p>• ✅ Saran penyimpanan & umur simpan produk</p>
              </div>
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

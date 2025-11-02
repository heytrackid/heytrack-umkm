import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { useCurrency } from '@/hooks/useCurrency'
import { uiLogger } from '@/lib/logger'
import { getErrorMessage } from '@/lib/type-guards'
import type { IngredientsTable, RecipeIngredientsTable, RecipesTable } from '@/types/database'
import type { SmartPricingAnalysis } from '@/types/features/analytics'
import { AlertTriangle, Calculator, CheckCircle, Lightbulb, Target, Zap } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type FC } from 'react'

'use client'


type Recipe = RecipesTable
type RecipeIngredient = RecipeIngredientsTable
type Ingredient = IngredientsTable

type PricingTierKey = 'economy' | 'standard' | 'premium'

interface RecipeWithIngredients extends Recipe {
  recipe_ingredients?: Array<RecipeIngredient & {
    ingredient?: Ingredient
  }>
}

export interface SmartPricingAssistantProps {
  recipe: RecipeWithIngredients
  onPriceUpdate: (price: number, margin: number) => void
}

const SmartPricingAssistant: FC<SmartPricingAssistantProps> = ({ recipe, onPriceUpdate }) => {

  const { formatCurrency } = useCurrency()
  const [analysis, setAnalysis] = useState<SmartPricingAnalysis | null>(null)
  const [selectedTier, setSelectedTier] = useState<PricingTierKey>('standard')
  const [customPrice, setCustomPrice] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  const analyzePricing = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/recipes/${recipe.id}/pricing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipe })
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const pricingAnalysis = await response.json() as SmartPricingAnalysis
      setAnalysis(pricingAnalysis)
      setCustomPrice(pricingAnalysis.pricing.standard.price || 0)
    } catch (error: unknown) {
      const message = getErrorMessage(error)
      uiLogger.error({ error: message }, 'Error analyzing pricing')

      if (recipe?.recipe_ingredients?.length) {
        const totalCost = recipe.recipe_ingredients.reduce((sum, ri) => {
          const ingredientPrice = ri.ingredient?.price_per_unit || 0
          return sum + (ingredientPrice * ri.quantity)
        }, 0)
        const ingredientCost = totalCost
        const overheadCost = ingredientCost * 0.15
        const totalCalculatedCost = ingredientCost + overheadCost
        const servings = recipe.servings || 1

        const fallbackAnalysis: SmartPricingAnalysis = {
          breakdown: {
            ingredientCost,
            overheadCost,
            totalCost: totalCalculatedCost,
            costPerServing: totalCalculatedCost / Math.max(1, servings)
          },
          pricing: {
            economy: {
              price: Math.ceil((totalCalculatedCost * 1.3) / 500) * 500,
              margin: 30,
              positioning: 'Harga terjangkau untuk volume tinggi'
            },
            standard: {
              price: Math.ceil((totalCalculatedCost * 1.6) / 500) * 500,
              margin: 60,
              positioning: 'Harga optimal untuk profit maksimal'
            },
            premium: {
              price: Math.ceil((totalCalculatedCost * 2.0) / 1000) * 1000,
              margin: 100,
              positioning: 'Harga premium untuk positioning eksklusif'
            }
          },
          recommendations: ['Gagal memuat analisis harga otomatis. Silakan coba lagi nanti.']
        }
        setAnalysis(fallbackAnalysis)
        setCustomPrice(fallbackAnalysis.pricing.standard.price)
      }
    } finally {
      setLoading(false)
    }
  }, [recipe])

  useEffect(() => {
    if (recipe?.recipe_ingredients?.length) {
      void analyzePricing()
    }
  }, [analyzePricing, recipe])

  const handleApplyPrice = (tier: PricingTierKey | 'custom') => {
    if (!analysis) { return }

    if (tier === 'custom') {
      if (customPrice <= 0) { return }
      const margin = ((customPrice - analysis.breakdown.totalCost) / customPrice) * 100
      onPriceUpdate(customPrice, margin)
      return
    }

    const { price: tierPrice, margin: tierMargin } = analysis.pricing[tier]
    onPriceUpdate(tierPrice, tierMargin)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="ml-3">Menganalisis harga optimal...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada data untuk analisis pricing</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Quick Overview with Status */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    AI Pricing Assistant
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Aktif
                    </Badge>
                  </div>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    Rekomendasi harga berbasis AI untuk profit maksimal
                  </p>
                </div>
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzePricing}
              disabled={loading}
            >
              {loading ? 'Menganalisis...' : '🔄 Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {formatCurrency(analysis.breakdown.totalCost)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Total HPP</div>
                  <Badge variant="outline" className="text-xs">
                    Modal Produksi
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(analysis.pricing.standard.price)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Harga Optimal</div>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Target className="h-3 w-3" />
                    Rekomendasi AI
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {analysis.pricing.standard.margin}%
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Margin Profit</div>
                  <Badge
                    variant={analysis.pricing.standard.margin >= 50 ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {analysis.pricing.standard.margin >= 50 ? 'Bagus' : 'Standar'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {formatCurrency(analysis.pricing.standard.price - analysis.breakdown.totalCost)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Profit per Unit</div>
                  <Badge variant="outline" className="text-xs">
                    Keuntungan Bersih
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">💡 Insight Cepat:</p>
                <p className="text-muted-foreground">
                  Dengan harga <strong>{formatCurrency(analysis.pricing.standard.price)}</strong>,
                  Anda akan mendapat keuntungan <strong>{formatCurrency(analysis.pricing.standard.price - analysis.breakdown.totalCost)}</strong> per produk.
                  Jual <strong>{Math.ceil(100000 / (analysis.pricing.standard.price - analysis.breakdown.totalCost))}</strong> unit untuk profit Rp 100.000.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <SwipeableTabs defaultValue="pricing" className="w-full">
        <SwipeableTabsList className="grid w-full grid-cols-3">
          <SwipeableTabsTrigger value="pricing">💰 Opsi Harga</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="breakdown">📊 Detail HPP</SwipeableTabsTrigger>
          <SwipeableTabsTrigger value="recommendations">💡 Rekomendasi</SwipeableTabsTrigger>
        </SwipeableTabsList>

        {/* Pricing Options Tab */}
        <SwipeableTabsContent value="pricing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.entries(analysis.pricing) as Array<[PricingTierKey, typeof analysis.pricing.economy]>).map(([tier, data]) => (
              <Card
                key={tier}
                className={`cursor-pointer transition-all hover: ${selectedTier === tier ? 'ring-2 ring-primary' : ''
                  }`}
                onClick={() => setSelectedTier(tier)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{tier}</span>
                    <Badge variant={tier === 'economy' ? 'secondary' : tier === 'premium' ? 'default' : 'outline'}>
                      {data.margin}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {formatCurrency(data.price)}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {data.positioning}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        {formatCurrency(data.price - analysis.breakdown.totalCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Break-even:</span>
                      <span className="font-medium">
                        {Math.ceil(1000 / (data.price - analysis.breakdown.totalCost))} unit
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      void handleApplyPrice(tier)
                    }}
                  >
                    Gunakan Harga Ini
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Harga Custom
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="custom-price">Harga Custom (Rp)</Label>
                  <Input
                    id="custom-price"
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}

                  />
                </div>
                <div className="text-sm space-y-1">
                  {customPrice > 0 && (
                    <>
                      <div>Margin: <span className="font-medium">
                        {((customPrice - analysis.breakdown.totalCost) / customPrice * 100).toFixed(1)}%
                      </span></div>
                      <div>Profit: <span className="font-medium text-gray-600 dark:text-gray-400">
                        {formatCurrency(customPrice - analysis.breakdown.totalCost)}
                      </span></div>
                    </>
                  )}
                </div>
                <Button onClick={() => handleApplyPrice('custom')}>
                  Apply
                </Button>
              </div>

              {customPrice > 0 && (
                <div className="mt-4">
                  {customPrice < analysis.breakdown.totalCost * 1.3 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Harga terlalu rendah! Margin di bawah 30% berisiko untuk keberlanjutan bisnis.
                      </AlertDescription>
                    </Alert>
                  )}
                  {customPrice > analysis.breakdown.totalCost * 2.5 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Harga mungkin terlalu tinggi dan tidak kompetitif di pasar.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </SwipeableTabsContent>

        {/* Cost Breakdown Tab */}
        <SwipeableTabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Biaya Produksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Biaya Bahan Baku</span>
                  <span className="font-medium">{formatCurrency(analysis.breakdown.ingredientCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Overhead (15%)</span>
                  <span className="font-medium">{formatCurrency(analysis.breakdown.overheadCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b font-bold text-lg">
                  <span>Total HPP</span>
                  <span>{formatCurrency(analysis.breakdown.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>HPP per Porsi</span>
                  <span className="font-medium">{formatCurrency(analysis.breakdown.costPerServing)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredient Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Breakdown Biaya Bahan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recipe.recipe_ingredients?.map((ri, index) => {
                  if (!ri.ingredient) { return null }
                  const cost = ri.ingredient.price_per_unit * ri.quantity
                  const percentage = (cost / analysis.breakdown.ingredientCost) * 100
                  return (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ri.ingredient.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {ri.quantity} {ri.unit} × {formatCurrency(ri.ingredient.price_per_unit)}
                        </div>
                      </div>
                      <span className="font-medium">{formatCurrency(cost)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </SwipeableTabsContent>

        {/* Enhanced Recommendations Tab */}
        <SwipeableTabsContent value="recommendations" className="space-y-4">
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div>Rekomendasi Pricing AI</div>
                  <p className="text-sm font-normal text-muted-foreground mt-0.5">
                    Saran berbasis analisis data dan tren pasar
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{rec}</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0" />
                  </div>
                ))}
              </div>

              {/* Action Items */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Langkah Selanjutnya:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Pilih tier pricing yang sesuai dengan target pasar Anda</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Test harga dengan sample kecil customer terlebih dahulu</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Monitor feedback dan sesuaikan jika diperlukan</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Review pricing setiap bulan atau saat ada perubahan biaya bahan</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Market Positioning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Positioning & Strategi Pasar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold">Keunggulan Pricing Anda</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-green-600">✓</span>
                      <span>Margin sehat {analysis.pricing.standard.margin}% untuk sustainability bisnis</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-green-600">✓</span>
                      <span>Harga kompetitif di segment pasar Anda</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-green-600">✓</span>
                      <span>Cover semua cost operasional + profit yang layak</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <span className="text-green-600">✓</span>
                      <span>Fleksibilitas untuk promo tanpa rugi</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Tips Optimasi Harga</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-600">💡</span>
                      <span>Monitor harga kompetitor secara berkala</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-600">💡</span>
                      <span>Test price sensitivity dengan A/B testing</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-600">💡</span>
                      <span>Fokus pada value proposition, bukan harga murah</span>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <span className="text-blue-600">💡</span>
                      <span>Pertimbangkan bundling untuk increase average order value</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitive Analysis */}
              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      ⚠️ Perhatian: Analisis Kompetitor
                    </p>
                    <p className="text-yellow-800 dark:text-yellow-200">
                      Harga ini adalah rekomendasi berdasarkan cost Anda. Pastikan untuk riset harga kompetitor di area Anda
                      dan sesuaikan dengan positioning brand yang diinginkan. Harga terlalu murah bisa merusak perceived value,
                      terlalu mahal bisa mengurangi volume penjualan.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SwipeableTabsContent>
      </SwipeableTabs>
    </div>
  )
}


export default SmartPricingAssistant

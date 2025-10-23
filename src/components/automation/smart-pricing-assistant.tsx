'use client'
import * as React from 'react'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  DollarSign,
  Target,
  Zap
} from 'lucide-react'
import { automationEngine } from '@/lib/automation-engine'
import { RecipeWithIngredients } from '@/types'

interface SmartPricingAssistantProps {
  recipe: RecipeWithIngredients
  onPriceUpdate: (price: number, margin: number) => void
}

export function SmartPricingAssistant({ recipe, onPriceUpdate }: SmartPricingAssistantProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [selectedTier, setSelectedTier] = useState<'economy' | 'standard' | 'premium'>('standard')
  const [customPrice, setCustomPrice] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (recipe && recipe.recipe_ingredients) {
      analyzePricing()
    }
  }, [recipe])

  const analyzePricing = async () => {
    setLoading(true)
    try {
      // Validate recipe data before processing
      if (!recipe?.recipe_ingredients || recipe.recipe_ingredients.length === 0) {
        console.warn('No ingredients found in recipe')
        return
      }
      
      // Simulate API call - in real app, this would call your pricing API
      const pricingAnalysis = automationEngine.calculateSmartPricing(recipe)
      
      if (pricingAnalysis && pricingAnalysis.pricing) {
        setAnalysis(pricingAnalysis)
        setCustomPrice(pricingAnalysis.pricing.standard.price)
      } else {
        console.error('Invalid pricing analysis result')
      }
    } catch (error: any) {
      console.error('Error analyzing pricing:', error)
      // Set fallback analysis to prevent UI breaks
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyPrice = (tier: 'economy' | 'standard' | 'premium' | 'custom') => {
    if (!analysis) return
    
    let price: number
    let margin: number
    
    if (tier === 'custom') {
      price = customPrice
      margin = ((price - analysis.breakdown.totalCost) / price) * 100
    } else {
      price = analysis.pricing[tier].price
      margin = analysis.pricing[tier].margin
    }
    
    onPriceUpdate(price, margin)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      {/* Quick Overview */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Smart Pricing Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Rp {analysis.breakdown.totalCost.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total HPP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Rp {analysis.pricing.standard.price.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Harga Optimal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {analysis.pricing.standard.margin}%
              </div>
              <div className="text-xs text-muted-foreground">Margin Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                Rp {(analysis.pricing.standard.price - analysis.breakdown.totalCost).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Profit per Unit</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pricing">💰 Opsi Harga</TabsTrigger>
          <TabsTrigger value="breakdown">📊 Detail HPP</TabsTrigger>
          <TabsTrigger value="recommendations">💡 Rekomendasi</TabsTrigger>
        </TabsList>

        {/* Pricing Options Tab */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(analysis.pricing).map(([tier, data]: [string, any]) => (
              <Card 
                key={tier}
                className={`cursor-pointer transition-all hover: ${
                  selectedTier === tier ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedTier(tier as any)}
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
                    Rp {data.price.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {data.positioning}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className="font-medium text-gray-600 dark:text-gray-400">
                        Rp {(data.price - analysis.breakdown.totalCost).toLocaleString()}
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
                      handleApplyPrice(tier as any)
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
                        Rp {(customPrice - analysis.breakdown.totalCost).toLocaleString()}
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
        </TabsContent>

        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detail Biaya Produksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Biaya Bahan Baku</span>
                  <span className="font-medium">Rp {analysis.breakdown.ingredientCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span>Overhead (15%)</span>
                  <span className="font-medium">Rp {analysis.breakdown.overheadCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b font-bold text-lg">
                  <span>Total HPP</span>
                  <span>Rp {analysis.breakdown.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>HPP per Porsi</span>
                  <span className="font-medium">Rp {analysis.breakdown.costPerServing.toLocaleString()}</span>
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
                {recipe.recipe_ingredients?.map((ri, _index) => {
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
                          {ri.quantity} {ri.unit} × Rp {ri.ingredient.price_per_unit.toLocaleString()}
                        </div>
                      </div>
                      <span className="font-medium">Rp {cost.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                Rekomendasi Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((rec: string, index: number) => (
                  <Alert key={index}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Positioning */}
          <Card>
            <CardHeader>
              <CardTitle>Positioning Pasar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 text-gray-600 dark:text-gray-400">✅ Keunggulan Pricing</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Margin sehat untuk sustainability</li>
                    <li>• Harga kompetitif di segment</li>
                    <li>• Cover semua cost + profit</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-600 dark:text-gray-400">💡 Tips Optimasi</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Monitor competitor pricing</li>
                    <li>• Test price sensitivity</li>
                    <li>• Focus pada value proposition</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
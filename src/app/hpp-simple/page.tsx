'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Package, 
  DollarSign, 
  Save, 
  Info,
  CheckCircle,
  AlertTriangle,
  Wand2,
  TrendingUp
} from 'lucide-react'
import AppLayout from '@/components/layout/app-layout'
import { SmartPricingInsights } from '@/components/smart-pricing-insights'
import { 
  calculateSmartPricing, 
  analyzeInventoryItem, 
  generateBusinessInsights,
  type SmartIngredient,
  type PricingAnalysis
} from '@/lib/smart-business'
import { useToast } from '@/hooks/use-toast'

interface SimpleIngredient extends Omit<SmartIngredient, 'pricePerUnit' | 'volatility' | 'alternatives' | 'nutritionScore'> {
  price: number
  // Smart features made optional for simplicity
  volatility?: 'low' | 'medium' | 'high'
  alternatives?: string[]
  seasonalPricing?: boolean
}

interface SimpleRecipe {
  name: string
  portions: number
  ingredients: SimpleIngredient[]
  // Smart pricing analysis
  pricingAnalysis?: PricingAnalysis
  // Legacy fields for compatibility
  totalCost: number
  costPerPortion: number
  suggestedPrice: number
  suggestedMargin: number
  sellingPrice: number
  actualMargin: number
  profit: number
}

const UNITS = ['gram', 'kg', 'ml', 'liter', 'butir', 'lembar', 'bungkus']
const OVERHEAD_PERCENTAGE = 15
const LABOR_PERCENTAGE = 20
const RECOMMENDED_MARGIN = 50
const MIN_MARGIN = 30

// Smart ingredient database with volatility and alternatives
const SMART_INGREDIENTS_DB: Record<string, Partial<SmartIngredient>> = {
  'tepung terigu': {
    volatility: 'medium',
    alternatives: ['tepung tapioka', 'tepung beras'],
    seasonalPricing: false,
    nutritionScore: 7
  },
  'mentega': {
    volatility: 'high',
    alternatives: ['margarin', 'minyak kelapa'],
    seasonalPricing: true,
    nutritionScore: 6
  },
  'telur': {
    volatility: 'high',
    alternatives: ['telur bebek', 'egg substitute'],
    seasonalPricing: true,
    nutritionScore: 9
  },
  'gula': {
    volatility: 'medium',
    alternatives: ['gula aren', 'madu', 'stevia'],
    seasonalPricing: false,
    nutritionScore: 3
  },
  'susu': {
    volatility: 'medium',
    alternatives: ['susu kental manis', 'santan'],
    seasonalPricing: false,
    nutritionScore: 8
  }
}

export default function HPPSimplePage() {
  const { toast } = useToast()
  
  const [recipe, setRecipe] = useState<SimpleRecipe>({
    name: '',
    portions: 1,
    ingredients: [],
    totalCost: 0,
    costPerPortion: 0,
    suggestedPrice: 0,
    suggestedMargin: 0,
    sellingPrice: 0,
    actualMargin: 0,
    profit: 0,
    pricingAnalysis: undefined
  })
  
  // Smart insights state
  const [smartInsights, setSmartInsights] = useState<any[]>([])
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null)

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'gram',
    price: ''
  })

  // Smart calculation with business intelligence
  useEffect(() => {
    calculateSmartPricingAnalysis()
  }, [recipe.ingredients, recipe.portions, recipe.sellingPrice])

  const calculateSmartPricingAnalysis = () => {
    if (recipe.ingredients.length === 0) {
      setSmartInsights([])
      setMarketAnalysis(null)
      return
    }

    // Convert to smart ingredients format
    const smartIngredients: SmartIngredient[] = recipe.ingredients.map(ing => ({
      ...ing,
      pricePerUnit: ing.price,
      // Auto-detect smart properties from database
      ...SMART_INGREDIENTS_DB[ing.name.toLowerCase()],
      volatility: SMART_INGREDIENTS_DB[ing.name.toLowerCase()]?.volatility || 'medium',
      alternatives: SMART_INGREDIENTS_DB[ing.name.toLowerCase()]?.alternatives || [],
      nutritionScore: SMART_INGREDIENTS_DB[ing.name.toLowerCase()]?.nutritionScore || 5
    }))

    // Get smart pricing analysis
    const analysis = calculateSmartPricing(
      smartIngredients,
      recipe.portions,
      {
        // Mock market data - in real app this would come from API
        averagePrice: recipe.costPerPortion * 1.5,
        competitorPrices: [15000, 18000, 20000, 22000],
        demandLevel: 0.8
      }
    )

    // Generate smart insights from the analysis recommendations
    const insights = analysis.recommendations.map((rec, index) => ({
      type: rec.includes('⚠️') ? 'warning' : rec.includes('💡') ? 'opportunity' : 'info',
      title: rec.includes('Margin') ? 'Analisis Margin' : rec.includes('fluktuasi') ? 'Volatilitas Harga' : 'Rekomendasi',
      message: rec,
      impact: rec.includes('menguntungkan') ? 'Tinggi' : rec.includes('rendah') ? 'Sedang' : undefined,
      action: rec.includes('alternatif') ? 'Coba bahan alternatif untuk menghemat biaya' : undefined
    }))
    setSmartInsights(insights)
    
    // Generate market analysis from competitive analysis
    const market = {
      competitorRange: { min: 15000, max: 22000 },
      marketPosition: analysis.competitiveAnalysis.position === 'cheap' ? 'below' : 
                     analysis.competitiveAnalysis.position === 'premium' ? 'above' : 'within',
      recommendedAdjustment: analysis.competitivePrice - analysis.recommendedPrice
    }
    setMarketAnalysis(market)

    // Update recipe with smart analysis
    setRecipe(prev => ({
      ...prev,
      pricingAnalysis: analysis,
      // Update legacy fields for compatibility
      totalCost: analysis.costPerPortion * recipe.portions,
      costPerPortion: analysis.costPerPortion,
      suggestedPrice: analysis.recommendedPrice,
      suggestedMargin: analysis.profitMargin,
      actualMargin: recipe.sellingPrice > 0 
        ? ((recipe.sellingPrice - analysis.costPerPortion) / analysis.costPerPortion * 100)
        : 0,
      profit: recipe.sellingPrice - analysis.costPerPortion
    }))
  }

  const addIngredient = () => {
    if (!newIngredient.name || !newIngredient.quantity || !newIngredient.price) {
      toast({ title: 'Lengkapi semua field bahan', variant: 'destructive' })
      return
    }

    const quantity = parseFloat(newIngredient.quantity)
    const price = parseFloat(newIngredient.price)
    
    if (quantity <= 0 || price <= 0) {
      toast({ title: 'Jumlah dan harga harus lebih dari 0', variant: 'destructive' })
      return
    }

    // Auto-detect smart properties from database
    const smartProps = SMART_INGREDIENTS_DB[newIngredient.name.toLowerCase()] || {}
    
    const ingredient: SimpleIngredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      quantity,
      unit: newIngredient.unit,
      price,
      total: quantity * price,
      // Smart features
      volatility: smartProps.volatility || 'medium',
      alternatives: smartProps.alternatives || [],
      seasonalPricing: smartProps.seasonalPricing || false
    }

    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }))

    setNewIngredient({ name: '', quantity: '', unit: 'gram', price: '' })
    
    // Show smart notification
    const warningMsg = smartProps.volatility === 'high' 
      ? ` (⚠️ Harga sering berubah)` 
      : smartProps.alternatives?.length 
        ? ` (💡 Ada ${smartProps.alternatives.length} alternatif)`
        : ''
    
    toast({ 
      title: 'Bahan ditambahkan!', 
      description: `${ingredient.name} - Rp ${ingredient.total.toLocaleString()}${warningMsg}` 
    })
  }

  const removeIngredient = (id: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }))
  }

  const updateIngredient = (id: string, field: keyof SimpleIngredient, value: any) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => {
        if (ing.id === id) {
          const updated = { ...ing, [field]: value }
          // Otomatis hitung ulang total jika quantity atau price berubah
          if (field === 'quantity' || field === 'price') {
            updated.total = (updated.quantity || 0) * (updated.price || 0)
          }
          return updated
        }
        return ing
      })
    }))
  }

  const useRecommendedPrice = () => {
    const price = recipe.pricingAnalysis?.recommendedPrice || recipe.suggestedPrice
    setRecipe(prev => ({ ...prev, sellingPrice: price }))
    toast({ 
      title: '🧠 Harga cerdas diterapkan!', 
      description: `Rp ${price.toLocaleString()} (margin ${recipe.pricingAnalysis?.profitMargin.toFixed(1)}%)` 
    })
  }

  const useCompetitivePrice = () => {
    if (!recipe.pricingAnalysis) return
    setRecipe(prev => ({ ...prev, sellingPrice: recipe.pricingAnalysis!.competitivePrice }))
    toast({ 
      title: '🎯 Harga kompetitif diterapkan!', 
      description: recipe.pricingAnalysis.competitiveAnalysis.message
    })
  }

  const saveRecipe = () => {
    if (!recipe.name) {
      toast({ title: 'Nama resep wajib diisi', variant: 'destructive' })
      return
    }

    if (recipe.ingredients.length === 0) {
      toast({ title: 'Tambahkan minimal 1 bahan', variant: 'destructive' })
      return
    }

    // Simulasi save
    toast({ title: 'Resep disimpan!', description: `${recipe.name} berhasil disimpan` })
  }

  const getMarginStatus = (margin: number) => {
    if (margin >= 60) return { color: 'text-gray-700 dark:text-gray-300', status: 'Excellent', icon: CheckCircle }
    if (margin >= 45) return { color: 'text-gray-600 dark:text-gray-400', status: 'Good', icon: CheckCircle }
    if (margin >= 30) return { color: 'text-gray-500 dark:text-gray-500', status: 'Fair', icon: Info }
    if (margin >= 20) return { color: 'text-gray-400 dark:text-gray-600', status: 'Low', icon: AlertTriangle }
    return { color: 'text-gray-300 dark:text-gray-700', status: 'Too Low', icon: AlertTriangle }
  }

  const marginStatus = getMarginStatus(recipe.actualMargin || recipe.suggestedMargin)
  const StatusIcon = marginStatus.icon

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8" />
            Kalkulator HPP Otomatis
          </h1>
          <p className="text-muted-foreground mt-2">
            Hitung harga pokok produksi dengan mudah dan otomatis
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Wand2 className="h-4 w-4" />
              <span>Overhead otomatis +{OVERHEAD_PERCENTAGE}%</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>Margin rekomendasi {RECOMMENDED_MARGIN}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Info Resep
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipeName">Nama Resep</Label>
                  <Input
                    id="recipeName"
                    placeholder="Contoh: Roti Tawar Premium"
                    value={recipe.name}
                    onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="portions">Jumlah Porsi</Label>
                  <Input
                    id="portions"
                    type="number"
                    min="1"
                    value={recipe.portions}
                    onChange={(e) => setRecipe(prev => ({ ...prev, portions: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Bahan Baku
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add ingredient form */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <Input
                      placeholder="Nama bahan"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Jumlah"
                      value={newIngredient.quantity}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                    >
                      {UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Harga"
                      value={newIngredient.price}
                      onChange={(e) => setNewIngredient(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button onClick={addIngredient} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <div className="flex-1 grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-4 font-medium">{ingredient.name}</div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(ingredient.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2 flex items-center text-muted-foreground">
                          {ingredient.unit}
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            value={ingredient.price}
                            onChange={(e) => updateIngredient(ingredient.id, 'price', parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex items-center font-medium text-gray-600 dark:text-gray-400">
                          Rp {ingredient.total.toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-gray-600 dark:text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {recipe.ingredients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada bahan</p>
                    <p className="text-sm">Tambahkan bahan untuk mulai hitung HPP</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Penetapan Harga
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Rekomendasi</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`Rp ${recipe.suggestedPrice.toLocaleString()}`}
                        readOnly
                        className="bg-muted"
                      />
                      <Button onClick={useRecommendedPrice} size="sm">
                        <Wand2 className="h-4 w-4 mr-1" />
                        Pakai
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Margin {recipe.suggestedMargin.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="sellingPrice">Harga Jual Anda</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="0"
                      value={recipe.sellingPrice || ''}
                      onChange={(e) => setRecipe(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                    />
                    {recipe.sellingPrice > 0 && (
                      <p className={`text-xs mt-1 ${marginStatus.color}`}>
                        Margin {recipe.actualMargin.toFixed(1)}% - {marginStatus.status}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            {/* HPP Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Ringkasan HPP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Biaya Bahan:</span>
                    <span className="font-medium">
                      Rp {recipe.ingredients.reduce((sum, ing) => sum + ing.total, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Overhead ({OVERHEAD_PERCENTAGE}%):</span>
                    <span>
                      Rp {(recipe.ingredients.reduce((sum, ing) => sum + ing.total, 0) * OVERHEAD_PERCENTAGE / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tenaga Kerja ({LABOR_PERCENTAGE}%):</span>
                    <span>
                      Rp {(recipe.ingredients.reduce((sum, ing) => sum + ing.total, 0) * LABOR_PERCENTAGE / 100).toLocaleString()}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Total HPP:</span>
                    <span>Rp {recipe.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg text-gray-600 dark:text-gray-400">
                    <span>HPP per Porsi:</span>
                    <span>Rp {recipe.costPerPortion.toLocaleString()}</span>
                  </div>
                </div>

                {recipe.sellingPrice > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Harga Jual:</span>
                      <span className="font-medium">Rp {recipe.sellingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-gray-600 dark:text-gray-400">
                      <span>Keuntungan:</span>
                      <span>Rp {recipe.profit.toLocaleString()}</span>
                    </div>
                    <div className={`flex justify-between items-center font-medium ${marginStatus.color}`}>
                      <span>Status Margin:</span>
                      <div className="flex items-center gap-1">
                        <StatusIcon className="h-4 w-4" />
                        <span>{marginStatus.status}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Smart Pricing Insights */}
            {recipe.ingredients.length > 0 && (
              <SmartPricingInsights
                ingredients={recipe.ingredients}
                currentPrice={recipe.sellingPrice}
                suggestedPrice={recipe.suggestedPrice}
                totalCost={recipe.totalCost}
                margin={recipe.actualMargin || recipe.suggestedMargin}
                insights={smartInsights}
                marketAnalysis={marketAnalysis}
              />
            )}

            {/* Quick Tips - Only show if no smart insights */}
            {!smartInsights.length && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">💡 Tips Cerdas</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Margin Sehat:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Untuk UMKM bakery, margin {MIN_MARGIN}-{RECOMMENDED_MARGIN}% sudah bagus
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-700 dark:text-gray-300">Overhead Otomatis:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Sudah termasuk listrik, gas, dan biaya operasional lainnya
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <Button onClick={saveRecipe} className="w-full" size="lg">
              <Save className="h-4 w-4 mr-2" />
              Simpan Resep
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
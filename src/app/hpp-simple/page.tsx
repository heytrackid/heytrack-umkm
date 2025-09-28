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
  TrendingUp,
  ChefHat
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
import DateFilter from '@/components/ui/date-filter'

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
  portionUnit: string // NEW: unit untuk porsi (pcs, loaf, dozen, kg, etc)
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
const PORTION_UNITS = ['pcs', 'buah', 'loaf', 'dozen', 'lusin', 'kg', 'ons', 'bungkus', 'porsi', 'slice']
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
    portionUnit: 'pcs', // Default to pieces
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
  
  // Recipe import and filter states
  const [savedRecipes, setSavedRecipes] = useState<SimpleRecipe[]>([])
  const [showRecipeList, setShowRecipeList] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'gram',
    price: ''
  })

  // Load saved recipes on component mount
  useEffect(() => {
    loadSavedRecipes()
  }, [])
  
  // Smart calculation with business intelligence
  useEffect(() => {
    calculateSmartPricingAnalysis()
  }, [recipe.ingredients, recipe.portions, recipe.sellingPrice])
  
  const loadSavedRecipes = () => {
    // Mock data - in real app, this would fetch from API or localStorage
    const mockSavedRecipes: SimpleRecipe[] = [
      {
        name: 'Roti Tawar Premium',
        portions: 2,
        portionUnit: 'loaf',
        ingredients: [
          { id: '1', name: 'Tepung Terigu', quantity: 500, unit: 'gram', price: 15, total: 7500 },
          { id: '2', name: 'Telur', quantity: 120, unit: 'gram', price: 28, total: 3360 },
          { id: '3', name: 'Margarin', quantity: 100, unit: 'gram', price: 25, total: 2500 },
          { id: '4', name: 'Gula', quantity: 80, unit: 'gram', price: 14, total: 1120 },
        ],
        totalCost: 14480,
        costPerPortion: 7240,
        suggestedPrice: 10500,
        suggestedMargin: 45,
        sellingPrice: 0,
        actualMargin: 0,
        profit: 0
      },
      {
        name: 'Cupcake Coklat',
        portions: 24,
        portionUnit: 'pcs',
        ingredients: [
          { id: '1', name: 'Tepung Terigu', quantity: 200, unit: 'gram', price: 15, total: 3000 },
          { id: '2', name: 'Coklat Bubuk', quantity: 50, unit: 'gram', price: 80, total: 4000 },
          { id: '3', name: 'Telur', quantity: 100, unit: 'gram', price: 28, total: 2800 },
        ],
        totalCost: 9800,
        costPerPortion: 408,
        suggestedPrice: 750,
        suggestedMargin: 84,
        sellingPrice: 0,
        actualMargin: 0,
        profit: 0
      }
    ]
    setSavedRecipes(mockSavedRecipes)
  }
  
  const importRecipe = (savedRecipe: SimpleRecipe) => {
    setRecipe(savedRecipe)
    setShowRecipeList(false)
    toast({ 
      title: 'Resep berhasil diimport!', 
      description: `${savedRecipe.name} siap untuk perhitungan HPP` 
    })
  }

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
        <div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              <Calculator className="h-8 w-8" />
              Kalkulator HPP Otomatis
            </h1>
            <p className="text-muted-foreground mt-2">
              Hitung HPP per pcs, per dozen, per kg, atau unit apapun dengan mudah
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
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRecipeList(!showRecipeList)}
                className="flex items-center gap-2"
              >
                <ChefHat className="h-4 w-4" />
                Import Resep ({savedRecipes.length})
              </Button>
            </div>
            
            <DateFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onQuickFilter={(days) => {
                // Could be used to filter saved recipes by date
                console.log(`Filter last ${days} days`)
              }}
              className="flex-shrink-0"
            />
          </div>
          
          {/* Recipe Import List */}
          {showRecipeList && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Pilih Resep untuk Dihitung HPP
              </h3>
              <div className="grid gap-2">
                {savedRecipes.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    Belum ada resep tersimpan. Buat resep di menu "Resep Produk" terlebih dahulu.
                  </p>
                ) : (
                  savedRecipes.map((savedRecipe, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{savedRecipe.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {savedRecipe.portions} {savedRecipe.portionUnit} • {savedRecipe.ingredients.length} bahan • HPP: Rp {savedRecipe.costPerPortion.toLocaleString()}/{savedRecipe.portionUnit}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => importRecipe(savedRecipe)}
                        className="ml-3"
                      >
                        Import
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="portions">Jumlah</Label>
                    <Input
                      id="portions"
                      type="number"
                      min="1"
                      value={recipe.portions}
                      onChange={(e) => setRecipe(prev => ({ ...prev, portions: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="portionUnit">Satuan</Label>
                    <select
                      id="portionUnit"
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={recipe.portionUnit}
                      onChange={(e) => setRecipe(prev => ({ ...prev, portionUnit: e.target.value }))}
                    >
                      {PORTION_UNITS.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
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
                    <span>HPP per {recipe.portionUnit}:</span>
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

            {/* Unit Conversion Calculator */}
            {recipe.costPerPortion > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Calculator className="h-4 w-4" />
                    💡 Konversi HPP ke Unit Lain
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-muted-foreground mb-3">
                    HPP dasar: Rp {recipe.costPerPortion.toLocaleString()} per {recipe.portionUnit}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {recipe.portionUnit !== 'pcs' && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-medium">Per Pcs</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {recipe.portionUnit === 'dozen' || recipe.portionUnit === 'lusin' 
                            ? `Rp ${Math.round(recipe.costPerPortion / 12).toLocaleString()}` 
                            : recipe.portionUnit === 'kg' 
                              ? `Rp ${Math.round(recipe.costPerPortion / 40).toLocaleString()} (≈40 pcs/kg)`
                              : `Rp ${recipe.costPerPortion.toLocaleString()} (1:1)`}
                        </div>
                      </div>
                    )}
                    
                    {recipe.portionUnit !== 'dozen' && recipe.portionUnit !== 'lusin' && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-medium">Per Dozen</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {recipe.portionUnit === 'pcs' 
                            ? `Rp ${Math.round(recipe.costPerPortion * 12).toLocaleString()}` 
                            : recipe.portionUnit === 'kg' 
                              ? `Rp ${Math.round(recipe.costPerPortion * 12 / 40).toLocaleString()} (≈12 pcs)`
                              : `Rp ${Math.round(recipe.costPerPortion * 12).toLocaleString()}`}
                        </div>
                      </div>
                    )}
                    
                    {recipe.portionUnit !== 'kg' && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-medium">Per Kg</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {recipe.portionUnit === 'pcs' 
                            ? `Rp ${Math.round(recipe.costPerPortion * 40).toLocaleString()} (≈40 pcs/kg)`
                            : recipe.portionUnit === 'ons' 
                              ? `Rp ${Math.round(recipe.costPerPortion * 10).toLocaleString()}`
                              : `Rp ${Math.round(recipe.costPerPortion * 1000).toLocaleString()}`}
                        </div>
                      </div>
                    )}
                    
                    {recipe.portionUnit !== 'ons' && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <div className="font-medium">Per Ons</div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {recipe.portionUnit === 'kg' 
                            ? `Rp ${Math.round(recipe.costPerPortion / 10).toLocaleString()}`
                            : recipe.portionUnit === 'pcs' 
                              ? `Rp ${Math.round(recipe.costPerPortion * 4).toLocaleString()} (≈4 pcs/ons)`
                              : `Rp ${Math.round(recipe.costPerPortion / 100).toLocaleString()}`}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                    💡 Tips: Konversi ini perkiraan. Sesuaikan dengan ukuran produk Anda.
                  </div>
                </CardContent>
              </Card>
            )}

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
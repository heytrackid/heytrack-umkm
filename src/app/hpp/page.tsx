'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { SmartPricingAssistant } from '@/components/automation/smart-pricing-assistant'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Calculator, 
  Plus, 
  Trash2, 
  TrendingUp, 
  DollarSign,
  Package,
  Percent,
  Info,
  AlertCircle,
  CheckCircle,
  Save,
  RotateCcw
} from 'lucide-react'

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalCost: number
}

interface OverheadCost {
  id: string
  name: string
  type: 'fixed' | 'variable'
  amount: number
  percentage: number
}

interface HPPCalculation {
  recipeName: string
  servings: number
  ingredients: Ingredient[]
  overheadCosts: OverheadCost[]
  totalMaterialCost: number
  totalOverheadCost: number
  totalCost: number
  costPerServing: number
  sellingPrice: number
  margin: number
  profit: number
  profitPerServing: number
}

export default function HPPCalculatorPage() {
  const { toast } = useToast()
  
  const [calculation, setCalculation] = useState<HPPCalculation>({
    recipeName: '',
    servings: 1,
    ingredients: [],
    overheadCosts: [
      { id: '1', name: 'Biaya Listrik', type: 'fixed', amount: 50000, percentage: 5 },
      { id: '2', name: 'Biaya Gas', type: 'variable', amount: 30000, percentage: 3 },
      { id: '3', name: 'Biaya Tenaga Kerja', type: 'fixed', amount: 100000, percentage: 10 },
      { id: '4', name: 'Biaya Kemasan', type: 'variable', amount: 25000, percentage: 2.5 }
    ],
    totalMaterialCost: 0,
    totalOverheadCost: 0,
    totalCost: 0,
    costPerServing: 0,
    sellingPrice: 0,
    margin: 0,
    profit: 0,
    profitPerServing: 0
  })

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'g',
    pricePerUnit: ''
  })

  const [isEditingOverhead, setIsEditingOverhead] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [savedCalculations, setSavedCalculations] = useState([
    {
      id: '1',
      recipeName: 'Roti Tawar Premium',
      servings: 12,
      costPerServing: 708,
      sellingPrice: 15000,
      margin: 76.5,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      recipeName: 'Croissant Butter',
      servings: 8,
      costPerServing: 1500,
      sellingPrice: 25000,
      margin: 108.3,
      createdAt: '2024-01-14'
    }
  ])

  // Calculate totals with error handling
  const calculateTotals = () => {
    try {
      const materialCost = calculation.ingredients.reduce((sum, ing) => {
        const cost = ing.totalCost || 0
        return sum + (isFinite(cost) ? cost : 0)
      }, 0)
      
      const overheadCost = calculation.overheadCosts.reduce((sum, cost) => {
        if (cost.type === 'fixed') {
          const amount = cost.amount || 0
          return sum + (isFinite(amount) ? amount : 0)
        } else {
          const percentage = cost.percentage || 0
          const calculatedCost = materialCost * (percentage / 100)
          return sum + (isFinite(calculatedCost) ? calculatedCost : 0)
        }
      }, 0)
      
      const totalCost = materialCost + overheadCost
      const servings = Math.max(1, calculation.servings || 1) // Prevent division by zero
      const costPerServing = totalCost / servings
      const sellingPrice = calculation.sellingPrice || 0
      const profit = sellingPrice - costPerServing
      const margin = costPerServing > 0 ? (profit / costPerServing) * 100 : 0
      const profitPerServing = profit

      // Ensure all values are finite
      return {
        materialCost: isFinite(materialCost) ? materialCost : 0,
        overheadCost: isFinite(overheadCost) ? overheadCost : 0,
        totalCost: isFinite(totalCost) ? totalCost : 0,
        costPerServing: isFinite(costPerServing) ? costPerServing : 0,
        profit: isFinite(profit) ? profit : 0,
        margin: isFinite(margin) ? margin : 0,
        profitPerServing: isFinite(profitPerServing) ? profitPerServing : 0
      }
    } catch (error) {
      console.error('Error calculating totals:', error)
      return {
        materialCost: 0,
        overheadCost: 0,
        totalCost: 0,
        costPerServing: 0,
        profit: 0,
        margin: 0,
        profitPerServing: 0
      }
    }
  }

  const totals = calculateTotals()
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault()
            saveCalculation()
            break
          case 'r':
            event.preventDefault()
            resetCalculation()
            break
        }
      }
      // Enter key to add ingredient when in ingredient form
      if (event.key === 'Enter' && document.activeElement?.tagName === 'INPUT') {
        const target = event.target as HTMLElement
        if (target.closest('.ingredient-form')) {
          event.preventDefault()
          addIngredient()
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [calculation.recipeName, isSaving])

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.quantity && newIngredient.pricePerUnit) {
      const quantity = parseFloat(newIngredient.quantity)
      const pricePerUnit = parseFloat(newIngredient.pricePerUnit)
      
      // Validation
      if (isNaN(quantity) || quantity <= 0) {
        toast({ title: 'Input tidak valid', description: 'Jumlah harus berupa angka positif', variant: 'destructive' })
        return
      }
      if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
        toast({ title: 'Input tidak valid', description: 'Harga per unit harus berupa angka positif', variant: 'destructive' })
        return
      }
      
      const totalCost = quantity * pricePerUnit

      const ingredient: Ingredient = {
        id: Date.now().toString(),
        name: newIngredient.name,
        quantity,
        unit: newIngredient.unit,
        pricePerUnit,
        totalCost
      }

      setCalculation(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, ingredient]
      }))

      setNewIngredient({ name: '', quantity: '', unit: 'g', pricePerUnit: '' })
      toast({ title: 'Bahan ditambahkan', description: `${newIngredient.name} - Rp ${totalCost.toLocaleString()}` })
    }
  }

  const removeIngredient = (id: string) => {
    setCalculation(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }))
  }

  const updateIngredient = (id: string, field: keyof Ingredient, value: any) => {
    setCalculation(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => {
        if (ing.id === id) {
          const updated = { ...ing, [field]: value }
          if (field === 'quantity' || field === 'pricePerUnit') {
            // Ensure values are valid numbers
            const quantity = isNaN(updated.quantity) ? 0 : Math.max(0, updated.quantity)
            const pricePerUnit = isNaN(updated.pricePerUnit) ? 0 : Math.max(0, updated.pricePerUnit)
            updated.quantity = quantity
            updated.pricePerUnit = pricePerUnit
            updated.totalCost = quantity * pricePerUnit
          }
          return updated
        }
        return ing
      })
    }))
  }

  const saveCalculation = async () => {
    if (!calculation.recipeName) {
      toast({ title: 'Nama resep wajib diisi', variant: 'destructive' })
      return
    }
    
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newCalc = {
        id: Date.now().toString(),
        recipeName: calculation.recipeName,
        servings: calculation.servings,
        costPerServing: totals.costPerServing,
        sellingPrice: calculation.sellingPrice,
        margin: totals.margin,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setSavedCalculations(prev => [newCalc, ...prev])
      toast({ title: 'Kalkulasi disimpan', description: calculation.recipeName })
    } catch (error) {
      toast({ title: 'Gagal menyimpan', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateOverheadCost = (id: string, field: 'amount' | 'percentage', value: number) => {
    setCalculation(prev => ({
      ...prev,
      overheadCosts: prev.overheadCosts.map(cost => 
        cost.id === id ? { ...cost, [field]: Math.max(0, value) } : cost
      )
    }))
  }

  const resetCalculation = () => {
    setCalculation(prev => ({
      ...prev,
      recipeName: '',
      servings: 1,
      ingredients: [],
      sellingPrice: 0
    }))
    toast({ title: 'Form direset' })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Kalkulator HPP</h1>
            <div className="space-y-1">
              <p className="text-muted-foreground">Hitung Harga Pokok Produksi dengan detail</p>
              <p className="text-xs text-muted-foreground">
                Shortcuts: <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+S</kbd> Simpan | 
                <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl+R</kbd> Reset | 
                <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Enter</kbd> Tambah Bahan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetCalculation}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button 
              onClick={saveCalculation} 
              disabled={!calculation.recipeName || isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </Button>
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
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipeName">Nama Resep</Label>
                    <Input
                      id="recipeName"
                      placeholder="Contoh: Roti Tawar Premium"
                      value={calculation.recipeName}
                      onChange={(e) => setCalculation(prev => ({ ...prev, recipeName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="servings">Jumlah Porsi</Label>
                    <Input
                      id="servings"
                      type="number"
                      min="1"
                      value={calculation.servings}
                      onChange={(e) => setCalculation(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                    />
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
                {/* Add Ingredient Form */}
                <div className="space-y-3 ingredient-form">
                  {/* Mobile: Stack vertically on small screens */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <div className="md:col-span-4">
                      <Label className="block md:hidden text-sm font-medium mb-1">Nama Bahan</Label>
                      <Input
                        placeholder="Nama bahan"
                        value={newIngredient.name}
                        onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:col-span-7">
                      <div>
                        <Label className="block md:hidden text-sm font-medium mb-1">Jumlah</Label>
                        <Input
                          type="number"
                          placeholder="Jumlah"
                          value={newIngredient.quantity}
                          onChange={(e) => setNewIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="block md:hidden text-sm font-medium mb-1">Unit</Label>
                        <select
                          className="w-full p-2 border border-input rounded-md bg-background text-sm"
                          value={newIngredient.unit}
                          onChange={(e) => setNewIngredient(prev => ({ ...prev, unit: e.target.value }))}
                        >
                          <option value="g">gram</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="l">liter</option>
                          <option value="butir">butir</option>
                          <option value="bks">bks</option>
                        </select>
                      </div>
                      <div>
                        <Label className="block md:hidden text-sm font-medium mb-1">Harga/Unit</Label>
                        <Input
                          type="number"
                          placeholder="Harga"
                          value={newIngredient.pricePerUnit}
                          onChange={(e) => setNewIngredient(prev => ({ ...prev, pricePerUnit: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-1">
                      <Label className="block md:hidden text-sm font-medium mb-1">&nbsp;</Label>
                      <Button 
                        onClick={addIngredient} 
                        className="w-full"
                        disabled={!newIngredient.name || !newIngredient.quantity || !newIngredient.pricePerUnit}
                      >
                        <Plus className="h-4 w-4 mr-1 md:mr-0" />
                        <span className="md:hidden">Tambah</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Ingredients List */}
                <div className="space-y-2">
                  {calculation.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <Input
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={ingredient.quantity}
                            onChange={(e) => updateIngredient(ingredient.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm text-muted-foreground">{ingredient.unit}</span>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={ingredient.pricePerUnit}
                            onChange={(e) => updateIngredient(ingredient.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm font-medium">
                            Rp {ingredient.totalCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => removeIngredient(ingredient.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {calculation.ingredients.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada bahan yang ditambahkan</p>
                    <p className="text-sm">Tambahkan bahan untuk mulai kalkulasi</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Overhead Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Biaya Overhead
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingOverhead(!isEditingOverhead)}
                  >
                    {isEditingOverhead ? 'Selesai' : 'Edit'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {calculation.overheadCosts.map((cost) => (
                    <div key={cost.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{cost.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={cost.type === 'fixed' ? 'default' : 'secondary'}>
                              {cost.type === 'fixed' ? 'Tetap' : 'Variabel'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Rp {(cost.type === 'fixed' ? cost.amount : (totals.materialCost * cost.percentage / 100)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {isEditingOverhead && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {cost.type === 'fixed' ? (
                            <div>
                              <Label className="text-xs">Jumlah (Rp)</Label>
                              <Input
                                type="number"
                                value={cost.amount}
                                onChange={(e) => updateOverheadCost(cost.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                              />
                            </div>
                          ) : (
                            <div>
                              <Label className="text-xs">Persentase (%)</Label>
                              <Input
                                type="number"
                                value={cost.percentage}
                                onChange={(e) => updateOverheadCost(cost.id, 'percentage', parseFloat(e.target.value) || 0)}
                                className="h-8 text-sm"
                                step="0.1"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Penetapan Harga
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sellingPrice">Harga Jual per Porsi</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    placeholder="15000"
                    value={calculation.sellingPrice}
                    onChange={(e) => setCalculation(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground">HPP per Porsi</p>
                    <p className="text-lg font-bold">
                      Rp {totals.costPerServing.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Keuntungan</p>
                    <p className="text-lg font-bold text-green-600">
                      Rp {totals.profitPerServing.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-muted-foreground">Margin</p>
                    <p className="text-lg font-bold text-blue-600">
                      {totals.margin.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart Pricing Assistant */}
            {calculation.recipeName && calculation.ingredients.length > 0 ? (
              <SmartPricingAssistant 
                recipe={{
                  id: 'demo-recipe',
                  name: calculation.recipeName,
                description: 'Resep demo untuk testing pricing assistant',
                prep_time: 30,
                cook_time: 60,
                servings: calculation.servings,
                difficulty: 'medium',
                category: 'bakery',
                instructions: 'Demo instructions',
                notes: null,
                image_url: null,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                recipe_ingredients: calculation.ingredients.map(ing => ({
                  id: ing.id,
                  recipe_id: 'demo-recipe',
                  ingredient_id: ing.id,
                  quantity: ing.quantity,
                  unit: ing.unit,
                  cost: ing.totalCost,
                  notes: null,
                  created_at: new Date().toISOString(),
                  ingredient: {
                    id: ing.id,
                    name: ing.name,
                    price_per_unit: ing.pricePerUnit,
                    unit: ing.unit,
                    current_stock: 100,
                    min_stock: 10,
                    category: 'ingredient',
                    supplier: null,
                    description: null,
                    is_active: true,
                    storage_requirements: null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                }))
              }}
                onPriceUpdate={(price) => {
                  setCalculation(prev => ({ ...prev, sellingPrice: price }))
                }}
              />
            ) : (
              <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                <p>Tambahkan nama resep dan bahan baku untuk menggunakan Smart Pricing Assistant</p>
              </div>
            )}
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
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Bahan Baku:</span>
                    <span className="font-medium">Rp {totals.materialCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Overhead:</span>
                    <span className="font-medium">Rp {totals.overheadCost.toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-medium">
                    <span>Total HPP:</span>
                    <span>Rp {totals.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg">
                    <span>HPP per Porsi:</span>
                    <span>Rp {totals.costPerServing.toLocaleString()}</span>
                  </div>
                </div>

                {calculation.sellingPrice > 0 && (
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Harga Jual:</span>
                      <span className="font-medium">Rp {calculation.sellingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-green-600">
                      <span>Keuntungan:</span>
                      <span>Rp {totals.profitPerServing.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium text-blue-600">
                      <span>Margin:</span>
                      <span>{totals.margin.toFixed(1)}%</span>
                    </div>
                  </div>
                )}

                {totals.margin < 30 && calculation.sellingPrice > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm text-orange-600">
                      Margin rendah! Pertimbangkan untuk menaikkan harga atau menurunkan biaya.
                    </p>
                  </div>
                )}

                {totals.margin >= 30 && calculation.sellingPrice > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-600">
                      Margin baik! Harga sudah menguntungkan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Calculations */}
            <Card>
              <CardHeader>
                <CardTitle>Kalkulasi Tersimpan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedCalculations.map((calc) => (
                    <div key={calc.id} className="p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{calc.recipeName}</p>
                          <p className="text-xs text-muted-foreground">{calc.createdAt}</p>
                        </div>
                        <Badge variant="secondary">{calc.servings} porsi</Badge>
                      </div>
                      <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-muted-foreground">HPP:</p>
                          <p className="font-medium">Rp {calc.costPerServing.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Margin:</p>
                          <p className="font-medium text-green-600">{calc.margin.toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Total Kalkulasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{savedCalculations.length}</p>
                  <p className="text-xs text-muted-foreground">resep</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Rata-rata Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {savedCalculations.length > 0 
                      ? (savedCalculations.reduce((sum, calc) => sum + calc.margin, 0) / savedCalculations.length).toFixed(1) 
                      : '0'}%
                  </p>
                  <p className="text-xs text-muted-foreground">dari semua resep</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
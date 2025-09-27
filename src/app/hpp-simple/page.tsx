'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Calculator, 
  Plus, 
  Trash2, 
  DollarSign,
  Package,
  CheckCircle,
  AlertTriangle,
  Save,
  Wand2,
  TrendingUp,
  Info
} from 'lucide-react'

interface SimpleIngredient {
  id: string
  name: string
  quantity: number
  unit: string
  price: number
  total: number
}

interface SimpleRecipe {
  name: string
  portions: number
  ingredients: SimpleIngredient[]
  // Otomatis dihitung
  totalCost: number
  costPerPortion: number
  // Harga jual yang disarankan (otomatis)
  suggestedPrice: number
  suggestedMargin: number
  // Harga jual actual (input user)
  sellingPrice: number
  actualMargin: number
  profit: number
}

const UNITS = ['gram', 'kg', 'ml', 'liter', 'butir', 'lembar', 'bungkus']

// Konstanta untuk otomatisasi
const OVERHEAD_PERCENTAGE = 15 // 15% untuk overhead (listrik, gas, dll)
const LABOR_PERCENTAGE = 20    // 20% untuk tenaga kerja
const MIN_MARGIN = 40          // Margin minimal 40%
const RECOMMENDED_MARGIN = 60  // Margin rekomendasi 60%

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
    profit: 0
  })

  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'gram',
    price: ''
  })

  // Otomatis hitung semua nilai ketika ada perubahan
  useEffect(() => {
    calculateAll()
  }, [recipe.ingredients, recipe.portions, recipe.sellingPrice])

  const calculateAll = () => {
    // 1. Hitung total biaya bahan
    const materialCost = recipe.ingredients.reduce((sum, ing) => sum + ing.total, 0)
    
    // 2. Otomatis tambahkan overhead dan tenaga kerja
    const overheadCost = materialCost * (OVERHEAD_PERCENTAGE / 100)
    const laborCost = materialCost * (LABOR_PERCENTAGE / 100)
    
    // 3. Total HPP
    const totalCost = materialCost + overheadCost + laborCost
    const costPerPortion = recipe.portions > 0 ? totalCost / recipe.portions : 0
    
    // 4. Otomatis hitung harga jual yang disarankan
    const suggestedPrice = Math.ceil(costPerPortion * (1 + RECOMMENDED_MARGIN / 100) / 1000) * 1000 // Bulatkan ke ribuan
    const suggestedMargin = costPerPortion > 0 ? ((suggestedPrice - costPerPortion) / costPerPortion * 100) : 0
    
    // 5. Hitung margin aktual jika ada harga jual
    const actualMargin = costPerPortion > 0 && recipe.sellingPrice > 0 
      ? ((recipe.sellingPrice - costPerPortion) / costPerPortion * 100) 
      : 0
    const profit = recipe.sellingPrice - costPerPortion

    setRecipe(prev => ({
      ...prev,
      totalCost,
      costPerPortion,
      suggestedPrice,
      suggestedMargin,
      actualMargin,
      profit
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

    const ingredient: SimpleIngredient = {
      id: Date.now().toString(),
      name: newIngredient.name,
      quantity,
      unit: newIngredient.unit,
      price,
      total: quantity * price
    }

    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }))

    setNewIngredient({ name: '', quantity: '', unit: 'gram', price: '' })
    toast({ title: 'Bahan ditambahkan!', description: `${ingredient.name} - Rp ${ingredient.total.toLocaleString()}` })
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
    setRecipe(prev => ({ ...prev, sellingPrice: prev.suggestedPrice }))
    toast({ title: 'Harga rekomendasi diterapkan!', description: `Rp ${recipe.suggestedPrice.toLocaleString()}` })
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
    if (margin >= RECOMMENDED_MARGIN) return { color: 'text-gray-600 dark:text-gray-400', status: 'Excellent', icon: CheckCircle }
    if (margin >= MIN_MARGIN) return { color: 'text-gray-600 dark:text-gray-400', status: 'Good', icon: CheckCircle }
    if (margin >= 20) return { color: 'text-gray-600 dark:text-gray-400', status: 'Low', icon: AlertTriangle }
    return { color: 'text-gray-600 dark:text-gray-400', status: 'Too Low', icon: AlertTriangle }
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

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Tips Cerdas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-blue-950 rounded-lg">
                  <p className="font-medium text-blue-900 dark:text-blue-100">Margin Sehat:</p>
                  <p className="text-blue-700 dark:text-blue-200">
                    Untuk UMKM bakery, margin {MIN_MARGIN}-{RECOMMENDED_MARGIN}% sudah bagus
                  </p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 dark:bg-green-950 rounded-lg">
                  <p className="font-medium text-green-900 dark:text-green-100">Overhead Otomatis:</p>
                  <p className="text-green-700 dark:text-green-200">
                    Sudah termasuk listrik, gas, dan biaya operasional lainnya
                  </p>
                </div>
              </CardContent>
            </Card>

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
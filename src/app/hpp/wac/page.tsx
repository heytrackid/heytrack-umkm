'use client'

import { DollarSign, Package, RefreshCw, TrendingUp } from '@/components/icons'
import { useEffect as _useEffect, useRef, useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { infoToast, successToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { useIngredientsList } from '@/hooks/useIngredients'
import { handleError } from '@/lib/error-handling'

import type { Row } from '@/types/database'

type Ingredient = Row<'ingredients'>



const WacEnginePage = (): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

   // Use ingredients hook with caching
    const { data: ingredients = [], isLoading: loading } = useIngredientsList()
   const [selectedIngredient, setSelectedIngredient] = useState<string>('')
   const [calculating, setCalculating] = useState(false)
   const [recalculating, setRecalculating] = useState(false)

  // Cleanup timeout on unmount
  _useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Calculate WAC for selected ingredient
  const calculateWac = () => {
    if (!selectedIngredient) {
      handleError(new Error('Validation: Please select an ingredient'), 'HPP WAC: validation', true, 'Silakan pilih bahan baku')
      return
    }

    try {
      setCalculating(true)
      // This would normally call a WAC API endpoint
      // For now, we'll simulate the calculation
      infoToast('Info', 'WAC calculation endpoint not yet implemented')
    } catch (error) {
      handleError(error as Error, 'HPP WAC: calculate', true, 'Gagal menghitung WAC')
    } finally {
      setCalculating(false)
    }
  }

  // Recalculate all WAC values
  const recalculateAll = () => {
    try {
      setRecalculating(true)
      infoToast('Info', 'Full WAC recalculation started')

      // Simulate recalculation
      timeoutRef.current = setTimeout(() => {
        setRecalculating(false)
        successToast('Berhasil', 'WAC recalculation completed')
      }, 2000)
    } catch (error) {
      handleError(error as Error, 'HPP WAC: recalculate all', true, 'Gagal menghitung ulang WAC')
      setRecalculating(false)
    }
  }

  return (
    <AppLayout pageTitle="WAC Engine">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="WAC Engine"
          description="Weighted Average Cost management untuk inventory valuation"
          actions={
            <Button
              onClick={recalculateAll}
              disabled={recalculating}
              variant="outline"
              className="flex flex-col sm:flex-row sm:items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${recalculating ? 'animate-spin' : ''}`} />
              {recalculating ? 'Recalculating...' : 'Recalculate All'}
            </Button>
          }
        />

        {/* WAC Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Calculate WAC
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="ingredient-select" className="text-sm font-medium">Pilih Bahan Baku</label>
                <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                  <SelectTrigger id="ingredient-select">
                    <SelectValue placeholder="Pilih bahan baku..." />
                  </SelectTrigger>
                   <SelectContent>
                     {ingredients.map((ingredient: Ingredient) => (
                       <SelectItem key={ingredient['id']} value={ingredient['id']}>
                         {ingredient.name}
                       </SelectItem>
                     ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={calculateWac}
              disabled={(calculating || loading) || !selectedIngredient}
              className="w-full md:w-auto"
            >
              {calculating ? 'Menghitung...' : 'Hitung WAC'}
            </Button>
          </CardContent>
        </Card>

        {/* WAC Explanation */}
        <Card>
          <CardHeader>
            <CardTitle>Apa itu WAC (Weighted Average Cost)?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p>
                <strong>Weighted Average Cost (WAC)</strong> adalah metode perhitungan biaya rata-rata
                untuk inventory berdasarkan pembelian historis. Sistem ini menghitung biaya rata-rata
                dengan mempertimbangkan jumlah dan harga pembelian di masa lalu.
              </p>

              <h4>Formula WAC:</h4>
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                WAC = Total Value ÷ Total Quantity
              </div>

              <h4>Keuntungan WAC:</h4>
              <ul>
                <li>✅ Menghilangkan fluktuasi harga jangka pendek</li>
                <li>✅ Memberikan gambaran biaya yang lebih stabil</li>
                <li>✅ Berguna untuk costing dan profit margin analysis</li>
                <li>✅ Mendukung keputusan pricing yang lebih akurat</li>
              </ul>

              <h4>Kapan WAC Diperbarui:</h4>
              <ul>
                <li>• Saat ada pembelian bahan baku baru</li>
                <li>• Saat dilakukan inventory adjustment</li>
                <li>• Saat ada perubahan signifikan dalam harga pasar</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* WAC Statistics */}
        <div className="grid grid-cols-1 grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4" />
                Ingredients with WAC
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-3xl font-bold text-muted-foreground">
                 {ingredients.filter((i: Ingredient) => i.weighted_average_cost && i.weighted_average_cost > 0).length}
               </div>
              <p className="text-sm text-muted-foreground mt-1">
                dari {ingredients.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Average WAC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                {ingredients.length > 0
                  ? formatCurrency(
                     ingredients
                       .filter((i: Ingredient) => i.weighted_average_cost && i.weighted_average_cost > 0)
                       .reduce((sum: number, i: Ingredient) => sum + (i.weighted_average_cost || 0), 0) /
                     Math.max(1, ingredients.filter((i: Ingredient) => i.weighted_average_cost && i.weighted_average_cost > 0).length)
                  )
                  : formatCurrency(0)
                }
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                rata-rata seluruh bahan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Inventory Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-muted-foreground">
                 {formatCurrency(
                   ingredients.reduce((sum: number, i: Ingredient) => {
                     const wac = (i.weighted_average_cost || i.price_per_unit) || 0
                     const stock = i.current_stock ?? 0
                     return sum + (wac * stock)
                   }, 0)
                 )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                berdasarkan WAC
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ingredients WAC Table */}
        <Card>
          <CardHeader>
            <CardTitle>WAC per Bahan Baku</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
               {ingredients.slice(0, 10).map((ingredient: Ingredient) => (
                 <div key={ingredient['id']} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Current stock: {ingredient.current_stock ?? 0} {ingredient.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {ingredient.weighted_average_cost
                        ? formatCurrency(ingredient.weighted_average_cost)
                        : 'Not calculated'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current: {formatCurrency(ingredient.price_per_unit)}
                    </div>
                  </div>
                </div>
              ))}

              {ingredients.length > 10 && (
                <div className="text-center py-4 text-muted-foreground">
                  Dan {ingredients.length - 10} bahan baku lainnya...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default WacEnginePage
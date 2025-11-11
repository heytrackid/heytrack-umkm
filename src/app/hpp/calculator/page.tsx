'use client'

import { Calculator, DollarSign, Package, TrendingUp } from 'lucide-react'
import { useState } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { PageHeader, SharedStatsCards } from '@/components/shared/index'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useToast } from '@/hooks/use-toast'
import { useCurrency } from '@/hooks/useCurrency'
import { useRecipes } from '@/hooks/useRecipes'
import { dbLogger } from '@/lib/logger'

import type { Recipe } from '@/types/index'

// Force dynamic rendering to avoid SSG issues (move to server wrapper if needed)

const calculatorBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'HPP Calculator' }
]

// Extended type for calculator display
interface HppCalculationExtended {
  id: string
  recipe_id: string
  material_cost: number
  labor_cost: number
  overhead_cost: number
  total_cost: number
  cost_per_unit: number
  wac_adjustment: number
  production_quantity: number
  material_breakdown: Array<{
    ingredient_id: string
    ingredient_name: string
    quantity: number
    unit: string
    unit_price: number
    total_cost: number
  }>
  created_at: string
  user_id: string
}

const HppCalculatorPage = (): JSX.Element => {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()

  // ✅ OPTIMIZED: Use TanStack Query for caching
  const result = useRecipes({ limit: 1000 }) as { data?: { recipes?: Recipe[] }; isLoading: boolean }
  const { data: recipesData, isLoading: loading } = result
  const recipes = recipesData?.recipes ?? []

  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [calculation, setCalculation] = useState<HppCalculationExtended | null>(null)
  const [calculating, setCalculating] = useState(false)

  // Calculate HPP
  const calculateHpp = async () => {
    if (!selectedRecipe) {
      toast({
        title: 'Error',
        description: 'Please select a recipe',
        variant: 'destructive'
      })
      return
    }

    try {
      setCalculating(true)
      const response = await fetch('/api/hpp/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipeId: selectedRecipe }),
        credentials: 'include', // Include cookies for authentication
      })

      if (response.ok) {
        const data = await response.json() as { calculation?: HppCalculationExtended }
        setCalculation(data.calculation ?? null)

        toast({
          title: 'Success',
          description: 'HPP calculated successfully',
        })
      } else {
        throw new Error('Failed to calculate HPP')
      }
    } catch (_error) {
      dbLogger.error({ _error }, 'Failed to calculate HPP')
      toast({
        title: 'Error',
        description: 'Failed to calculate HPP',
        variant: 'destructive'
      })
    } finally {
      setCalculating(false)
    }
  }

  return (
    <AppLayout pageTitle="HPP Calculator">
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader
          title="HPP Calculator"
          description="Hitung Harga Pokok Produksi untuk setiap resep dengan akurat"
          breadcrumbs={calculatorBreadcrumbs}
        />

        {/* Stats Cards */}
        {loading ? (
          <StatsCardSkeleton />
        ) : (
          <SharedStatsCards
            stats={[
              {
                title: "Total Calculations",
                value: "0",
                subtitle: "Jumlah kalkulasi yang telah dilakukan",
                icon: <Calculator className="h-4 w-4" />
              },
              {
                title: "Avg. Processing Time",
                value: "0ms",
                subtitle: "Waktu rata-rata pemrosesan",
                icon: <TrendingUp className="h-4 w-4" />
              },
              {
                title: "Recipes Analyzed",
                value: "0",
                subtitle: "Jumlah resep yang dianalisis",
                icon: <Package className="h-4 w-4" />
              },
              {
                title: "Cost Savings Identified",
                value: formatCurrency(0),
                subtitle: "Potensi penghematan biaya",
                icon: <DollarSign className="h-4 w-4" />
              }
            ]}
          />
        )}

        {/* Calculator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Kalkulasi HPP
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="recipe-select" className="text-sm font-medium">Pilih Resep</label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger id="recipe-select">
                    <SelectValue placeholder="Pilih resep..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe['id']} value={recipe['id']}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={calculateHpp}
              disabled={(calculating || loading) || !selectedRecipe}
              className="w-full md:w-auto"
            >
              {calculating ? 'Menghitung...' : 'Hitung HPP'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {calculation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total HPP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">
                  {formatCurrency(calculation.total_cost)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  untuk {calculation.production_quantity} porsi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Cost per Unit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-muted-foreground">
                  {formatCurrency(calculation.cost_per_unit)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  per porsi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  WAC Adjustment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${(calculation.wac_adjustment ?? 0) >= 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                  {(calculation.wac_adjustment ?? 0) >= 0 ? '+' : ''}{formatCurrency(calculation.wac_adjustment ?? 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  penyesuaian inventory
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Breakdown */}
        {calculation && (
          <Card>
            <CardHeader>
              <CardTitle>Breakdown Biaya</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cost Components */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Biaya Material</span>
                  <span className="font-semibold">{formatCurrency(calculation.material_cost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Biaya Tenaga Kerja</span>
                  <span className="font-semibold">{formatCurrency(calculation.labor_cost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Biaya Overhead</span>
                  <span className="font-semibold">{formatCurrency(calculation.overhead_cost)}</span>
                </div>
                {(calculation.wac_adjustment || 0) !== 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">WAC Adjustment</span>
                    <span className="font-semibold">{formatCurrency(calculation.wac_adjustment ?? 0)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="font-bold text-lg">Total HPP</span>
                  <span className="font-bold text-lg">{formatCurrency(calculation.total_cost)}</span>
                </div>
              </div>

              {/* Material Breakdown */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Breakdown Bahan Baku
                </h4>
                <div className="space-y-2">
                  {calculation.material_breakdown.map((item) => (
                    <div key={item['ingredient_name']} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item['ingredient_name']}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {formatCurrency(item.total_cost)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

export default HppCalculatorPage
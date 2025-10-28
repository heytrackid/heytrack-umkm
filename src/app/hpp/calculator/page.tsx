'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/app-layout'

// Force dynamic rendering to avoid SSG issues
export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calculator, TrendingUp, DollarSign, Package } from 'lucide-react'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/hooks/use-toast'
import { dbLogger } from '@/lib/logger'
import type { Database } from '@/types/supabase-generated'
import { PageHeader, SharedStatsCards } from '@/components/shared'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'

type Recipe = Database['public']['Tables']['recipes']['Row']

const calculatorBreadcrumbs = [
  { label: 'Dashboard', href: '/' },
  { label: 'HPP & Pricing', href: '/hpp' },
  { label: 'HPP Calculator' }
]

interface HppCalculation {
  recipeId: string
  materialCost: number
  laborCost: number
  overheadCost: number
  totalHpp: number
  costPerUnit: number
  wacAdjustment: number
  productionQuantity: number
  materialBreakdown: Array<{
    ingredientId: string
    ingredientName: string
    quantity: number
    unit: string
    unitPrice: number
    totalCost: number
  }>
}

export default function HppCalculatorPage() {
  const { formatCurrency } = useCurrency()
  const { toast } = useToast()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [calculation, setCalculation] = useState<HppCalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)

  // Load recipes
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        void setLoading(true)
        const response = await fetch('/api/recipes?limit=1000')
        if (response.ok) {
          const data = await response.json()
          void setRecipes(data.recipes || [])
        }
      } catch (err: unknown) {
        dbLogger.error({ err }, 'Failed to load recipes')
        toast({
          title: 'Error',
          description: 'Failed to load recipes',
          variant: 'destructive'
        })
      } finally {
        void setLoading(false)
      }
    }

    void loadRecipes()
  }, [toast])

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
      void setCalculating(true)
      const response = await fetch('/api/hpp/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipeId: selectedRecipe })
      })

      if (response.ok) {
        const data = await response.json()
        void setCalculation(data.calculation)

        toast({
          title: 'Success',
          description: 'HPP calculated successfully',
        })
      } else {
        throw new Error('Failed to calculate HPP')
      }
    } catch (err: unknown) {
      dbLogger.error({ err }, 'Failed to calculate HPP')
      toast({
        title: 'Error',
        description: 'Failed to calculate HPP',
        variant: 'destructive'
      })
    } finally {
      void setCalculating(false)
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
                <label className="text-sm font-medium">Pilih Resep</label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih resep..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={calculateHpp}
              disabled={calculating || loading || !selectedRecipe}
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
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(calculation.totalHpp)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  untuk {calculation.productionQuantity} porsi
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
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(calculation.costPerUnit)}
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
                <div className={`text-3xl font-bold ${calculation.wacAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {calculation.wacAdjustment >= 0 ? '+' : ''}{formatCurrency(calculation.wacAdjustment)}
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
                  <span className="font-semibold">{formatCurrency(calculation.materialCost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Biaya Tenaga Kerja</span>
                  <span className="font-semibold">{formatCurrency(calculation.laborCost)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Biaya Overhead</span>
                  <span className="font-semibold">{formatCurrency(calculation.overheadCost)}</span>
                </div>
                {calculation.wacAdjustment !== 0 && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium">WAC Adjustment</span>
                    <span className="font-semibold">{formatCurrency(calculation.wacAdjustment)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="font-bold text-lg">Total HPP</span>
                  <span className="font-bold text-lg">{formatCurrency(calculation.totalHpp)}</span>
                </div>
              </div>

              {/* Material Breakdown */}
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Breakdown Bahan Baku
                </h4>
                <div className="space-y-2">
                  {calculation.materialBreakdown.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.ingredientName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {formatCurrency(item.totalCost)}
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

'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUnifiedHpp } from '../hooks/useUnifiedHpp'
import { HppOverviewCard } from './HppOverviewCard'
import { RecipeSelector } from './RecipeSelector'
import { HppEmptyState } from './HppEmptyState'
import { CostCalculationCard } from './CostCalculationCard'
import { PricingCalculatorCard } from './PricingCalculatorCard'
import { ProductComparisonCard } from './ProductComparisonCard'
import { HppAlertsCard } from './HppAlertsCard'
import { HppBreakdownVisual } from './HppBreakdownVisual'
import { HppScenarioPlanner } from './HppScenarioPlanner'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Calculator, TrendingUp, BarChart3 } from 'lucide-react'

export const UnifiedHppPage = memo(() => {
  const {
    recipes,
    overview,
    recipe,
    comparison,
    alerts,
    recipeLoading,
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,
    updatePrice,
    markAlertAsRead
  } = useUnifiedHpp()

  const [marginPercentage, setMarginPercentage] = useState(60)
  const [suggestedPrice, setSuggestedPrice] = useState(0)

  // Auto-calculate when recipe or margin changes
  useEffect(() => {
    if (recipe) {
      const price = recipe.total_cost * (1 + marginPercentage / 100)
      setSuggestedPrice(Math.round(price / 100) * 100) // Round to nearest 100
    }
  }, [recipe, marginPercentage])

  // Set initial margin from recipe data (only when recipe ID changes)
  useEffect(() => {
    if (recipe?.margin_percentage && recipe.id) {
      void setMarginPercentage(recipe.margin_percentage)
    }
  }, [recipe?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRecipeSelect = useCallback((recipeId: string) => {
    if (recipeId === 'new') {
      window.location.href = '/recipes/new'
      return
    }
    void setSelectedRecipeId(recipeId)
  }, [setSelectedRecipeId])

  const handleRecalculate = useCallback(() => {
    if (recipe) {
      calculateHpp.mutate(recipe.id)
    }
  }, [recipe, calculateHpp])

  const handleSavePrice = useCallback((price: number, margin: number) => {
    if (!recipe) { return }

    updatePrice.mutate({
      recipeId: recipe.id,
      price: price,
      margin: margin
    })
  }, [recipe, updatePrice])

  const handleMarkAlertAsRead = useCallback((alertId: string) => {
    markAlertAsRead.mutate(alertId)
  }, [markAlertAsRead])

  // Calculate progress steps
  const step1Complete = !!selectedRecipeId && selectedRecipeId !== 'new'
  const step2Complete = step1Complete && recipe && recipe.total_cost > 0
  const step3Complete = step2Complete && recipe.selling_price && recipe.selling_price > 0

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overview Card */}
        {overview && <HppOverviewCard overview={overview} />}

        {/* Progress Indicator */}
        {selectedRecipeId && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Step 1 */}
                <div className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step1Complete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    {step1Complete ? <CheckCircle className="h-5 w-5" /> : '1'}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-medium">Pilih Produk</div>
                    <div className="text-xs text-muted-foreground">
                      {step1Complete ? recipe?.name : 'Belum dipilih'}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                {/* Step 2 */}
                <div className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step2Complete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    {step2Complete ? <CheckCircle className="h-5 w-5" /> : '2'}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-medium">Hitung Biaya</div>
                    <div className="text-xs text-muted-foreground">
                      {step2Complete ? 'Selesai' : 'Menunggu'}
                    </div>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />

                {/* Step 3 */}
                <div className="flex items-center gap-2 flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step3Complete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                    {step3Complete ? <CheckCircle className="h-5 w-5" /> : '3'}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-medium">Tentukan Harga</div>
                    <div className="text-xs text-muted-foreground">
                      {step3Complete ? 'Tersimpan' : 'Menunggu'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recipe Selector */}
        <RecipeSelector
          recipes={recipes}
          selectedRecipeId={selectedRecipeId}
          onRecipeSelect={handleRecipeSelect}
          isLoading={recipeLoading}
        />

        {/* Empty State */}
        {!selectedRecipeId && !recipeLoading && <HppEmptyState />}

        {/* Main Content with Tabs */}
        {recipe && (
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="calculator" className="gap-2">
                <Calculator className="h-4 w-4" />
                Kalkulator HPP
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Detail Breakdown
              </TabsTrigger>
              <TabsTrigger value="scenario" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Scenario Planning
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6 mt-6">
              {/* Cost Calculation */}
              <CostCalculationCard
                recipe={recipe}
                onRecalculate={handleRecalculate}
                isCalculating={calculateHpp.isPending}
              />

              {/* Pricing Calculator */}
              {recipe.total_cost > 0 && (
                <PricingCalculatorCard
                  totalCost={recipe.total_cost}
                  currentPrice={recipe.selling_price}
                  marginPercentage={marginPercentage}
                  suggestedPrice={suggestedPrice}
                  onMarginChange={setMarginPercentage}
                  onSavePrice={handleSavePrice}
                  isSaving={updatePrice.isPending}
                />
              )}

              {/* Product Comparison */}
              {comparison && comparison.length > 0 && (
                <ProductComparisonCard comparison={comparison} />
              )}
            </TabsContent>

            <TabsContent value="breakdown" className="mt-6">
              <HppBreakdownVisual recipe={recipe} />
            </TabsContent>

            <TabsContent value="scenario" className="mt-6">
              <HppScenarioPlanner recipe={recipe} />
            </TabsContent>
          </Tabs>
        )}

        {/* Alerts */}
        {alerts && alerts.length > 0 && (
          <HppAlertsCard alerts={alerts} onMarkAsRead={handleMarkAlertAsRead} />
        )}
      </div>
    </TooltipProvider>
  )
})

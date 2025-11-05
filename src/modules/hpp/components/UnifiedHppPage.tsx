'use client'

import { Card, CardContent } from '@/components/ui/card'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BarChart3, Calculator, TrendingUp, Bell } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { useUnifiedHpp } from '../hooks/useUnifiedHpp'
import { CostCalculationCard } from './CostCalculationCard'
import { HppAlertsTab } from './HppAlertsTab'
import { HppBreakdownVisual } from './HppBreakdownVisual'
import { HppEmptyState } from './HppEmptyState'
import { HppOverviewCard } from './HppOverviewCard'
import { HppScenarioPlanner } from './HppScenarioPlanner'
import { PricingCalculatorCard } from './PricingCalculatorCard'
import { ProductComparisonCard } from './ProductComparisonCard'
import { RecipeSelector } from './RecipeSelector'




export const UnifiedHppPage = memo(() => {
  const {
    recipes,
    overview,
    recipe,
    comparison,
    recipeLoading,
    selectedRecipeId,
    setSelectedRecipeId,
    calculateHpp,
    updatePrice
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
      price,
      margin
    })
  }, [recipe, updatePrice])



  // Calculate progress steps
  const step1Complete = !!selectedRecipeId && selectedRecipeId !== 'new'
  const step2Complete = step1Complete && recipe && recipe.total_cost > 0
  const _step3Complete = step2Complete && recipe.selling_price && recipe.selling_price > 0

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overview Card - Always visible */}
        {overview && <HppOverviewCard overview={overview} />}

        {/* Recipe Selector - Prominent position */}
        <RecipeSelector
          recipes={recipes}
          selectedRecipeId={selectedRecipeId}
          onRecipeSelect={handleRecipeSelect}
          isLoading={recipeLoading}
        />

        {/* Empty State - Show when no recipe selected */}
        {!selectedRecipeId && !recipeLoading && <HppEmptyState />}

        {/* Main Content - Show immediately when recipe selected */}
        {recipe && (
          <div className="space-y-6">
            {/* Primary Action: Cost Calculation */}
            <CostCalculationCard
              recipe={recipe}
              onRecalculate={handleRecalculate}
              isCalculating={calculateHpp.isPending}
            />

            {/* Secondary Action: Pricing (only show if cost calculated) */}
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

            {/* Additional Tools - Tabs for advanced features */}
            {recipe.total_cost > 0 && (
              <Card>
                <CardContent className="p-6">
                  <SwipeableTabs defaultValue="breakdown" className="w-full">
                    <SwipeableTabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
                       <SwipeableTabsTrigger value="breakdown" className="gap-2">
                         <BarChart3 className="h-4 w-4" />
                         <span className="hidden sm:inline">Detail</span> Breakdown
                       </SwipeableTabsTrigger>
                       <SwipeableTabsTrigger value="comparison" className="gap-2">
                         <TrendingUp className="h-4 w-4" />
                         <span className="hidden sm:inline">Bandingkan</span> Produk
                       </SwipeableTabsTrigger>
                       <SwipeableTabsTrigger value="scenario" className="gap-2">
                         <Calculator className="h-4 w-4" />
                         <span className="hidden sm:inline">Simulasi</span> Skenario
                       </SwipeableTabsTrigger>
                       <SwipeableTabsTrigger value="alerts" className="gap-2">
                         <Bell className="h-4 w-4" />
                         <span className="hidden sm:inline">Peringatan</span> Alerts
                       </SwipeableTabsTrigger>
                     </SwipeableTabsList>

                    <SwipeableTabsContent value="breakdown" className="mt-0">
                      <HppBreakdownVisual recipe={recipe} />
                    </SwipeableTabsContent>

                    <SwipeableTabsContent value="comparison" className="mt-0">
                      {comparison && comparison.length > 0 ? (
                        <ProductComparisonCard comparison={comparison} />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Belum ada produk lain untuk dibandingkan</p>
                          <p className="text-sm mt-2">Tambahkan lebih banyak resep untuk melihat perbandingan</p>
                        </div>
                      )}
                    </SwipeableTabsContent>

                     <SwipeableTabsContent value="scenario" className="mt-0">
                       <HppScenarioPlanner recipe={recipe} />
                     </SwipeableTabsContent>

                     <SwipeableTabsContent value="alerts" className="mt-0">
                       <HppAlertsTab />
                     </SwipeableTabsContent>
                   </SwipeableTabs>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
})

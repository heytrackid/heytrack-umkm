'use client'

import { BarChart3, Bell, Calculator, TrendingUp } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { SwipeableTabs, SwipeableTabsContent, SwipeableTabsList, SwipeableTabsTrigger } from '@/components/ui/swipeable-tabs'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CostCalculationCard } from '@/modules/hpp/components/CostCalculationCard'
import { HppAlertsTab } from '@/modules/hpp/components/HppAlertsTab'
import { HppBreakdownVisual } from '@/modules/hpp/components/HppBreakdownVisual'
import { HppEmptyState } from '@/modules/hpp/components/HppEmptyState'
import { HppOverviewCard } from '@/modules/hpp/components/HppOverviewCard'
import { HppQuickSummary } from '@/modules/hpp/components/HppQuickSummary'
import { HppScenarioPlanner } from '@/modules/hpp/components/HppScenarioPlanner'
import { PricingCalculatorCard } from '@/modules/hpp/components/PricingCalculatorCard'
import { ProductComparisonCard } from '@/modules/hpp/components/ProductComparisonCard'
import { RecipeSelector } from '@/modules/hpp/components/RecipeSelector'

import { useUnifiedHpp } from '@/modules/hpp/hooks/useUnifiedHpp'




export const UnifiedHppPage = memo(() => {
  const router = useRouter()
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

  // Calculate suggested price whenever recipe cost or margin percentage changes
  useEffect(() => {
    if (recipe) {
      const price = recipe.total_cost * (1 + marginPercentage / 100)
      const roundedPrice = Math.round(price / 100) * 100 // Round to nearest 100
      const timeoutId = setTimeout(() => setSuggestedPrice(roundedPrice), 0)
      return () => clearTimeout(timeoutId)
    }
    return () => {
      // Cleanup if no recipe
    }
  }, [recipe, recipe?.total_cost, marginPercentage])
  
  // Set initial margin from recipe data (only when recipe ID changes)
  const prevRecipeId = useRef<string | null>(null)
  useEffect(() => {
    if (recipe && recipe.margin_percentage !== null && recipe.id !== prevRecipeId.current) {
      const margin = recipe.margin_percentage as number
      const timeoutId = setTimeout(() => setMarginPercentage(margin), 0)
      prevRecipeId.current = recipe.id
      return () => clearTimeout(timeoutId)
    }
    return () => {
      // Cleanup if no recipe or no change
    }
   }, [recipe])

  const handleRecipeSelect = useCallback((recipeId: string) => {
    if (recipeId === 'new') {
      router.push('/recipes/new')
      return
    }
    setSelectedRecipeId(recipeId)
  }, [setSelectedRecipeId, router])

  const handleRecalculate = useCallback(() => {
    if (recipe) {
      calculateHpp.mutate(recipe['id'])
    }
  }, [recipe, calculateHpp])

  const handleSavePrice = useCallback((price: number, margin: number) => {
    if (!recipe) { return }

    updatePrice.mutate({
      recipeId: recipe['id'],
      price,
      margin
    })
  }, [recipe, updatePrice])





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

        {/* Main Content - Progressive Disclosure */}
        {recipe && (
          <div className="space-y-6">
            {/* Quick Summary - Always visible at top */}
            {recipe.total_cost > 0 && <HppQuickSummary recipe={recipe} />}

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

UnifiedHppPage.displayName = 'UnifiedHppPage'

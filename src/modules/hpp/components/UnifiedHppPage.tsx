'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useUnifiedHpp } from '../hooks/useUnifiedHpp'
import { HppOverviewCard } from './HppOverviewCard'
import { RecipeSelector } from './RecipeSelector'
import { HppEmptyState } from './HppEmptyState'
import { CostCalculationCard } from './CostCalculationCard'
import { PricingCalculatorCard } from './PricingCalculatorCard'
import { ProductComparisonCard } from './ProductComparisonCard'
import { HppAlertsCard } from './HppAlertsCard'

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

  const handleSavePrice = useCallback(() => {
    if (!recipe) { return }

    updatePrice.mutate({
      recipeId: recipe.id,
      price: suggestedPrice,
      margin: marginPercentage
    })
  }, [recipe, suggestedPrice, marginPercentage, updatePrice])

  const handleMarkAlertAsRead = useCallback((alertId: string) => {
    markAlertAsRead.mutate(alertId)
  }, [markAlertAsRead])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overview Card */}
        {overview && <HppOverviewCard overview={overview} />}

        {/* Recipe Selector */}
        <RecipeSelector
          recipes={recipes}
          selectedRecipeId={selectedRecipeId}
          onRecipeSelect={handleRecipeSelect}
          isLoading={recipeLoading}
        />

        {/* Empty State */}
        {!selectedRecipeId && !recipeLoading && <HppEmptyState />}

        {/* Cost Calculation */}
        {recipe && (
          <CostCalculationCard
            recipe={recipe}
            onRecalculate={handleRecalculate}
            isCalculating={calculateHpp.isPending}
          />
        )}

        {/* Pricing Calculator */}
        {recipe && (
          <PricingCalculatorCard
            totalCost={recipe.total_cost}
            marginPercentage={marginPercentage}
            suggestedPrice={suggestedPrice}
            onMarginChange={setMarginPercentage}
            onSavePrice={handleSavePrice}
            isSaving={updatePrice.isPending}
          />
        )}

        {/* Product Comparison */}
        {recipe && <ProductComparisonCard comparison={comparison} />}

        {/* Alerts */}
        <HppAlertsCard alerts={alerts} onMarkAsRead={handleMarkAlertAsRead} />
      </div>
    </TooltipProvider>
  )
})

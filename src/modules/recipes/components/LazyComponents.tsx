'use client'

import { Suspense, useEffect } from 'react'

import { createLazyComponent, CardSkeleton, ChartSkeleton } from '@/components/lazy/LazyWrapper'

const LazySmartPricingAssistant = createLazyComponent(
  () => import('./SmartPricingAssistant'),
  CardSkeleton
)

export { LazySmartPricingAssistant }

export async function preloadRecipeComponents() {
  await import('./SmartPricingAssistant')
}

export const RecipeDashboardWithProgressiveLoading = ({
  recipeId,
  recipeName
}: {
  recipeId: string
  recipeName: string
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Recipe Management: {recipeName}</h1>
      <Suspense fallback={<CardSkeleton />}>
        <div className="grid gap-4 md:grid-cols-4" />
      </Suspense>
    </div>

    <div className="space-y-6">
      <Suspense fallback={<ChartSkeleton />}>
        <LazySmartPricingAssistant recipeId={recipeId} recipeName={recipeName} />
      </Suspense>
    </div>
  </div>
)

export function useRecipeProgressiveLoading(delay = 250) {
  useEffect(() => {
    const timer = setTimeout(() => {
      void preloadRecipeComponents()
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])
}

export const SmartRecipeLoader = ({
  userRole,
  recipeId,
  recipeName,
  ...props
}: {
  userRole: 'admin' | 'manager' | 'staff'
  recipeId: string
  recipeName: string
  [key: string]: unknown
}) => {
  const showAdvancedFeatures = userRole === 'admin' || userRole === 'manager'

  if (!showAdvancedFeatures) {
    return null
  }

  return (
    <Suspense fallback={<CardSkeleton />}>
      <LazySmartPricingAssistant
        recipeId={recipeId}
        recipeName={recipeName}
        {...props}
      />
    </Suspense>
  )
}

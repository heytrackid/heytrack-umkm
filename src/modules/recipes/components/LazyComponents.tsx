'use client'

import { Suspense, useEffect, lazy } from 'react'

import { CardSkeleton, ChartSkeleton } from '@/components/lazy/LazyWrapper'

import type { SmartPricingAssistantProps } from '@/modules/recipes/components/SmartPricingAssistant'

// Define explicit prop interface with index signature for ComponentType compatibility
export interface SmartPricingAssistantPropsWithIndex extends SmartPricingAssistantProps {
  [key: string]: unknown
}

// Create lazy component with proper typing
const LazySmartPricingAssistantComponent = lazy(() => import('./SmartPricingAssistant').then(module => ({ default: module.SmartPricingAssistant })))

// Wrapper component that provides proper typing and suspense boundary
export const LazySmartPricingAssistant = (props: SmartPricingAssistantPropsWithIndex) => (
  <Suspense fallback={<CardSkeleton />}>
    <LazySmartPricingAssistantComponent {...props} />
  </Suspense>
)



export async function preloadRecipeComponents() {
  await import('./SmartPricingAssistant')
}

// Note: The components below are not currently used but kept for potential future use
// They would need to be updated to match the actual SmartPricingAssistant props
// which require a full recipe object with ingredients, not just recipeId and recipeName

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
        {/* Note: This would need a full recipe object to work properly */}
        <div>Recipe ID: {recipeId}</div>
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
  recipeName
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
      {/* Note: This would need a full recipe object to work properly */}
      <div>Recipe ID: {recipeId}, Name: {recipeName}</div>
    </Suspense>
  )
}

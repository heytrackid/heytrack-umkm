'use client'

import { createLazyComponent, ComponentSkeletons } from '@/shared/components/utility/LazyWrapper'
import { Suspense } from 'react'

// Lazy load recipe components with optimized loading
export const LazyAdvancedHPPCalculator = createLazyComponent(
  () => impor"Placeholder",
  {
    name: 'Advanced HPP Calculator',
    fallback: <ComponentSkeletons.Dashboard />,
    minLoadingTime: 700, // Longer for complex HPP calculation features
  }
)

export const LazySmartPricingAssistant = createLazyComponent(
  () => impor"Placeholder",
  {
    name: 'Smart Pricing Assistant',
    fallback: <ComponentSkeletons.Dashboard />,
    minLoadingTime: 600,
  }
)

// Preload critical recipe components for better UX
export const preloadRecipeComponents = () => {
  // Preload most commonly used components
  impor"Placeholder"
  impor"Placeholder"
}

// Progressive loading for recipe dashboard
export function RecipeDashboardWithProgressiveLoading({
  recipeId,
  recipeName
}: {
  recipeId: string
  recipeName: string
}) {
  return (
    <div className="space-y-6">
      {/* Critical above-the-fold content loads first */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Recipe Management: {recipeName}</h1>
        
        {/* Basic recipe info loads immediately (lightweight) */}
        <Suspense fallback={<ComponentSkeletons.Card />}>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Basic stats - not lazy loaded as they're lightweight */}
          </div>
        </Suspense>
      </div>

      {/* Heavy components load progressively */}
      <div className="space-y-6">
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazyAdvancedHPPCalculator 
            recipeId={recipeId}
            recipeName={recipeName}
          />
        </Suspense>
        
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazySmartPricingAssistant 
            recipeId={recipeId}
            recipeName={recipeName}
          />
        </Suspense>
      </div>
    </div>
  )
}

// Hook for progressive recipe component loading with metrics
export function useRecipeProgressiveLoading() {
  const components = [
    () => impor"Placeholder",
    () => impor"Placeholder",
  ]
  
  return useProgressiveLoading(components, 250)
}

// Smart recipe component loader based on user role
export const SmartRecipeLoader = ({ 
  userRole,
  recipeId,
  recipeName,
  ...props 
}: {
  userRole: 'admin' | 'manager' | 'staff'
  recipeId: string
  recipeName: string
  [key: string]: any
}) => {
  // Load different components based on user permissions
  const showAdvancedFeatures = userRole === 'admin' || userRole === 'manager'

  return (
    <div className="space-y-6">
      {/* Basic HPP calculator for all users */}
      <Suspense fallback={<ComponentSkeletons.Dashboard />}>
        <LazyAdvancedHPPCalculator 
          recipeId={recipeId}
          recipeName={recipeName}
          {...props}
        />
      </Suspense>
      
      {/* Advanced pricing only for admin/manager */}
      {showAdvancedFeatures && (
        <Suspense fallback={<ComponentSkeletons.Dashboard />}>
          <LazySmartPricingAssistant 
            recipeId={recipeId}
            recipeName={recipeName}
            {...props}
          />
        </Suspense>
      )}
    </div>
  )
}

import { useProgressiveLoading } from '@/shared/components/utility/LazyWrapper'
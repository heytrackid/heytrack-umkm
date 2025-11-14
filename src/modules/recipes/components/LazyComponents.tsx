'use client'

import { Suspense, lazy } from 'react'

import { CardSkeleton } from '@/components/lazy/LazyWrapper'

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

// Note: Removed unused components that were not properly implemented
// If needed in future, they should be recreated with proper props matching SmartPricingAssistant requirements

'use client'

import { SmartPricingAssistant } from './SmartPricingAssistant'

import type { SmartPricingAssistantProps } from '@/modules/recipes/components/SmartPricingAssistant'

// Define explicit prop interface with index signature for ComponentType compatibility
export interface SmartPricingAssistantPropsWithIndex extends SmartPricingAssistantProps {
  [key: string]: unknown
}

// Static component - no lazy loading
export const LazySmartPricingAssistant = (props: SmartPricingAssistantPropsWithIndex) => (
  <SmartPricingAssistant {...props} />
)



// Preloading removed - using static imports now

// Note: Removed unused components that were not properly implemented
// If needed in future, they should be recreated with proper props matching SmartPricingAssistant requirements

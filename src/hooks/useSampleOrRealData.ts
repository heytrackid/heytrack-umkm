import { useState, useEffect } from 'react'
import { 
  useSampleData,
  sampleCustomers,
  sampleIngredients,
  sampleRecipes,
  sampleOrders,
  sampleOperationalCosts,
  sampleDashboardStats
} from '@/lib/sample-data'

/**
 * Hook to use sample data or real data based on environment
 * Usage: const data = useSampleOrRealData('customers', realDataFromAPI)
 */
export function useSampleOrRealData<T>(
  dataType: 'customers' | 'ingredients' | 'recipes' | 'orders' | 'costs' | 'stats',
  realData: T[] | T | null
): T[] | T {
  const shouldUseSample = useSampleData()
  
  // Return sample data in development
  if (shouldUseSample) {
    switch (dataType) {
      case 'customers':
        return sampleCustomers as T[]
      case 'ingredients':
        return sampleIngredients as T[]
      case 'recipes':
        return sampleRecipes as T[]
      case 'orders':
        return sampleOrders as T[]
      case 'costs':
        return sampleOperationalCosts as T[]
      case 'stats':
        return sampleDashboardStats as T
      default:
        return (realData || []) as T[] | T
    }
  }
  
  // Return real data in production
  return (realData || []) as T[] | T
}

/**
 * Hook to check if currently using sample data
 */
export function useIsSampleDataMode(): boolean {
  const [isSample, setIsSample] = useState(false)
  
  useEffect(() => {
    setIsSample(useSampleData())
  }, [])
  
  return isSample
}

'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Form Loading Skeleton
const FormSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
)

// Lazy loaded form components
export const LazyIngredientForm = dynamic(
  () => impor"Placeholder".then(mod => ({ default: mod.IngredientForm })),
  { 
    ssr: false,
    loading: () => <FormSkeleton />
  }
)

export const LazyRecipeForm = dynamic(
  () => impor"Placeholder".then(mod => ({ default: mod.RecipeForm })),
  { 
    ssr: false,
    loading: () => <FormSkeleton />
  }
)

export const LazyCustomerForm = dynamic(
  () => impor"Placeholder".then(mod => ({ default: mod.CustomerForm })),
  { 
    ssr: false,
    loading: () => <FormSkeleton />
  }
)

export const LazyFinancialRecordForm = dynamic(
  () => impor"Placeholder".then(mod => ({ default: mod.FinancialRecordForm })),
  { 
    ssr: false,
    loading: () => <FormSkeleton />
  }
)

// Preloading functions for better UX
export const preloadIngredientForm = () => {
  const componentImport = () => impor"Placeholder"
  componentImpor""
}

export const preloadRecipeForm = () => {
  const componentImport = () => impor"Placeholder"
  componentImpor""
}

export const preloadCustomerForm = () => {
  const componentImport = () => impor"Placeholder"
  componentImpor""
}

export const preloadFinancialRecordForm = () => {
  const componentImport = () => impor"Placeholder"
  componentImpor""
}

// Enhanced Forms bundle for lazy loading (backward compatibility)
export const EnhancedForms = {
  IngredientForm: LazyIngredientForm,
  RecipeForm: LazyRecipeForm,
  CustomerForm: LazyCustomerForm,
  FinancialRecordForm: LazyFinancialRecordForm,
}

// Form wrapper with preloading
interface LazyFormWrapperProps {
  type: 'ingredient' | 'recipe' | 'customer' | 'financial'
  children: React.ReactNode
}

export const LazyFormWrapper = ({ type, children }: LazyFormWrapperProps) => {
  // Preload on hover for better UX
  const handlePreload = () => {
    switch (type) {
      case 'ingredient':
        preloadIngredientForm()
        break
      case 'recipe':
        preloadRecipeForm()
        break
      case 'customer':
        preloadCustomerForm()
        break
      case 'financial':
        preloadFinancialRecordForm()
        break
    }
  }

  return (
    <div onMouseEnter={handlePreload}>
      <Suspense fallback={<FormSkeleton />}>
        {children}
      </Suspense>
    </div>
  )
}

// Default export for backward compatibility
export default EnhancedForms

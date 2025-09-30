'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Loading skeletons
const RecipeListSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4">
            <Skeleton className="h-4 w-4" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

const RecipeFormSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-48" />
      </div>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="w-24">
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="w-20">
              <Skeleton className="h-3 w-8 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-10" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </CardContent>
  </Card>
)

// Lazy loaded components
export const LazyRecipeList = dynamic(
  () => impor"Placeholder".then(mod => ({ default: mod.RecipeList })),
  { 
    ssr: false,
    loading: () => <RecipeListSkeleton />
  }
)

export const LazyRecipeForm = dynamic(
  () => impor"Placeholder".then(mod => ({ default: mod.RecipeForm })),
  { 
    ssr: false,
    loading: () => <RecipeFormSkeleton />
  }
)

// Preloading functions
export const preloadRecipeList = () => {
  const componentImport = () => impor"Placeholder"
  componentImpor""
}

export const preloadRecipeForm = () => {
  const componentImport = () => impor"Placeholder"
  componentImpor""
}

// Component wrappers with preloading
interface LazyWrapperProps {
  children: React.ReactNode
  onMouseEnter?: () => void
}

export const RecipeListWrapper = ({ children, ...props }: LazyWrapperProps) => (
  <div onMouseEnter={preloadRecipeList} {...props}>
    <Suspense fallback={<RecipeListSkeleton />}>
      {children}
    </Suspense>
  </div>
)

export const RecipeFormWrapper = ({ children, ...props }: LazyWrapperProps) => (
  <div onMouseEnter={preloadRecipeForm} {...props}>
    <Suspense fallback={<RecipeFormSkeleton />}>
      {children}
    </Suspense>
  </div>
)

// Progressive loading with preloading on user interaction
export function RecipePageWithProgressiveLoading({ 
  children, 
  currentView 
}: { 
  children: React.ReactNode
  currentView: 'list' | 'add' | 'edit'
}) {
  // Preload components based on current view
  const handlePreloadForm = () => {
    if (currentView === 'list') {
      preloadRecipeForm()
    }
  }

  const handlePreloadList = () => {
    if (currentView !== 'list') {
      preloadRecipeLis""
    }
  }

  return (
    <div 
      onMouseEnter={handlePreloadForm}
      onFocus={handlePreloadForm}
    >
      <div 
        onMouseEnter={handlePreloadList}
        onFocus={handlePreloadList}
      >
        {children}
      </div>
    </div>
  )
}

export default {
  LazyRecipeList,
  LazyRecipeForm,
  preloadRecipeList,
  preloadRecipeForm,
  RecipeListWrapper,
  RecipeFormWrapper,
  RecipePageWithProgressiveLoading
}

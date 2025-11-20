'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export const RecentOrdersSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-border/20  p-6", className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-5 w-32" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border border-border/20  rounded-lg">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
      <Skeleton className="w-full h-9" />
    </div>
  </div>
)

// Skeleton untuk Stock Alert Card
export const StockAlertSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-border/20  p-6", className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-5 w-28" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
      <Skeleton className="w-full h-9" />
    </div>
  </div>
)

// Skeleton untuk HPP Results Card
export const HPPResultsSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-border/20  p-6", className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-5 w-40" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="text-center p-4 bg-muted/20 rounded-lg border border-border/20 ">
          <Skeleton className="h-4 w-20 mb-2 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          {i === 1 && <Skeleton className="h-4 w-12 mx-auto rounded-full" />}
          {i === 2 && <Skeleton className="h-3 w-14 mx-auto" />}
        </div>
      ))}
    </div>
  </div>
)

// Skeleton untuk Dashboard Header
export const DashboardHeaderSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
    <div>
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64" />
    </div>
    <div className="flex items-center gap-2">
      <Skeleton className="w-24" />
    </div>
  </div>
)


'use client'

import { Skeleton, SkeletonText, SkeletonButton, SkeletonChart } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

// Skeleton untuk Stats Cards di Dashboard
export const StatsCardSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-3", className)}>
    <div className="flex items-center justify-between">
      <SkeletonText className="h-4 w-32" />
      <Skeleton className="h-4 w-4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-8 w-24" />
      <div className="flex items-center space-x-1">
        <Skeleton className="h-3 w-3" />
        <SkeletonText className="h-3 w-20" />
      </div>
    </div>
  </div>
)

// Skeleton untuk Quick Actions
export const QuickActionsSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("", className)}>
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-5 w-5" />
        <SkeletonText className="h-5 w-24" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 border border-gray-200 dark:border-gray-800 rounded-md p-4 flex flex-col items-center justify-center space-y-2">
            <Skeleton className="h-6 w-6" />
            <SkeletonText className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Skeleton untuk Recent Orders Card
export const RecentOrdersSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-6", className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5" />
      <SkeletonText className="h-5 w-32" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
          <div className="flex-1 space-y-2">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-3 w-48" />
          </div>
          <div className="text-right space-y-2">
            <SkeletonText className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
      <SkeletonButton className="w-full h-9" />
    </div>
  </div>
)

// Skeleton untuk Stock Alert Card
export const StockAlertSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-6", className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5" />
      <SkeletonText className="h-5 w-28" />
    </div>
    <div className="space-y-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between items-center">
            <SkeletonText className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex justify-between text-sm">
            <SkeletonText className="h-3 w-20" />
            <SkeletonText className="h-3 w-20" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
      <SkeletonButton className="w-full h-9" />
    </div>
  </div>
)

// Skeleton untuk HPP Results Card
export const HPPResultsSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-6", className)}>
    <div className="flex items-center gap-2 mb-6">
      <Skeleton className="h-5 w-5" />
      <SkeletonText className="h-5 w-40" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
          <SkeletonText className="h-4 w-20 mb-2 mx-auto" />
          <Skeleton className="h-8 w-16 mx-auto mb-2" />
          {i === 1 && <Skeleton className="h-4 w-12 mx-auto rounded-full" />}
          {i === 2 && <SkeletonText className="h-3 w-14 mx-auto" />}
        </div>
      ))}
    </div>
  </div>
)

// Skeleton untuk Dashboard Header
export const DashboardHeaderSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
    <div>
      <SkeletonText className="h-8 w-48 mb-2" />
      <SkeletonText className="h-4 w-64" />
    </div>
    <div className="flex items-center gap-2">
      <SkeletonButton className="w-24" />
    </div>
  </div>
)

// Skeleton untuk Chart Card
export const ChartCardSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-6", className)}>
    <div className="flex items-center justify-between mb-6">
      <SkeletonText className="h-5 w-32" />
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
    <SkeletonChart />
  </div>
)
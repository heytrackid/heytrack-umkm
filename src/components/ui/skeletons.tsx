import { Skeleton } from './skeleton'

// Specific skeleton components for common UI patterns
export const DashboardCardSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )

export const ChartSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

export const AvatarSkeleton = () => <Skeleton className="h-10 w-10 rounded-full" />
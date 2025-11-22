import { Skeleton } from '@/components/ui/skeleton'

export const HeaderSectionSkeleton = () => (
  <div className="flex justify-between items-center mb-6">
    {/* Title skeleton */}
    <Skeleton className="h-8 w-48" />

    {/* Date Picker & Export buttons skeleton */}
    <div className="flex gap-2">
      <Skeleton className="h-10 w-32 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  </div>
)
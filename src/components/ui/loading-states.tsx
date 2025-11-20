import { LoadingSpinner as BaseLoadingSpinner } from '@/components/ui/loading-state'
import { CardSkeleton as BaseCardSkeleton, ListSkeleton as BaseListSkeleton, StatsSkeleton as BaseStatsSkeleton } from '@/components/ui/skeleton-loader'

/**
 * Shared Loading Components
 * Reusable loading states and skeletons
 */


// Re-export canonical loading spinner for backward compatibility
export const LoadingSpinner = BaseLoadingSpinner

// Full page loading state
export const PageLoading = ({ message = "Memuat..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
)

// Shared skeleton primitives re-exported for compatibility
export const CardSkeleton = BaseCardSkeleton
export const ListSkeleton = BaseListSkeleton
export const StatsSkeleton = BaseStatsSkeleton

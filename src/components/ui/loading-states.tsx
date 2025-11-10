import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shared Loading Components
 * Reusable loading states and skeletons
 */


// Loading spinner component
export const LoadingSpinner = ({ size = 'md', className }: {
  size?: 'lg' | 'md' | 'sm'
  className?: string
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-border/20 border-t-gray-600 ${sizeClasses[size]} ${className ?? ''}`} />
  )
}

// Full page loading state
export const PageLoading = ({ message = "Memuat..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
)

// Card skeleton for content loading
export const CardSkeleton = ({ rows = 3, showHeader = true }: {
  rows?: number
  showHeader?: boolean
}) => (
  <Card>
    {showHeader && (
      <CardHeader>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
    )}
    <CardContent className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </CardContent>
  </Card>
)

// List skeleton for table/data loading
export const ListSkeleton = ({ items = 5, showHeader = true }: {
  items?: number
  showHeader?: boolean
}) => (
  <div className="space-y-3">
    {showHeader && (
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>
    )}
    {Array.from({ length: items }, (_, i) => (
      <div key={i} className="flex gap-4 p-4 border rounded-lg">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    ))}
  </div>
)

// Stats skeleton for dashboard loading
export const StatsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

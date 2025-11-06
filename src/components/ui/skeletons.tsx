import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  children?: React.ReactNode
}

export const Skeleton = ({ className, children }: SkeletonProps) => (
    <div 
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    >
      {children}
    </div>
  )

// Specific skeleton components for common UI patterns
export const DashboardCardSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )

export const DataTableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-8 w-1/6" />
      </div>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3 text-left">
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b last:border-b-0">
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className="p-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

export const ChartSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

export const AvatarSkeleton = () => <Skeleton className="h-10 w-10 rounded-full" />
'use client'

import { cn } from '@/lib/utils'

interface ShimmerSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  lines?: number
  animate?: boolean
}

export function ShimmerSkeleton({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
}: ShimmerSkeletonProps) {
  const baseClasses = cn(
    'bg-muted',
    animate && 'animate-shimmer-gradient',
    variant === 'circular' && 'rounded-full',
    variant === 'rectangular' && 'rounded-none',
    variant === 'rounded' && 'rounded-xl',
    variant === 'text' && 'rounded h-4',
  )

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  if (lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, i === lines - 1 && 'w-3/4')}
            style={{ ...style, animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    )
  }

  return <div className={cn(baseClasses, className)} style={style} />
}

// Card skeleton for dashboard stats
export function StatCardSkeleton() {
  return (
    <div className="p-5 sm:p-6 rounded-xl border bg-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <ShimmerSkeleton width={96} height={16} />
          <ShimmerSkeleton width={128} height={32} />
          <ShimmerSkeleton width={80} height={12} />
        </div>
        <ShimmerSkeleton variant="rounded" width={48} height={48} />
      </div>
    </div>
  )
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <ShimmerSkeleton
          key={i}
          className="flex-1"
          width={i === 0 ? '40%' : '20%'}
          height={16}
        />
      ))}
    </div>
  )
}

// List item skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
      <ShimmerSkeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <ShimmerSkeleton width="60%" height={16} />
        <ShimmerSkeleton width="40%" height={12} />
      </div>
      <ShimmerSkeleton width={80} height={20} />
    </div>
  )
}

// Dashboard grid skeleton
export function DashboardGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <ShimmerSkeleton width={160} height={24} />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className="p-6 rounded-xl border bg-card space-y-4">
          <ShimmerSkeleton width={160} height={24} />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShimmerSkeleton

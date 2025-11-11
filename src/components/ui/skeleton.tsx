'use client'

import { cn } from '@/lib/utils'

import { useMemo } from 'react'
import type { ComponentProps, HTMLAttributes } from 'react'


interface SkeletonProps {
  className?: string
}

const Skeleton = ({ className, ...props }: HTMLAttributes<HTMLDivElement> & SkeletonProps) => (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
      {...props}
    />
  )

// Skeleton variants untuk berbagai use case
const SkeletonText = ({ 
  className,
  lines = 1,
  ...props 
}: HTMLAttributes<HTMLDivElement> & SkeletonProps & { lines?: number }) => {
  if (lines === 1) {
    return <Skeleton className={cn("h-4 w-full", className)} {...props} />
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full",
            className
          )}
          {...props}
        />
      ))}
    </div>
  )
}

const SkeletonAvatar = ({ className, ...props }: SkeletonProps) => (
    <Skeleton
      className={cn("h-10 w-10 rounded-full", className)}
      {...props}
    />
  )

const SkeletonButton = ({ className, ...props }: SkeletonProps) => (
    <Skeleton
      className={cn("h-9 w-20 rounded-md", className)}
      {...props}
    />
  )

const SkeletonCard = ({ className, ...props }: SkeletonProps) => (
    <div className={cn("rounded-lg border border-border/20 p-4 space-y-3 animate-fade-in", className)} {...props}>
      <div className="flex items-center justify-between">
        <SkeletonText className="h-5 w-1/3" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <SkeletonText className="h-3 w-2/3" />
      </div>
    </div>
  )

const SkeletonTable = ({ rows = 5, cols = 4, className, ...props }: SkeletonProps & { rows?: number; cols?: number }) => (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Table Header */}
      <div className="flex space-x-4">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 items-center">
          {Array.from({ length: cols }, (_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                "h-6 flex-1",
                colIndex === 0 ? "w-8 rounded-full" : "",
                colIndex === cols - 1 ? "w-16 h-5" : ""
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  )

const SkeletonChart = ({ className, ...props }: ComponentProps<'div'>) => {
  const heights = useMemo(() => [40, 80, 60, 100, 50, 90, 70], [])

  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex justify-between items-end h-40 px-4">
        {heights.map((height, i) => (
          <Skeleton
            key={i}
            className="w-8 rounded-t"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  )
}

const SkeletonForm = ({ className, ...props }: SkeletonProps) => (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex space-x-2 pt-4">
        <SkeletonButton className="w-24" />
        <SkeletonButton className="w-20" />
      </div>
    </div>
  )

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonForm,
}

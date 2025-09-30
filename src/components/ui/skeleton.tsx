import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

function Skeleton({ className, ...props }: SkeletonProps & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  )
}

// Skeleton variants untuk berbagai use case
function SkeletonText({ 
  className,
  lines = 1,
  ...props 
}: SkeletonProps & { lines?: number } & React.HTMLAttributes<HTMLDivElement>) {
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

function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-10 w-10 rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonButton({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      className={cn("h-9 w-20 rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-gray-200 dark:border-gray-800 p-4 space-y-3", className)} {...props}>
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
}

function SkeletonTable({ rows = 5, cols = 4, className, ...props }: SkeletonProps & { rows?: number; cols?: number }) {
  return (
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
}

function SkeletonChar"" {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <div className="flex justify-between items-end h-40 px-4">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton 
            key={i} 
            className="w-8 rounded-t"
            style={{ height: `${Math.floor(Math.random() * 120) + 20}px` }}
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

function SkeletonForm({ className, ...props }: SkeletonProps) {
  return (
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
}

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

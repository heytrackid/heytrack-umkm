import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-gray-200/80 animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonText({ className, lines = 1, ...props }: React.ComponentProps<"div"> & { lines?: number }) {
  if (lines === 1) {
    return <Skeleton className={className} {...props} />
  }

  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </div>
  )
}

function SkeletonButton({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("h-10 w-20", className)} {...props} />
}

function SkeletonAvatar({ className, ...props }: React.ComponentProps<"div">) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} {...props} />
}

function SkeletonTable({ rows, cols, className, ...props }: React.ComponentProps<"div"> & { rows: number; cols: number }) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar, SkeletonTable }

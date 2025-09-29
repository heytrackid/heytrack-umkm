import { cn } from "@/lib/utils"
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonButton,
  SkeletonAvatar,
  SkeletonTable
} from "@/components/ui/skeleton"

interface SkeletonProps {
  className?: string
}

// Skeleton untuk Orders Table
export function OrdersTableSkeleton({ className, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("", className)}>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <SkeletonText className="h-4 w-16" />
              <SkeletonText className="h-4 w-24" />
              <SkeletonText className="h-4 w-20" />
              <SkeletonText className="h-4 w-16" />
              <SkeletonText className="h-4 w-20" />
            </div>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <SkeletonText className="h-4 w-16" />
                  <div className="space-y-1">
                    <SkeletonText className="h-4 w-32" />
                    <SkeletonText className="h-3 w-48" />
                  </div>
                  <SkeletonText className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <SkeletonText className="h-4 w-20" />
                </div>
                <SkeletonButton className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk Customers Table
export function CustomersTableSkeleton({ className, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("", className)}>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex space-x-4">
            <SkeletonText className="h-4 w-8" />
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-4 w-24" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <SkeletonAvatar className="h-8 w-8" />
                <div className="space-y-1 flex-1">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-3 w-48" />
                </div>
                <SkeletonText className="h-4 w-24" />
                <SkeletonText className="h-4 w-32" />
                <SkeletonButton className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk Inventory Table
export function InventoryTableSkeleton({ className, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("", className)}>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex space-x-4">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-4 w-20" />
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-4 w-20" />
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-4 w-16" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <div className="space-y-1 flex-1">
                  <SkeletonText className="h-4 w-28" />
                  <SkeletonText className="h-3 w-20" />
                </div>
                <SkeletonText className="h-4 w-16" />
                <SkeletonText className="h-4 w-20" />
                <div className="space-y-1">
                  <SkeletonText className="h-4 w-16" />
                  <Skeleton className="h-2 w-20 rounded-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
                <SkeletonButton className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk Recipes Table
export function RecipesTableSkeleton({ className, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("", className)}>
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex space-x-4">
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-4 w-20" />
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-4 w-20" />
            <SkeletonText className="h-4 w-24" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-1 flex-1">
                  <SkeletonText className="h-4 w-32" />
                  <SkeletonText className="h-3 w-48" />
                </div>
                <SkeletonText className="h-4 w-16" />
                <SkeletonText className="h-4 w-20" />
                <SkeletonText className="h-4 w-20" />
                <SkeletonButton className="w-8 h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk List View (mobile friendly)
export function ListViewSkeleton({ className, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center space-x-4">
            <SkeletonAvatar className="h-10 w-10" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <SkeletonText className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <SkeletonText className="h-3 w-48" />
              <div className="flex items-center justify-between">
                <SkeletonText className="h-3 w-24" />
                <SkeletonButton className="w-16 h-6" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Skeleton untuk Search Form
export function SearchFormSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonButton className="w-24" />
          <SkeletonButton className="w-20" />
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk Recipe Table khusus
export function RecipeTableSkeleton({ className, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("", className)}>
      <div className="rounded-md border">
        {/* Table Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4">
          <div className="flex space-x-4">
            <SkeletonText className="h-4 w-8" />
            <SkeletonText className="h-4 w-32" />
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-4 w-24" />
            <SkeletonText className="h-4 w-20" />
            <SkeletonText className="h-4 w-16" />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="p-4">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded" />
                <div className="flex-1">
                  <div className="space-y-1">
                    <SkeletonText className="h-4 w-32" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <SkeletonText className="h-3 w-40" />
                  </div>
                </div>
                <SkeletonText className="h-4 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
                <div className="flex items-center gap-2">
                  <SkeletonButton className="w-8 h-8" />
                  <SkeletonButton className="w-8 h-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Skeleton untuk Data Grid dengan Pagination
export function DataGridSkeleton({ className, rows = 10 }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filter Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-9 w-64" />
          <SkeletonButton className="w-20" />
        </div>
        <div className="flex items-center space-x-2">
          <SkeletonButton className="w-24" />
          <SkeletonButton className="w-20" />
        </div>
      </div>
      
      {/* Table */}
      <SkeletonTable rows={rows} cols={5} />
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <SkeletonText className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <SkeletonButton className="w-8 h-8" />
          <SkeletonButton className="w-8 h-8" />
          <SkeletonButton className="w-8 h-8" />
          <SkeletonButton className="w-8 h-8" />
        </div>
      </div>
    </div>
  )
}

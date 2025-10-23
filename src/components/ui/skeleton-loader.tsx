'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib'

/**
 * Card Skeleton - Loading placeholder for card components
 * @example
 * <CardSkeleton rows={3} />
 */
export function CardSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('p-4 space-y-4', className)}>
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

/**
 * Table Skeleton - Loading placeholder for table data
 * @example
 * <TableSkeleton rows={5} columns={4} />
 */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * List Skeleton - Loading placeholder for list items
 * @example
 * <ListSkeleton items={5} />
 */
export function ListSkeleton({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Grid Skeleton - Loading placeholder for grid layouts
 * @example
 * <GridSkeleton columns={3} items={6} />
 */
export function GridSkeleton({ columns = 3, items = 6 }: { columns?: number; items?: number }) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

/**
 * Form Skeleton - Loading placeholder for forms
 * @example
 * <FormSkeleton fields={3} />
 */
export function FormSkeleton({ fields = 3, hasSubmit = true }: { fields?: number; hasSubmit?: boolean }) {
  return (
    <form className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      {hasSubmit && <Skeleton className="h-10 w-full" />}
    </form>
  )
}

/**
 * Hero Skeleton - Loading placeholder for hero sections
 * @example
 * <HeroSkeleton />
 */
export function HeroSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

/**
 * Profile Skeleton - Loading placeholder for profile cards
 * @example
 * <ProfileSkeleton />
 */
export function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * Stats Skeleton - Loading placeholder for stat cards
 * @example
 * <StatsSkeleton count={4} />
 */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  )
}

/**
 * Comment Skeleton - Loading placeholder for comments
 * @example
 * <CommentSkeleton count={3} />
 */
export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Product Card Skeleton - Loading placeholder for product cards
 * @example
 * <ProductCardSkeleton count={3} />
 */
export function ProductCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full rounded" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Breadcrumb Skeleton - Loading placeholder for breadcrumbs
 * @example
 * <BreadcrumbSkeleton />
 */
export function BreadcrumbSkeleton() {
  return (
    <div className="flex gap-2">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

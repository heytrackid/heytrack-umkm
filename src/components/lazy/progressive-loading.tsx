'use client'

import { useState, useEffect, Suspense, type ReactNode } from 'react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-state'
import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from '@/components/ui/skeleton-loader'



// Progressive loading for heavy data operations
interface ProgressiveLoaderProps {
  children: ReactNode
  fallback?: ReactNode
  timeout?: number
  showRetry?: boolean
  loadingMessage?: string
}

export const ProgressiveLoader = ({
  children,
  fallback,
  timeout = 3000,
  showRetry = true,
  loadingMessage = "Loading content..."
}: ProgressiveLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true)
      }
    }, timeout)

    // Simulate loading completion
    const loadTimer = setTimeout(() => {
      setIsLoading(false)
    }, Math.random() * 2000 + 500)

    return () => {
      clearTimeout(timer)
      clearTimeout(loadTimer)
    }
  }, [timeout, isLoading])

  const handleRetry = () => {
    setIsLoading(true)
    setHasError(false)
    setShowTimeout(false)
  }

  if (hasError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            <p>Failed to load content</p>
          </div>
          {showRetry && (
            <Button onClick={handleRetry} variant="outline">
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return fallback ?? (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-4">
            <LoadingSpinner size="md" />
            <span className="ml-3">{loadingMessage}</span>
          </div>
          {showTimeout && (
            <div className="text-center text-sm text-muted-foreground">
              <p>This is taking longer than usual...</p>
              {showRetry && (
                <Button onClick={handleRetry} variant="ghost" size="sm" className="mt-2">
                  Retry
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}

// Lazy data table dengan progressive loading
interface TableColumn<T extends Record<string, ReactNode>> {
  header: string
  accessor: keyof T
}

export const ProgressiveDataTable = <T extends Record<string, ReactNode>>({
  data,
  columns,
  pageSize = 10,
  virtualizeThreshold = 100
}: {
  data: T[]
  columns: Array<TableColumn<T>>
  pageSize?: number
  virtualizeThreshold?: number
}) => {
  const [loadedPages, setLoadedPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const shouldVirtualize = data.length > virtualizeThreshold
  const displayedData = data.slice(0, loadedPages * pageSize)

  const loadMore = async () => {
    setIsLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setLoadedPages(prev => prev + 1)
    setIsLoadingMore(false)
  }

  if (shouldVirtualize) {
    // For very large datasets, load virtualized table
    const columnCount = columns?.length ?? 4

    return (
      <Suspense fallback={<TableSkeleton rows={8} columns={columnCount} />}>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Large dataset detected ({data.length} items). Using optimized virtual table.
          </p>
          <VirtualizedTableLoader data={data} columns={columns} />
        </div>
      </Suspense>
    )
  }

  return (
    <div>
      <SimpleTableView data={displayedData} columns={columns} />

      {displayedData.length < data.length && (
        <div className="text-center p-4 border-t">
          <Button
            onClick={loadMore}
            disabled={isLoadingMore}
            variant="outline"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Loading more...</span>
              </>
            ) : (
              `Load more (${data.length - displayedData.length} remaining)`
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// Virtual table loader for heavy datasets
const VirtualizedTableLoader = <T extends { length?: number }>({ data }: { data?: T; columns?: unknown }) =>
// Simulate heavy data processing
(
  <div className="p-4 border rounded-lg bg-muted/50">
    <p className="text-sm">Optimized view ready for {data?.length ?? 0} items</p>
    <Button className="mt-2" variant="outline" size="sm">
      Load Virtual Table
    </Button>
  </div>
)


// Simple table view for smaller datasets
const SimpleTableView = <T extends Record<string, ReactNode>>({
  data,
  columns
}: {
  data: T[];
  columns: Array<TableColumn<T>>
}) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          {columns?.map((col, i: number) => (
            <th key={i} className="p-2 text-left font-medium">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i: number) => (
          <tr key={i} className="border-b hover:bg-muted/50">
            {columns.map((col, j: number) => (
              <td key={j} className="p-2">
                {row[col.accessor] ?? null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

// Progressive image loading
export const ProgressiveImage = ({
  src,
  alt,
  className = "",
  fallback
}: {
  src: string
  alt: string
  className?: string
  fallback?: ReactNode
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div className={`relative ${className}`}>
      {isLoading && !hasError && (
        <Skeleton className="w-full h-full absolute inset-0" />
      )}
      {hasError && fallback && fallback}
      <Image
        src={src}
        alt={alt}
        width={400}
        height={300}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
    </div>
  )
}

// Hook untuk progressive data loading
export function useProgressiveData<T>(
  fetchFunction: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFunction()
      setData(result)
    } catch (error) {
      setError(error as Error)
    } finally {
      setLoading(false)
    }
  }

  const retry = () => {
    setRetryCount((prev) => prev + 1)
    void loadData()
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, retryCount])

  return { data, loading, error, retry }
}

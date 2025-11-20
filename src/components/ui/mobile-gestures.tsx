'use client'

import { Loader2, RefreshCw } from '@/components/icons'
import { type ReactNode, type TouchEvent as ReactTouchEvent, useState, useEffect, useRef, useCallback } from 'react'

import { createClientLogger } from '@/lib/client-logger'
import { cn } from '@/lib/utils'
import { isTouchDevice } from '@/utils/responsive'

const logger = createClientLogger('MobileGestures')



// Pull to Refresh Component
interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  refreshThreshold?: number
  className?: string
  disabled?: boolean
}

export const PullToRefresh = ({
  children,
  onRefresh,
  refreshThreshold = 60,
  className,
  disabled = false
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || !isMobile || window.scrollY > 0 || !e.touches[0]) { return }
    startY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !isMobile || isRefreshing || startY.current === 0 || !e.touches[0]) { return }

    currentY.current = e.touches[0].clientY
    const distance = currentY.current - startY.current

    if (distance > 0 && window.scrollY === 0) {
      // Prevent default scrolling when pulling down at top
      e.preventDefault()

      // Apply resistance to the pull
      const resistance = 0.5
      const adjustedDistance = distance * resistance

      setPullDistance(adjustedDistance)
      setCanRefresh(adjustedDistance >= refreshThreshold)
    }
  }

  const handleTouchEnd = async () => {
    if (disabled || !isMobile || startY.current === 0) { return }

    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } catch (_error: unknown) {
        logger.error({ error: _error }, 'Refresh failed:')
      } finally {
        setIsRefreshing(false)
      }
    }

    // Reset states
    setPullDistance(0)
    setCanRefresh(false)
    startY.current = 0
    currentY.current = 0
  }

  useEffect(() => {
    if (!isMobile) { return }

    const element = document['body']

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, disabled, isRefreshing, canRefresh])

  const indicatorRotation = Math.min(pullDistance / refreshThreshold * 180, 180)
  const indicatorOpacity = Math.min(pullDistance / refreshThreshold, 1)

  return (
    <div className={cn("relative", className)}>
      {/* Pull to Refresh Indicator */}
      {isMobile && (pullDistance > 0 || isRefreshing) && (
        <div
          className={cn(
            "fixed top-0 left-0 right-0 z-50",
            "flex items-center justify-center",
            "bg-background/90 backdrop-blur-sm border-b",
            "transition-all duration-200"
          )}
          style={{
            height: isRefreshing ? '60px' : Math.min(pullDistance + 10, 60),
            opacity: isRefreshing ? 1 : indicatorOpacity
          }}
        >
          <div className="flex items-center space-x-2">
            {isRefreshing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-primary">
                  Memperbarui...
                </span>
              </>
            ) : (
              <>
                <RefreshCw
                  className={cn(
                    "h-5 w-5 transition-transform",
                    canRefresh ? "text-primary" : "text-muted-foreground"
                  )}
                  style={{
                    transform: `rotate(${indicatorRotation}deg)`
                  }}
                />
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  canRefresh ? "text-primary" : "text-muted-foreground"
                )}>
                  {canRefresh ? "Lepas untuk memperbarui" : "Tarik untuk memperbarui"}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance, 60)}px)` : 'none',
          transition: pullDistance === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Infinite Scroll Component
interface InfiniteScrollProps {
  children: ReactNode
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  threshold?: number
  className?: string
  loadingComponent?: ReactNode
  endMessage?: ReactNode
}

export const InfiniteScroll = ({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 200,
  className,
  loadingComponent,
  endMessage
}: InfiniteScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isNearBottom, setIsNearBottom] = useState(false)

  const handleScroll = useCallback(() => {
    if (!containerRef.current || loading || !hasMore) { return }

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight)

    if (distanceFromBottom < threshold && !isNearBottom) {
      setIsNearBottom(true)
      onLoadMore()
    } else if (distanceFromBottom >= threshold && isNearBottom) {
      setIsNearBottom(false)
    }
  }, [loading, hasMore, threshold, isNearBottom, onLoadMore])

  useEffect(() => {
    const handleThrottledScroll = throttle(handleScroll, 100)

    window.addEventListener('scroll', handleThrottledScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleThrottledScroll)
  }, [handleScroll])

  // Check if we need to load more on mount (in case content is shorter than viewport)
  useEffect(() => {
    const checkInitialLoad = () => {
      if (document.documentElement.scrollHeight <= window.innerHeight && hasMore && !loading) {
        onLoadMore()
      }
    }

    // Small delay to ensure content is rendered
    const timeout = setTimeout(checkInitialLoad, 100);
    return () => clearTimeout(timeout);
  }, [hasMore, loading, onLoadMore])

  const defaultLoadingComponent = (
    <div className="flex items-center justify-center py-6">
      <div className="flex items-center space-x-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Memuat lebih banyak...</span>
      </div>
    </div>
  )

  const defaultEndMessage = (
    <div className="text-center py-6 text-sm text-muted-foreground">
      Tidak ada lagi data untuk dimuat
    </div>
  )

  return (
    <div ref={containerRef} className={className}>
      {children}

      {/* Loading indicator */}
      {loading && (loadingComponent ?? defaultLoadingComponent)}

      {/* End message */}
      {!hasMore && !loading && (endMessage ?? defaultEndMessage)}
    </div>
  )
}

// Combined Pull to Refresh + Infinite Scroll
interface PullToRefreshInfiniteScrollProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
  refreshing?: boolean
  className?: string
  disabled?: boolean
}

export const PullToRefreshInfiniteScroll = ({
  children,
  onRefresh,
  onLoadMore,
  hasMore,
  loading,
  refreshing = false,
  className,
  disabled = false
}: PullToRefreshInfiniteScrollProps) => (
  <PullToRefresh
    onRefresh={onRefresh}
    className={className}
    disabled={disabled || refreshing}
  >
    <InfiniteScroll
      hasMore={hasMore}
      loading={loading}
      onLoadMore={onLoadMore}
    >
      {children}
    </InfiniteScroll>
  </PullToRefresh>
)

// Swipe Actions Component (for table rows, list items, etc.)
interface SwipeAction {
  id: string
  label: string
  icon?: ReactNode
  color: 'blue' | 'gray' | 'green' | 'red' | 'yellow'
  onClick: () => void
}

interface SwipeActionsProps {
  children: ReactNode
  actions: SwipeAction[]
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
  threshold?: number
  className?: string
}

export const SwipeActions = ({
  children,
  actions,
  onSwipeStart,
  onSwipeEnd,
  threshold = 60,
  className
}: SwipeActionsProps) => {
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isSwipeActive, setIsSwipeActive] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const handleTouchStart = (e: ReactTouchEvent | TouchEvent) => {
    if (!isTouchDevice() || actions.length === 0) { return }

    const touch = 'touches' in e ? e.touches[0] : e
    if (!touch) {return}
    startX.current = touch.clientX
    setIsSwipeActive(true)
    onSwipeStart?.()
  }

  const handleTouchMove = (e: ReactTouchEvent | TouchEvent) => {
    if (!isTouchDevice() || !isSwipeActive || startX.current === 0) { return }

    const touch = 'touches' in e ? e.touches[0] : e
    if (!touch) {return}
    currentX.current = touch.clientX
    const distance = startX.current - currentX.current

    // Only allow swipe to the left to reveal actions
    if (distance > 0) {
      const maxDistance = actions.length * 80 // 80px per action
      setSwipeDistance(Math.min(distance, maxDistance))
    }
  }

  const handleTouchEnd = () => {
    if (!isTouchDevice() || !isSwipeActive) { return }

    setIsSwipeActive(false)
    onSwipeEnd?.()

    // If swipe distance is less than threshold, snap back
    if (swipeDistance < threshold) {
      setSwipeDistance(0)
    } else {
      // Keep actions visible
      const actionWidth = 80
      const visibleActions = Math.min(Math.ceil(swipeDistance / actionWidth), actions.length)
      setSwipeDistance(visibleActions * actionWidth)
    }

    startX.current = 0
    currentX.current = 0
  }

  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    setSwipeDistance(0) // Hide actions after click
  }

  const getActionColor = (color: SwipeAction['color']) => {
    const colors = {
      red: 'bg-secondary0 hover:bg-red-600 text-white',
      green: 'bg-secondary0 hover:bg-green-600 text-white',
      blue: 'bg-secondary0 hover:bg-primary text-white',
      yellow: 'bg-secondary0 hover:bg-yellow-600 text-white',
      gray: 'bg-muted0 hover:bg-primary text-white'
    }
    return colors[color]
  }

  if (!isTouchDevice() || actions.length === 0) {
    return <div className={className}>{children}</div>
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Main content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateX(-${swipeDistance}px)`
        }}
      >
        {children}
      </div>

      {/* Action buttons */}
      {swipeDistance > 0 && (
        <div
          className="absolute top-0 right-0 h-full flex"
          style={{
            transform: `translateX(-${swipeDistance}px)`
          }}
        >
          {actions.map((action, index: number) => (
            <button
              key={action['id']}
              onClick={() => handleActionClick(action)}
              className={cn(
                "w-20 h-full flex flex-col items-center justify-center",
                "transition-colors duration-200",
                "text-xs font-medium",
                getActionColor(action.color)
              )}
              style={{
                opacity: swipeDistance > (index + 1) * 20 ? 1 : 0.5
              }}
            >
              {action.icon && (
                <div className="mb-1">
                  {action.icon}
                </div>
              )}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Utility function for throttling
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

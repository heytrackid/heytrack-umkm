'use client'

import { RefreshCw } from 'lucide-react'
import { useState, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  disabled?: boolean
  threshold?: number
  className?: string
}

export const PullToRefresh = ({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) {return}
    
    // Only start pull if at top of scroll
    if (containerRef.current?.scrollTop === 0 && e.touches[0]) {
      startY.current = e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || startY.current === 0 || !e.touches[0]) {return}

    const currentY = e.touches[0].clientY
    const diff = currentY - startY.current

    // Only allow pull down
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Add resistance (diminishing returns)
      const distance = Math.min(diff * 0.5, threshold * 1.5)
      setPullDistance(distance)
      setShouldRefresh(distance >= threshold)
    }
  }

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing) {return}

    if (shouldRefresh && pullDistance >= threshold) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    // Reset
    setPullDistance(0)
    setShouldRefresh(false)
    startY.current = 0
  }

  const getRotation = () => {
    if (isRefreshing) {return 'animate-spin'}
    if (shouldRefresh) {return 'rotate-180'}
    return 'rotate-0'
  }
  const rotation = getRotation()
  const opacity = pullDistance > 0 ? Math.min(pullDistance / threshold, 1) : 0

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-center items-center transition-all duration-200"
        style={{
          height: pullDistance,
          opacity
        }}
      >
        <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
          <RefreshCw className={cn('h-5 w-5 transition-transform duration-300', rotation)} />
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: `translateY(${Math.min(pullDistance, threshold)}px)`
        }}
      >
        {children}
      </div>
    </div>
  )
}

// Simple hook for pull-to-refresh
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  return { isRefreshing, refresh }
}

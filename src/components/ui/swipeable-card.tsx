'use client'

import { useState, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Edit, Trash2 } from 'lucide-react'

export interface SwipeAction {
  icon: ReactNode
  label: string
  onClick: () => void
  color: 'blue' | 'red' | 'green' | 'yellow'
  side: 'left' | 'right'
}

interface SwipeableCardProps {
  children: ReactNode
  actions?: SwipeAction[]
  threshold?: number
  className?: string
  disabled?: boolean
}

const ACTION_COLORS = {
  blue: 'bg-blue-500 text-white',
  red: 'bg-red-500 text-white',
  green: 'bg-green-500 text-white',
  yellow: 'bg-yellow-500 text-white'
}

export const SwipeableCard = ({
  children,
  actions = [],
  threshold = 100,
  className,
  disabled = false
}: SwipeableCardProps) => {
  const [swipeDistance, setSwipeDistance] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const leftActions = actions.filter(a => a.side === 'left')
  const rightActions = actions.filter(a => a.side === 'right')

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) {return}
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) {return}
    currentX.current = e.touches[0].clientX
    const diff = currentX.current - startX.current
    
    // Limit swipe distance
    const maxSwipe = threshold * 1.2
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff))
    
    setSwipeDistance(limitedDiff)
  }

  const handleTouchEnd = () => {
    if (disabled) {return}

    // Check if threshold reached
    if (Math.abs(swipeDistance) >= threshold) {
      // Find the action to trigger
      const action = swipeDistance > 0 
        ? leftActions[0] 
        : rightActions[0]

      if (action) {
        setIsAnimating(true)
        // Animate out
        setTimeout(() => {
          action.onClick()
          resetSwipe()
        }, 200)
        return
      }
    }

    // Reset if threshold not reached
    resetSwipe()
  }

  const resetSwipe = () => {
    setIsAnimating(true)
    setSwipeDistance(0)
    setTimeout(() => setIsAnimating(false), 200)
  }

  const actionOpacity = Math.min(Math.abs(swipeDistance) / threshold, 1)

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Left actions background */}
      {leftActions.length > 0 && swipeDistance > 0 && (
        <div className="absolute inset-y-0 left-0 flex items-center">
          {leftActions.map((action, i) => (
            <div
              key={i}
              className={cn(
                'h-full flex items-center justify-center px-6 transition-opacity',
                ACTION_COLORS[action.color]
              )}
              style={{ 
                opacity: actionOpacity,
                width: Math.abs(swipeDistance)
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Right actions background */}
      {rightActions.length > 0 && swipeDistance < 0 && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {rightActions.map((action, i) => (
            <div
              key={i}
              className={cn(
                'h-full flex items-center justify-center px-6 transition-opacity',
                ACTION_COLORS[action.color]
              )}
              style={{ 
                opacity: actionOpacity,
                width: Math.abs(swipeDistance)
              }}
            >
              <div className="flex flex-col items-center gap-1">
                {action.icon}
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card content */}
      <div
        className={cn(
          'relative bg-background',
          isAnimating && 'transition-transform duration-200 ease-out',
          className
        )}
        style={{
          transform: `translateX(${swipeDistance}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}

// Preset swipe actions
export const SwipeActions = {
  edit: (onClick: () => void): SwipeAction => ({
    icon: <Edit className="h-5 w-5" />,
    label: 'Edit',
    onClick,
    color: 'blue',
    side: 'left'
  }),
  delete: (onClick: () => void): SwipeAction => ({
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Delete',
    onClick,
    color: 'red',
    side: 'right'
  })
}

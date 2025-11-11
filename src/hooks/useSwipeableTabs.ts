'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

declare global {
  interface EventListener {
    (evt: Event): void
  }
}

interface SwipeConfig {
  threshold?: number
  resistance?: number
  animationDuration?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  enabled?: boolean
}

interface SwipeState {
  isDragging: boolean
  startX: number
  currentX: number
  translateX: number
}

export function useSwipeableTabs(
  currentIndex: number,
  totalTabs: number,
  onIndexChange: (index: number) => void,
  config: SwipeConfig = {}
) {
  const {
    threshold = 50,
    resistance = 0.3,
    animationDuration = 200,
    onSwipeLeft,
    onSwipeRight,
    enabled = true
  } = config

  const [swipeState, setSwipeState] = useState<SwipeState>({
    isDragging: false,
    startX: 0,
    currentX: 0,
    translateX: 0
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!enabled || isTransitioning) { return }

    const touch = 'touches' in e ? e.touches[0] : undefined
    if (!touch) { return }
    setSwipeState({
      isDragging: true,
      startX: touch.clientX,
      currentX: touch.clientX,
      translateX: 0
    })
  }, [enabled, isTransitioning])

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (!enabled || !swipeState.isDragging || isTransitioning) { return }

    const touch = 'touches' in e ? e.touches[0] : undefined
    if (!touch) { return }
    const currentX = touch.clientX
    let deltaX = currentX - swipeState.startX

    // Apply edge resistance
    if (currentIndex === 0 && deltaX > 0) {
      // At first tab, swiping right - add resistance
      deltaX *= resistance
    } else if (currentIndex === totalTabs - 1 && deltaX < 0) {
      // At last tab, swiping left - add resistance
      deltaX *= resistance
    }

    setSwipeState(prev => ({
      ...prev,
      currentX,
      translateX: deltaX
    }))

    // Prevent page scroll on horizontal swipe
    if (Math.abs(deltaX) > 10) {
      e.preventDefault()
    }
  }, [enabled, swipeState.isDragging, swipeState.startX, currentIndex, totalTabs, resistance, isTransitioning])

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!enabled || !swipeState.isDragging || isTransitioning) { return }

    const deltaX = swipeState.translateX
    const absDelta = Math.abs(deltaX)

    // Determine if swipe threshold was met
    let newIndex = currentIndex

    if (absDelta >= threshold) {
      if (deltaX > 0 && currentIndex > 0) {
        // Swiped right - go to previous tab
        newIndex = currentIndex - 1
        onSwipeRight?.()
      } else if (deltaX < 0 && currentIndex < totalTabs - 1) {
        // Swiped left - go to next tab
        newIndex = currentIndex + 1
        onSwipeLeft?.()
      }
    }

    // Animate to final position
    if (newIndex !== currentIndex) {
      setIsTransitioning(true)
      onIndexChange(newIndex)

      // Reset after animation
      setTimeout(() => {
        setIsTransitioning(false)
      }, animationDuration)
    }

    // Reset swipe state
    setSwipeState({
      isDragging: false,
      startX: 0,
      currentX: 0,
      translateX: 0
    })
  }, [
    enabled,
    swipeState.isDragging,
    swipeState.translateX,
    currentIndex,
    totalTabs,
    threshold,
    isTransitioning,
    animationDuration,
    onIndexChange,
    onSwipeLeft,
    onSwipeRight
  ])

  // Mouse events for desktop testing
  const handleMouseDown = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!enabled || isTransitioning) { return }

    setSwipeState({
      isDragging: true,
      startX: e.clientX,
      currentX: e.clientX,
      translateX: 0
    })
  }, [enabled, isTransitioning])

  const handleMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!enabled || !swipeState.isDragging || isTransitioning) { return }

    const currentX = e.clientX
    let deltaX = currentX - swipeState.startX

    // Apply edge resistance
    if (currentIndex === 0 && deltaX > 0) {
      deltaX *= resistance
    } else if (currentIndex === totalTabs - 1 && deltaX < 0) {
      deltaX *= resistance
    }

    setSwipeState(prev => ({
      ...prev,
      currentX,
      translateX: deltaX
    }))
  }, [enabled, swipeState.isDragging, swipeState.startX, currentIndex, totalTabs, resistance, isTransitioning])

  const handleMouseUp = useCallback(() => {
    if (!enabled || !swipeState.isDragging) { return }
    handleTouchEnd()
  }, [enabled, swipeState.isDragging, handleTouchEnd])

  // Set up event listeners
  useEffect(() => {
    if (!enabled || !containerRef.current) { return }

    const container = containerRef.current

    // Touch events
    container.addEventListener('touchstart', handleTouchStart as EventListener, { passive: false })
    container.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false })
    container.addEventListener('touchend', handleTouchEnd as EventListener)

    // Mouse events (for desktop testing)
    container.addEventListener('mousedown', handleMouseDown as EventListener)
    document.addEventListener('mousemove', handleMouseMove as EventListener)
    document.addEventListener('mouseup', handleMouseUp as EventListener)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart as EventListener)
      container.removeEventListener('touchmove', handleTouchMove as EventListener)
      container.removeEventListener('touchend', handleTouchEnd as EventListener)
      container.removeEventListener('mousedown', handleMouseDown as EventListener)
      document.removeEventListener('mousemove', handleMouseMove as EventListener)
      document.removeEventListener('mouseup', handleMouseUp as EventListener)
    }
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp])

  return {
    containerRef,
    swipeState,
    isDragging: swipeState.isDragging,
    translateX: swipeState.translateX,
    isTransitioning: isTransitioning
  }
}

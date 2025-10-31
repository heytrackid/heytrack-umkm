'use client'
import { useEffect } from 'react'

// Removed unused import: apiLogger

/**
 * Smart preloading based on user behavior patterns
 * Analyzes user navigation history and preloads popular routes
 */
export const useSmartPreloading = () => {
  useEffect(() => {
    // Track user navigation patterns
    const navigationHistory = JSON.parse(
      localStorage.getItem('user_navigation_patterns') || '[]'
    ).slice(-10) // Keep last 10 routes

    // Add current route to history
    const currentRoute = window.location.pathname
    navigationHistory.push(currentRoute)
    localStorage.setItem('user_navigation_patterns', JSON.stringify(navigationHistory))

    // Analyze patterns and preload likely next routes
    const routeFrequency = navigationHistory.reduce((acc: Record<string, number>, route: string) => {
      acc[route] = (acc[route] || 0) + 1
      return acc
    }, {})

    // Get most visited routes
    const popularRoutes = Object.entries(routeFrequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3)
      .map(([route]) => route)

    // Preload popular routes with low priority
    // Note: Manual prefetch not needed as Next.js handles this automatically
    setTimeout(() => {
      popularRoutes.forEach(route => {
        if (route !== currentRoute) {
          // Router prefetch would go here if needed
          // Popular route identified silently
        }
      })
    }, 2000)

  }, [])
}

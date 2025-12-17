'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


import { GridSkeleton, StatsSkeleton } from '@/components/ui/skeleton-loader'
import { useAuth } from '@/hooks/index'
import { handleError } from '@/lib/error-handling'

import { ReportsLayout } from '@/app/reports/components/ReportsLayout'


// Reports Page - Code Split Version
// This page now uses lazy-loaded report components for better performance




const ReportsPage = () => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()

  const router = useRouter()
  
  // Extract initial date range from URL for consistency across pages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    const to = params.get('to')
    // If needed, dispatch to state/store for children
    // For now, we just ensure URL contains ISO strings
    if (from || to) {
      const url = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState(null, '', url)
    }
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      handleError(new Error('Authentication required'), 'Auth check', false)
      router.push('/auth/login?redirectTo=/reports')
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <StatsSkeleton count={4} />

        {/* Report cards skeleton */}
        <GridSkeleton columns={2} items={4} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ReportsLayout />
    </div>
  )
}

export default ReportsPage
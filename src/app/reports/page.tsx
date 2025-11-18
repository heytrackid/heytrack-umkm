'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useAuth } from '@/hooks/index'
import { toast } from 'sonner'

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
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.')
      router.push('/auth/login?redirectTo=/reports')
    }
  }, [isAuthLoading, isAuthenticated, router])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="space-y-6 p-6">
        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StatsCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>

        {/* Report cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={`card-skeleton-${i}`} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <ReportsLayout />
    </div>
  )
}

export default ReportsPage
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { PageHeader } from '@/components/layout/PageHeader'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { useAuth } from '@/hooks/index'
import { useSupabase } from '@/providers/SupabaseProvider'
import { useToast } from '@/hooks/use-toast'

import { ReportsLayout } from '@/app/reports/components/ReportsLayout'


// Reports Page - Code Split Version
// This page now uses lazy-loaded report components for better performance




const ReportsPage = () => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { supabase } = useSupabase()
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
  const { toast } = useToast()
  const router = useRouter()

  // Handle auth errors with improved double-check
  useEffect(() => {
    const checkAuth = async () => {
      // Wait for auth to stabilize (prevent race condition)
      await new Promise(resolve => setTimeout(resolve, 300))

      if (!isAuthLoading && !isAuthenticated) {
        // Double-check with Supabase directly before redirecting
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.user) {
            toast({
              title: 'Sesi berakhir',
              description: 'Sesi Anda telah berakhir. Silakan login kembali.',
              variant: 'destructive',
            })
            router.push('/auth/login?redirectTo=/reports')
          }
        } catch (error) {
          // If session check fails, redirect to login
          console.warn('Auth check failed, redirecting to login:', error)
          toast({
            title: 'Sesi berakhir',
            description: 'Sesi Anda telah berakhir. Silakan login kembali.',
            variant: 'destructive',
          })
          router.push('/auth/login?redirectTo=/reports')
        }
      }
    }

    checkAuth()
  }, [isAuthLoading, isAuthenticated, router, toast, supabase.auth])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="space-y-6 p-6">
        {/* Header - Always visible */}
        <PageHeader title="Laporan" description="Analisis performa bisnis Anda" />

        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StatsCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>

        {/* Report cards skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={`card-skeleton-${i}`} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader title="Laporan" description="Analisis performa bisnis Anda" />

      </div>
      <ReportsLayout />
    </div>
  )
}

export default ReportsPage
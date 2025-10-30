// Reports Page - Code Split Version
// This page now uses lazy-loaded report components for better performance

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { ReportsLayout } from './components/ReportsLayout'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'

export default function ReportsPage() {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  // Handle auth errors
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: 'Sesi berakhir',
        description: 'Sesi Anda telah berakhir. Silakan login kembali.',
        variant: 'destructive',
      })
      void router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        {/* Header - Always visible */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Laporan
            </h1>
            <p className="text-muted-foreground mt-1">
              Analisis performa bisnis Anda
            </p>
          </div>
        </div>

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

  return <ReportsLayout />
}

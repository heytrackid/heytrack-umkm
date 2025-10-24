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
      router.push('/auth/login')
    }
  }, [isAuthLoading, isAuthenticated, router, toast])

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Laporan
          </h1>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return <ReportsLayout />
}

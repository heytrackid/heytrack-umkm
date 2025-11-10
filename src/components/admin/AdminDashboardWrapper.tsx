'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const LoadingSkeleton = (): JSX.Element => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2">
      <div className="h-64 sm:h-96 bg-muted animate-pulse rounded-lg" />
      <div className="h-64 sm:h-96 bg-muted animate-pulse rounded-lg" />
    </div>
  </div>
)

const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })), {
  loading: LoadingSkeleton,
  ssr: false
})

interface AdminDashboardWrapperProps {
  userId: string
}

export const AdminDashboardWrapper = ({ userId }: AdminDashboardWrapperProps): JSX.Element => (
  <Suspense fallback={<LoadingSkeleton />}>
    <AdminDashboard userId={userId} />
  </Suspense>
)
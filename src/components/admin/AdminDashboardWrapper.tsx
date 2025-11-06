'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const AdminDashboard = dynamic(() => import('@/components/admin/AdminDashboard'), {
  loading: () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  ),
  ssr: false
})

interface AdminDashboardWrapperProps {
  userId: string
}

export const AdminDashboardWrapper = ({ userId }: AdminDashboardWrapperProps) => (
  <Suspense fallback={
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  }>
    <AdminDashboard userId={userId} />
  </Suspense>
)
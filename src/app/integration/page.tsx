'use client'

import AppLayout from '@/components/layout/app-layout'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const IntegrationDashboard = dynamic(() => import('../production/components/IntegrationDashboard'), {
  loading: () => <Skeleton className="h-64 w-full" />
})

export default function IntegrationPage() {
  return (
    <AppLayout>
      <div className="p-6">
        <IntegrationDashboard />
      </div>
    </AppLayout>
  )
}
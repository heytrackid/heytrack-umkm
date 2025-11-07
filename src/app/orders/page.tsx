'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import AppLayout from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load the heavy orders page component
const OrdersContent = dynamic(
  () => import('@/modules/orders/components/OrdersPage'),
  {
    loading: () => <DataGridSkeleton rows={8} />,
    ssr: false
  }
)

const OrdersPage = () => (
  <AppLayout>
    <div className="p-6">
      <Suspense fallback={<DataGridSkeleton rows={8} />}>
        <OrdersContent />
      </Suspense>
    </div>
  </AppLayout>
)

export default OrdersPage

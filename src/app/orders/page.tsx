'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load the heavy orders page component
const OrdersContent = dynamic(
  () => import('@/modules/orders/components/OrdersPage').then(m => ({ default: m.OrdersPage })),
  {
    loading: () => <DataGridSkeleton rows={8} />,
    ssr: false
  }
)

const OrdersPage = () => (
  <AppLayout>
    <Suspense fallback={<DataGridSkeleton rows={8} />}>
      <OrdersContent />
    </Suspense>
  </AppLayout>
)

export default OrdersPage
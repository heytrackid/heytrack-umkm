'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

// Lazy load the heavy orders page component
const OrdersContent = dynamic(
  () => import('@/modules/orders/components/OrdersPage')
    .then(m => ({ default: m.OrdersPage }))
    .catch((error) => {
      console.error('Failed to load OrdersPage:', error)
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load orders page</div> }
    }),
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
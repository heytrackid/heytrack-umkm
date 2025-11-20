'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { TableSkeleton } from '@/components/ui/skeleton-loader'

// Lazy load the heavy orders page component
const OrdersContent = dynamic(
  () => import('@/modules/orders/components/OrdersPage')
    .then(m => ({ default: m.OrdersPage }))
    .catch(() => {
      return { default: () => <div className="p-4 text-center text-red-600">Failed to load orders page</div> }
    }),
  {
    loading: () => <TableSkeleton rows={8} columns={6} />,
    ssr: false
  }
)

const OrdersPage = () => (
  <AppLayout>
    <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
      <OrdersContent />
    </Suspense>
  </AppLayout>
)

export default OrdersPage
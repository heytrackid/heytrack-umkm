'use client'

import { Suspense } from 'react'
import AppLayout from '@/components/layout/app-layout'
import OrdersContent from '@/modules/orders/components/OrdersPage'
import { DataGridSkeleton } from '@/components/ui/skeletons/table-skeletons'

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

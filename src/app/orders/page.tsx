'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

import { AppLayout } from '@/components/layout/app-layout'
import { DateRangePicker, type DateRangeValue } from '@/components/ui/date-range'
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
    <div className="p-6">
      <Suspense fallback={<DataGridSkeleton rows={8} />}>
        <OrdersContent />
      </Suspense>
    </div>
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Orders</h1>
        <div className="hidden md:block">
          <DateRangePicker
            onChange={(range: DateRangeValue) => {
              const params = new URLSearchParams(window.location.search)
              if (range.from) params.set('from', range.from.toISOString())
              if (range.to) params.set('to', range.to.toISOString())
              const url = `${window.location.pathname}?${params.toString()}`
              window.history.replaceState(null, '', url)
            }}
          />
        </div>
      </div>
    </div>
  </AppLayout>
)

export default OrdersPage
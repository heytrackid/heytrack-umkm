'use client'

import dynamic from 'next/dynamic'
import { Suspense, useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Loading skeletons for each component
const CustomerStepSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-10 w-48" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
)

const ItemsStepSkeleton = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="space-y-4">
      {Array(2).fill(0).map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Array(5).fill(0).map((_, j) => (
              <div key={j} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

const DeliveryStepSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-40" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-20 w-full" />
    </div>
  </div>
)

const PaymentStepSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-32" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array(3).fill(0).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
)

const SummarySkeleton = () => (
  <Card>
    <CardContent className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="space-y-3">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-2 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
)

// Dynamically import order step components
const OrderCustomerStep = dynamic(() => import('@/components'), {
  ssr: false,
  loading: () => <CustomerStepSkeleton />
})

const OrderItemsStep = dynamic(() => import('@/components'), {
  ssr: false,
  loading: () => <ItemsStepSkeleton />
})

const OrderDeliveryStep = dynamic(() => import('@/components'), {
  ssr: false,
  loading: () => <DeliveryStepSkeleton />
})

const OrderPaymentStep = dynamic(() => import('@/components'), {
  ssr: false,
  loading: () => <PaymentStepSkeleton />
})

const OrderSummary = dynamic(() => import('@/components'), {
  ssr: false,
  loading: () => <SummarySkeleton />
})

// Progressive loading components
interface LazyOrderComponentsProps {
  activeTab: string
  [key: string]: any
}

export const LazyOrderCustomer = (props: any) => {
  return (
    <Suspense fallback={<CustomerStepSkeleton />}>
      <OrderCustomerStep {...props} />
    </Suspense>
  )
}

export const LazyOrderItems = (props: any) => {
  return (
    <Suspense fallback={<ItemsStepSkeleton />}>
      <OrderItemsStep {...props} />
    </Suspense>
  )
}

export const LazyOrderDelivery = (props: any) => {
  return (
    <Suspense fallback={<DeliveryStepSkeleton />}>
      <OrderDeliveryStep {...props} />
    </Suspense>
  )
}

export const LazyOrderPayment = (props: any) => {
  return (
    <Suspense fallback={<PaymentStepSkeleton />}>
      <OrderPaymentStep {...props} />
    </Suspense>
  )
}

export const LazyOrderSummary = (props: any) => {
  return (
    <Suspense fallback={<SummarySkeleton />}>
      <OrderSummary {...props} />
    </Suspense>
  )
}

// Preloading utilities for better UX
export const preloadOrderComponents = {
  customer: () => import('@/components'),
  items: () => import('@/components'),
  delivery: () => import('@/components'),
  payment: () => import('@/components'),
  summary: () => import('@/components')
}

// Main progressive loading wrapper
export default function LazyOrderComponents({
  activeTab,
  ...props
}: LazyOrderComponentsProps) {
  // Preload next likely component based on current tab
  useMemo(() => {
    const preloadMap: { [key: string]: string[] } = {
      customer: ['items', 'summary'],
      items: ['delivery', 'summary'], 
      delivery: ['payment', 'summary'],
      payment: ['summary']
    }
    
    const toPreload = preloadMap[activeTab] || []
    toPreload.forEach(componentName => {
      const preloader = preloadOrderComponents[componentName as keyof typeof preloadOrderComponents]
      if (preloader) {
        preloader().catch(() => {}) // Silently handle preload failures
      }
    })
  }, [activeTab])

  return null // This is just a utility component
}

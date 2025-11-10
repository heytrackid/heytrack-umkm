import { lazy, Suspense } from 'react'

import { StockAlertsSkeleton } from '@/app/dashboard/components/StockAlertsSkeleton'

import type { DashboardComponentProps } from '@/app/dashboard/components/lazy-types'


const LazyStockAlertsSection = lazy(() => import('./StockAlertsSection').then(m => ({ default: m.StockAlertsSection })))

const StockAlertsSectionWithSuspense = (props: DashboardComponentProps): JSX.Element => (
  <Suspense fallback={<StockAlertsSkeleton />}>
    <LazyStockAlertsSection {...props} />
  </Suspense>
)

export { StockAlertsSectionWithSuspense }
import { lazy, Suspense } from 'react'

const LazyHppDashboardWidget = lazy(() => import('./HppDashboardWidget').then(m => ({ default: m.HppDashboardWidget })))

const HppDashboardWidgetWithSuspense = (): JSX.Element => (
  <Suspense fallback={<div className="h-80 bg-gray-100 animate-pulse rounded-lg" />}>
    <LazyHppDashboardWidget />
  </Suspense>
)

export { HppDashboardWidgetWithSuspense }
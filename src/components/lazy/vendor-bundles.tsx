'use client'

import { lazy, Suspense, useState, useEffect, type ComponentType } from 'react'
import { Card, CardContent } from '@/components/ui/card'

// Loading fallbacks for different vendor libraries
const VendorLoadingSkeleton = ({ name }: { name: string }) => (
  <Card className="w-full">
    <CardContent className="p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <span className="ml-3 text-sm">Loading {name}...</span>
    </CardContent>
  </Card>
)

// Recharts Bundle (Heavy charting library)
export const LazyRechartsBundle = {
  LineChart: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.LineChart }))),
  BarChart: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.BarChart }))),
  AreaChart: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.AreaChart }))),
  PieChart: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.PieChart }))),
  RadarChart: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.RadarChart }))),
  ComposedChart: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.ComposedChart }))),

  // Recharts components
  XAxis: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.XAxis }))),
  YAxis: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.YAxis }))),
  CartesianGrid: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.CartesianGrid }))),
  Tooltip: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.Tooltip }))),
  Legend: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.Legend }))),
  ResponsiveContainer: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.ResponsiveContainer }))),

  // Chart elements
  Line: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.Line }))),
  Bar: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.Bar }))),
  Area: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.Area }))),
  Cell: lazy(() => import(/* webpackChunkName: "recharts" */ 'recharts').then(m => ({ default: m.Cell }))),
}

// Radix UI Complex Components Bundle (yang tidak semua pages butuh)
export const LazyRadixBundle = {
  // Navigation & Menu
  NavigationMenu: lazy(() => import(/* webpackChunkName: "radix-navigation-menu" */ '@radix-ui/react-navigation-menu').then(m => ({ default: m.Root }))),
  Menubar: lazy(() => import(/* webpackChunkName: "radix-menubar" */ '@radix-ui/react-menubar').then(m => ({ default: m.Root }))),
  ContextMenu: lazy(() => import(/* webpackChunkName: "radix-context-menu" */ '@radix-ui/react-context-menu').then(m => ({ default: m.Root }))),

  // Layout & Container
  ScrollArea: lazy(() => import(/* webpackChunkName: "radix-scroll-area" */ '@radix-ui/react-scroll-area').then(m => ({ default: m.Root }))),
  Separator: lazy(() => import(/* webpackChunkName: "radix-separator" */ '@radix-ui/react-separator').then(m => ({ default: m.Root }))),
  AspectRatio: lazy(() => import(/* webpackChunkName: "radix-aspect-ratio" */ '@radix-ui/react-aspect-ratio').then(m => ({ default: m.Root }))),

  // Advanced Inputs
  Slider: lazy(() => import(/* webpackChunkName: "radix-slider" */ '@radix-ui/react-slider').then(m => ({ default: m.Root }))),
  RadioGroup: lazy(() => import(/* webpackChunkName: "radix-radio-group" */ '@radix-ui/react-radio-group').then(m => ({ default: m.Root }))),
  ToggleGroup: lazy(() => import(/* webpackChunkName: "radix-toggle-group" */ '@radix-ui/react-toggle-group').then(m => ({ default: m.Root }))),

  // Overlay & Modal
  HoverCard: lazy(() => import(/* webpackChunkName: "radix-hover-card" */ '@radix-ui/react-hover-card').then(m => ({ default: m.Root }))),
  Popover: lazy(() => import(/* webpackChunkName: "radix-popover" */ '@radix-ui/react-popover').then(m => ({ default: m.Root }))),
  Toast: lazy(() => import(/* webpackChunkName: "radix-toast" */ '@radix-ui/react-toast').then(m => ({ default: m.Root }))),
}

// React Hook Form Bundle (Form libraries) - Commented out due to TypeScript issues
// These libraries export utilities, not React components
// export const LazyFormBundle = {
//   ReactHookForm: lazy(() => import('@/components')),
//   ZodResolver: lazy(() => import('@/components').then(m => ({ default: m.zodResolver }))),
//   Zod: lazy(() => import('@/components')),
// }

// Date & Time Libraries Bundle - Fixed to only include React components
export const LazyDateBundle = {
  // DateFns: lazy(() => import('date-fns')), // Utility library, not a component
  ReactDayPicker: lazy(() => import(/* webpackChunkName: "react-day-picker" */ 'react-day-picker').then(m => ({ default: m.DayPicker }))),
}

// Table Libraries Bundle - Commented out as it exports utilities not components
// export const LazyTableBundle = {
//   ReactTable: lazy(() => import('@/components')),
// }

// Wrapper components untuk vendor libraries
export function RechartsWithLoading<T = Record<string, unknown>>(
  ChartComponent: ComponentType<T>,
  chartName: string
) {
  return function WrappedChart(props: T) {
    return (
      <Suspense fallback={<VendorLoadingSkeleton name={`${chartName} Chart`} />}>
        <ChartComponent {...props} />
      </Suspense>
    )
  }
}

export function RadixWithLoading<T = Record<string, unknown>>(
  RadixComponent: ComponentType<T>,
  componentName: string
) {
  return function WrappedComponent(props: T) {
    return (
      <Suspense fallback={<VendorLoadingSkeleton name={`${componentName} Component`} />}>
        <RadixComponent {...props} />
      </Suspense>
    )
  }
}

// Pre-wrapped common components
export function LineChartWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Line Chart" />}>
      <LazyRechartsBundle.LineChart {...props} />
    </Suspense>
  )
}

export function BarChartWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Bar Chart" />}>
      <LazyRechartsBundle.BarChart {...props} />
    </Suspense>
  )
}

export function AreaChartWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Area Chart" />}>
      <LazyRechartsBundle.AreaChart {...props} />
    </Suspense>
  )
}

export function PieChartWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Pie Chart" />}>
      <LazyRechartsBundle.PieChart {...props} />
    </Suspense>
  )
}

export function NavigationMenuWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Navigation Menu" />}>
      <LazyRadixBundle.NavigationMenu {...props} />
    </Suspense>
  )
}

export function ScrollAreaWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Scroll Area" />}>
      <LazyRadixBundle.ScrollArea {...props} />
    </Suspense>
  )
}

export function HoverCardWithSuspense<T = Record<string, unknown>>(props: T) {
  return (
    <Suspense fallback={<VendorLoadingSkeleton name="Hover Card" />}>
      <LazyRadixBundle.HoverCard {...props} />
    </Suspense>
  )
}

// Utility untuk conditional vendor loading
export const loadVendorWhenNeeded = async (vendorName: string) => {
  switch (vendorName) {
    case 'recharts':
      return import(/* webpackChunkName: "recharts" */ 'recharts')
    case 'radix-navigation':
      return import(/* webpackChunkName: "radix-navigation-menu" */ '@radix-ui/react-navigation-menu')
    case 'radix-scroll':
      return import(/* webpackChunkName: "radix-scroll-area" */ '@radix-ui/react-scroll-area')
    case 'react-hook-form':
      return import(/* webpackChunkName: "react-hook-form" */ 'react-hook-form')
    case 'zod':
      return import(/* webpackChunkName: "zod" */ 'zod')
    case 'date-fns':
      return import(/* webpackChunkName: "date-fns" */ 'date-fns')
    case 'react-table':
      return import(/* webpackChunkName: "react-table" */ '@tanstack/react-table')
    default:
      throw new Error(`Unknown vendor: ${vendorName}`)
  }
}

// Hook untuk lazy vendor loading dengan error handling
export const useVendorLib = <T = Record<string, unknown>>(vendorName: string) => {
  const [lib, setLib] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    void loadVendorWhenNeeded(vendorName)
      .then(module => {
        void setLib(module as T)
        void setLoading(false)
      })
      .catch(err => {
        void setError(err instanceof Error ? err : new Error(String(err)))
        void setLoading(false)
      })
  }, [vendorName])

  return { lib, loading, error }
}

// Progressive vendor loading strategy
export const VendorLoadingStrategy = {
  // Essential vendors (load immediately)
  essential: ['react', 'react-dom', 'next'],

  // UI vendors (load on first UI interaction)
  ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-button'],

  // Chart vendors (load when charts are needed)
  charts: ['recharts'],

  // Form vendors (load when forms are opened)
  forms: ['react-hook-form', '@hookform/resolvers', 'zod'],

  // Advanced vendors (load on demand)
  advanced: ['@tanstack/react-table', '@radix-ui/react-navigation-menu'],

  // Mobile vendors (load on mobile detection)
  mobile: ['vaul', 'embla-carousel-react'],
}

// Bundle size estimates (untuk monitoring)
export const VendorBundleSizes = {
  'recharts': '~180kb',
  'react-hook-form': '~25kb',
  'zod': '~50kb',
  '@tanstack/react-table': '~90kb',
  'date-fns': '~80kb',
  '@radix-ui/react-navigation-menu': '~35kb',
  '@radix-ui/react-scroll-area': '~15kb',
  'vaul': '~20kb',
  'embla-carousel-react': '~40kb',
}
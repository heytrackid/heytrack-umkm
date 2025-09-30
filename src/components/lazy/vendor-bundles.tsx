'use client'

import { lazy, Suspense, ComponentType, useState, useEffect } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

// Loading fallbacks for different vendor libraries
const VendorLoadingSkeleton = ({ name }: { name: string }) => (
  <Card className="w-full">
    <CardContent className="p-6 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-3 text-sm">Loading {name}...</span>
    </CardContent>
  </Card>
)

// Recharts Bundle (Heavy charting library)
export const LazyRechartsBundle = {
  LineChart: lazy(() => import('@/components').then(m => ({ default: m.LineChart }))),
  BarChart: lazy(() => import('@/components').then(m => ({ default: m.BarChart }))),
  AreaChart: lazy(() => import('@/components').then(m => ({ default: m.AreaChart }))),
  PieChart: lazy(() => import('@/components').then(m => ({ default: m.PieChart }))),
  RadarChart: lazy(() => import('@/components').then(m => ({ default: m.RadarChart }))),
  ComposedChart: lazy(() => import('@/components').then(m => ({ default: m.ComposedChart }))),
  
  // Recharts components
  XAxis: lazy(() => import('@/components').then(m => ({ default: m.XAxis }))),
  YAxis: lazy(() => import('@/components').then(m => ({ default: m.YAxis }))),
  CartesianGrid: lazy(() => import('@/components').then(m => ({ default: m.CartesianGrid }))),
  Tooltip: lazy(() => import('@/components').then(m => ({ default: m.Tooltip }))),
  Legend: lazy(() => import('@/components').then(m => ({ default: m.Legend }))),
  ResponsiveContainer: lazy(() => import('@/components').then(m => ({ default: m.ResponsiveContainer }))),
  
  // Chart elements
  Line: lazy(() => import('@/components').then(m => ({ default: m.Line }))),
  Bar: lazy(() => import('@/components').then(m => ({ default: m.Bar }))),
  Area: lazy(() => import('@/components').then(m => ({ default: m.Area }))),
  Cell: lazy(() => import('@/components').then(m => ({ default: m.Cell }))),
}

// Radix UI Complex Components Bundle (yang tidak semua pages butuh)
export const LazyRadixBundle = {
  // Navigation & Menu
  NavigationMenu: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  Menubar: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  ContextMenu: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  
  // Layout & Container
  ScrollArea: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  Separator: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  AspectRatio: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  
  // Advanced Inputs
  Slider: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  RadioGroup: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  ToggleGroup: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  
  // Overlay & Modal
  HoverCard: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  Popover: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
  Toast: lazy(() => import('@/components').then(m => ({ default: m.Root }))),
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
  // DateFns: lazy(() => import('@/components')), // Utility library, not a component
  ReactDayPicker: lazy(() => import('@/components').then(m => ({ default: m.DayPicker }))),
}

// Table Libraries Bundle - Commented out as it exports utilities not components
// export const LazyTableBundle = {
//   ReactTable: lazy(() => import('@/components')),
// }

// Wrapper components untuk vendor libraries
export const RechartsWithLoading = <T extends ComponentType<any>>(
  ChartComponent: T,
  chartName: string
) => {
  return (props: any) => (
    <Suspense fallback={<VendorLoadingSkeleton name={`${chartName} Chart`} />}>
      <ChartComponent {...props} />
    </Suspense>
  )
}

export const RadixWithLoading = <T extends ComponentType<any>>(
  RadixComponent: T,
  componentName: string
) => {
  return (props: any) => (
    <Suspense fallback={<VendorLoadingSkeleton name={`${componentName} Component`} />}>
      <RadixComponent {...props} />
    </Suspense>
  )
}

// Pre-wrapped common components
export const LineChartWithSuspense = RechartsWithLoading(LazyRechartsBundle.LineChart, 'Line')
export const BarChartWithSuspense = RechartsWithLoading(LazyRechartsBundle.BarChart, 'Bar')
export const AreaChartWithSuspense = RechartsWithLoading(LazyRechartsBundle.AreaChart, 'Area')
export const PieChartWithSuspense = RechartsWithLoading(LazyRechartsBundle.PieChart, 'Pie')

export const NavigationMenuWithSuspense = RadixWithLoading(LazyRadixBundle.NavigationMenu, 'Navigation Menu')
export const ScrollAreaWithSuspense = RadixWithLoading(LazyRadixBundle.ScrollArea, 'Scroll Area')
export const HoverCardWithSuspense = RadixWithLoading(LazyRadixBundle.HoverCard, 'Hover Card')

// Utility untuk conditional vendor loading
export const loadVendorWhenNeeded = async (vendorName: string, componentName?: string) => {
  switch (vendorName) {
    case 'recharts':
      return import('@/components')
    case 'radix-navigation':
      return import('@/components')
    case 'radix-scroll':
      return import('@/components')
    case 'react-hook-form':
      return import('@/components')
    case 'zod':
      return import('@/components')
    case 'date-fns':
      return import('@/components')
    case 'react-table':
      return import('@/components')
    default:
      throw new Error(`Unknown vendor: ${vendorName}`)
  }
}

// Hook untuk lazy vendor loading dengan error handling
export const useVendorLib = (vendorName: string) => {
  const [lib, setLib] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    loadVendorWhenNeeded(vendorName)
      .then(module => {
        setLib(module)
        setLoading(false)
      })
      .catch(err => {
        setError(err)
        setLoading(false)
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
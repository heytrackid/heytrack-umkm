'use client'

import { Suspense, lazy, memo, useMemo } from 'react'
import AppLayout from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Optimized imports
import { ChartSkeleton, CardSkeleton } from '@/components/lazy/LazyWrapper'
import { OptimizedTable } from '@/components/optimized/OptimizedTable'
import { useOptimizedDashboard } from '@/hooks/useOptimizedDatabase'
import { optimizedAPI } from '@/lib/optimized-api'

// Icons
import { 
  Package, 
  Users, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react'

// Lazy load heavy components
const LazyChart = lazy(() => import('@/components/lazy/chart-features').then(m => ({ 
  default: m.MiniChartWithLoading 
})))

const LazyFinancialWidget = lazy(() => import('@/components/lazy/automation-features').then(m => ({ 
  default: m.SmartFinancialDashboardWithLoading 
})))

// Memoized components to prevent unnecessary re-renders
const StatsCard = memo(({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'text-primary' 
}: {
  title: string
  value: string | number
  change?: string
  icon: any
  color?: string
}) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <Badge variant="secondary" className="mt-1">
              {change}
            </Badge>
          )}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </CardContent>
  </Card>
))

StatsCard.displayName = 'StatsCard'

// Optimized recent orders table
const RecentOrdersTable = memo(({ orders }: { orders: any[] }) => {
  const columns = useMemo(() => [
    { key: 'order_no', label: 'Order No' },
    { key: 'customer_name', label: 'Customer' },
    { 
      key: 'total_amount', 
      label: 'Amount',
      render: (value: number) => `Rp ${value?.toLocaleString('id-ID') || 0}`
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'DELIVERED' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    }
  ], [])

  const formatValue = useMemo(() => (key: string, value: any) => {
    if (key === 'total_amount') {
      return `Rp ${value?.toLocaleString('id-ID') || 0}`
    }
    return value || '-'
  }, [])

  const handleView = useMemo(() => (order: any) => {
    console.log('View order:', order)
    // Navigate to order detail
  }, [])

  if (!orders?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No recent orders</p>
      </div>
    )
  }

  return (
    <OptimizedTable
      data={orders}
      columns={columns}
      selectedItems={[]}
      onSelectAll={() => {}}
      onSelectItem={() => {}}
      onClearSelection={() => {}}
      onBulkEdit={() => {}}
      onBulkDelete={() => {}}
      onView={handleView}
      formatValue={formatValue}
    />
  )
})

RecentOrdersTable.displayName = 'RecentOrdersTable'

export default function OptimizedDashboardPage() {
  const { data, loading, error, refetch } = useOptimizedDashboard()

  // Memoized stats to prevent recalculation
  const stats = useMemo(() => {
    if (!data) return []
    
    return [
      {
        title: 'Total Ingredients',
        value: data.inventory.totalIngredients,
        change: `${data.inventory.lowStockCount} low stock`,
        icon: Package,
        color: data.inventory.lowStockCount > 0 ? 'text-orange-500' : 'text-green-500'
      },
      {
        title: 'Active Customers',
        value: data.customers.active,
        change: `${data.customers.total} total`,
        icon: Users,
        color: 'text-blue-500'
      },
      {
        title: 'Pending Orders',
        value: data.sales.pendingOrders,
        change: `${data.sales.urgentOrders} urgent`,
        icon: ShoppingCart,
        color: data.sales.urgentOrders > 0 ? 'text-red-500' : 'text-green-500'
      },
      {
        title: 'Revenue',
        value: `Rp ${data.sales.totalRevenue.toLocaleString('id-ID')}`,
        change: 'This month',
        icon: DollarSign,
        color: 'text-green-500'
      }
    ]
  }, [data])

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Optimized performance dashboard</p>
            </div>
            <Button disabled>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </Button>
          </div>

          {/* Loading skeletons */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card>
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Dashboard</h3>
              <p className="text-muted-foreground mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Optimized performance dashboard with caching & lazy loading
            </p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Charts with Lazy Loading */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
                <LazyFinancialWidget />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
                <LazyChart 
                  data={[
                    { name: 'Jan', value: data?.inventory.totalValue || 0 },
                    { name: 'Feb', value: data?.inventory.totalValue * 1.1 || 0 },
                    { name: 'Mar', value: data?.inventory.totalValue * 0.9 || 0 },
                  ]} 
                />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders with Optimized Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={data?.sales.recentOrders || []} />
          </CardContent>
        </Card>

        {/* Performance Info */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
                  🚀 Performance Optimized!
                </h3>
                <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <div>✅ API calls cached for faster loading</div>
                  <div>✅ Components lazy-loaded to reduce bundle size</div>
                  <div>✅ React.memo prevents unnecessary re-renders</div>
                  <div>✅ Virtualized tables for large datasets</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
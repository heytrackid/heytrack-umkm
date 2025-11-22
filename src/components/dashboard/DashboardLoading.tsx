import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { HeaderSectionSkeleton } from './loading/HeaderSectionSkeleton'
import { MetricCardsSkeleton } from './loading/MetricCardsSkeleton'
import { ProfitWaterfallSkeleton } from './loading/ProfitWaterfallSkeleton'
import { DataTableSkeleton } from './loading/DataTableSkeleton'

export const DashboardLoading = () => (
  <div className="space-y-6">
    {/* Header Section */}
    <HeaderSectionSkeleton />

    {/* Metric Cards Grid */}
    <MetricCardsSkeleton />

    {/* Profit Waterfall Summary */}
    <ProfitWaterfallSkeleton />

    {/* Data Table */}
    <DataTableSkeleton />

    {/* Additional spacing for other dashboard sections */}
    <div className="space-y-6">
      {/* Production Schedule Widget skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </Card>

      {/* Top Products Widget skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
)
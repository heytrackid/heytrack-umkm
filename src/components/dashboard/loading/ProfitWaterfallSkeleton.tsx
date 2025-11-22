import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const ProfitWaterfallSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-3">
      {/* 4 regular rows */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}

      {/* Net Profit row - emphasized */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  </Card>
)
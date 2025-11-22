import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const MetricCardsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Icon + Badge */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
          </div>
        </div>
        {/* Label + Value */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </Card>
    ))}
  </div>
)
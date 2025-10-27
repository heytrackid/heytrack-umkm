import { Card, CardContent } from '@/components/ui/card'
import { StatsCardSkeleton } from '@/components/ui/skeletons/dashboard-skeletons'
import { FormFieldSkeleton } from '@/components/ui/skeletons/form-skeletons'

export const SettingsLoadingSkeleton = () => (
    <div className="space-y-4">
      {/* Quick Links Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Tab headers skeleton */}
            <div className="flex space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-9 w-20 bg-gray-200 rounded-md animate-pulse" />
              ))}
            </div>

            {/* Form fields skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 6 }, (_, i) => (
                <FormFieldSkeleton key={i} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

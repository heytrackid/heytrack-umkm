export const RecentOrdersSkeleton = (): JSX.Element => (
  <div className="space-y-4">
    <div className="h-12 bg-gray-100 animate-pulse rounded" />
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={`skeleton-${i}`} className="h-16 bg-gray-100 animate-pulse rounded" />
      ))}
    </div>
  </div>
)
export const StatsCardsSkeleton = (): JSX.Element => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {Array.from({ length: 4 }, (_, i) => (
      <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-lg" />
    ))}
  </div>
)
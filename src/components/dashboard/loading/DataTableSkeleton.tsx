import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const DataTableSkeleton = () => {
  // Predefined widths to simulate varying data lengths
  const headerWidths = [80, 65, 90, 70]
  const bodyWidths = [45, 55, 75, 60]

  return (
    <Card className="p-6">
      {/* Header row */}
      <div className="flex gap-4 mb-4 pb-2 border-b border-gray-200">
        {headerWidths.map((width, i) => (
          <Skeleton key={i} className="h-4 bg-gray-300" style={{ width: `${width}px` }} />
        ))}
      </div>

      {/* Body rows */}
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="flex gap-4 mb-3">
          {bodyWidths.map((width, col) => (
            <Skeleton key={col} className="h-4" style={{ width: `${width}px` }} />
          ))}
        </div>
      ))}
    </Card>
  )
}
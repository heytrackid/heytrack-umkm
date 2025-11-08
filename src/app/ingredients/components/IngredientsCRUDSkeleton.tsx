'use client'

const IngredientsCRUDSkeleton = (): JSX.Element => (
  <div className="border rounded-lg p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={`row-${i}`} className="h-16 bg-muted rounded" />
      ))}
    </div>
  </div>
)

export default IngredientsCRUDSkeleton
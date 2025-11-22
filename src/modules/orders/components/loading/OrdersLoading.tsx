import { ShoppingCart } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const OrdersLoading = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-8 w-8" />
          Kelola Pesanan
        </h1>
        <p className="text-muted-foreground">
          Kelola pesanan dan penjualan dengan sistem terintegrasi
        </p>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Stats Cards */}
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </Card>
      ))}
    </div>

    {/* Quick Actions */}
    <Card className="p-4">
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>
    </Card>

    {/* Status Summary */}
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton className="h-8 w-8 rounded-full mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-6 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </Card>

    {/* Tabs */}
    <div className="flex gap-2 border-b pb-2">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-10 w-32" />
      ))}
    </div>

    {/* Content Area */}
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-6 w-24 mt-3" />
        </Card>
      ))}
    </div>
  </div>
)
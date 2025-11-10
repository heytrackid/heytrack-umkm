'use client'

import { ChartBarInteractive } from '@/components/charts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryTrends } from '@/hooks/useInventoryTrends'
import { AlertCircle, Package } from 'lucide-react'

interface InventoryTrendsChartProps {
  days?: number
}

const chartConfig = {
  purchases: {
    label: 'Jumlah Pembelian',
    color: 'hsl(var(--chart-1))',
  },
  cost: {
    label: 'Total Biaya',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export function InventoryTrendsChart({ days = 30 }: InventoryTrendsChartProps) {
  const { data, isLoading, error } = useInventoryTrends({ days })

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Gagal memuat data inventori. Silakan coba lagi.
        </AlertDescription>
      </Alert>
    )
  }

  if (!data?.trends || data.trends.length === 0) {
    return (
      <Alert>
        <Package className="h-4 w-4" />
        <AlertDescription>
          Belum ada data pembelian bahan baku. Mulai dengan mencatat pembelian.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {data.summary && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Bahan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalIngredients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stok Menipis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {data.summary.lowStockCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.summary.totalPurchases}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <div className="min-h-[400px]">
        <ChartBarInteractive
          data={data.trends}
          config={chartConfig}
          title="Tren Pembelian Inventori"
          description={`Data ${days} hari terakhir`}
          defaultChart="purchases"
        />
      </div>
    </div>
  )
}

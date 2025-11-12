'use client'

import { differenceInDays } from 'date-fns'
import { AlertCircle, Package } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { ChartBarInteractive } from '@/components/charts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'

import { Skeleton } from '@/components/ui/skeleton'
import { useInventoryTrends } from '@/hooks/useInventoryTrends'

interface InventoryTrendsChartProps {
  days?: number
  showDatePicker?: boolean
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

export const InventoryTrendsChart = ({ 
  days: initialDays = 30,
  showDatePicker = true 
}: InventoryTrendsChartProps) => {
  const [dateRange, _setDateRange] = useState<DateRange | undefined>()
  
  const days = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return differenceInDays(dateRange.to, dateRange.from) + 1
    }
    return initialDays
  }, [dateRange, initialDays])

  const { data, isLoading, error } = useInventoryTrends({ days })

  const filteredData = useMemo(() => {
    if (!data?.trends || data.trends.length === 0) return []
    if (!dateRange?.from || !dateRange?.to) return data.trends

    const from = dateRange.from
    const to = dateRange.to

    return data.trends.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= from && itemDate <= to
    })
  }, [data, dateRange])

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

  if (!data?.trends || data.trends.length === 0 || filteredData.length === 0) {
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
      {/* Date Filter */}
      {showDatePicker && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Filter Periode</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6">

          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Bahan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{data.summary.totalIngredients}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Stok Menipis
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold text-destructive">
                {data.summary.lowStockCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                Total Pembelian
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
              <div className="text-lg sm:text-2xl font-bold">{data.summary.totalPurchases}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <div className="min-h-[300px] sm:min-h-[400px] overflow-x-auto">
        <ChartBarInteractive
          data={filteredData}
          config={chartConfig}
          title="Tren Pembelian Inventori"
          description={`Menampilkan ${filteredData.length} hari data`}
          defaultChart="purchases"
        />
      </div>
    </div>
  )
}

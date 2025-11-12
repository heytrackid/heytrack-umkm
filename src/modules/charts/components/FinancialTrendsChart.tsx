'use client'

import { differenceInDays } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { ChartLineInteractive } from '@/components/charts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ChartConfig } from '@/components/ui/chart'

import { Skeleton } from '@/components/ui/skeleton'
import { useFinancialTrends } from '@/hooks/useFinancialTrends'

interface FinancialTrendsChartProps {
  days?: number
  showDatePicker?: boolean
}

const chartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: 'hsl(var(--chart-1))',
  },
  profit: {
    label: 'Keuntungan',
    color: 'hsl(var(--chart-2))',
  },
  expenses: {
    label: 'Pengeluaran',
    color: 'hsl(var(--chart-3))',
  },
  hpp: {
    label: 'HPP',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export const FinancialTrendsChart = ({ 
  days: initialDays = 90,
  showDatePicker = true 
}: FinancialTrendsChartProps) => {
  const [dateRange, _setDateRange] = useState<DateRange | undefined>()
  
  const days = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return differenceInDays(dateRange.to, dateRange.from) + 1
    }
    return initialDays
  }, [dateRange, initialDays])

  const { data, isLoading, error } = useFinancialTrends({ days })

  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return []
    if (!dateRange?.from || !dateRange?.to) return data

    return data.filter((item) => {
      const itemDate = new Date(item.date)
      return itemDate >= dateRange.from! && itemDate <= dateRange.to!
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
          Gagal memuat data tren keuangan. Silakan coba lagi.
        </AlertDescription>
      </Alert>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Keuangan</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Belum ada data keuangan. Mulai dengan membuat pesanan atau mencatat pengeluaran.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {showDatePicker && (
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-base sm:text-lg">Filter Periode</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6">

          </CardContent>
        </Card>
      )}
      <div className="min-h-[300px] sm:min-h-[400px] overflow-x-auto">
        <ChartLineInteractive
          data={filteredData}
          config={chartConfig}
          title="Tren Keuangan"
          description={`Menampilkan ${filteredData.length} hari data - Klik tab untuk switch`}
          defaultChart="revenue"
        />
      </div>
    </div>
  )
}

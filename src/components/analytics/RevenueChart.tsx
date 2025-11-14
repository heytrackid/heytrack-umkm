'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useRevenueTrend } from '@/hooks/api/useAnalytics'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface RevenueChartProps {
  days?: number
  height?: number
}

export function RevenueChart({ days = 90, height = 300 }: RevenueChartProps): JSX.Element {
  const { data: trendData, isLoading } = useRevenueTrend(days)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'dd MMM', { locale: id })
  }

  if (isLoading) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className={`h-[${height}px] w-full`} />
        </div>
      </Card>
    )
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Tren Pendapatan ({days} Hari)</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Belum ada data pendapatan
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Tren Pendapatan ({days} Hari)</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value).replace('Rp', 'Rp ')}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            labelFormatter={(label) => format(new Date(label), 'dd MMMM yyyy', { locale: id })}
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [formatCurrency(value), 'Pendapatan']
              return [value, 'Jumlah Pesanan']
            }}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTopProducts } from '@/hooks/api/useAnalytics'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface TopProductsChartProps {
  days?: number
  limit?: number
  height?: number
}

export function TopProductsChart({
  days = 30,
  limit = 10,
  height = 300,
}: TopProductsChartProps): JSX.Element {
  const { data: productsData, isLoading } = useTopProducts(days, limit)

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
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

  if (!productsData || productsData.length === 0) {
    return (
      <Card className="p-6 bg-card border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Produk Terlaris ({days} Hari)</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Belum ada data penjualan
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Produk Terlaris ({days} Hari)</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={productsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="product"
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis
            tickFormatter={(value) => formatCurrency(value).replace('Rp', 'Rp ')}
            stroke="hsl(var(--muted-foreground))"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [formatCurrency(value), 'Pendapatan']
              if (name === 'quantity') return [value, 'Jumlah Terjual']
              if (name === 'orders') return [value, 'Jumlah Pesanan']
              return [value, name]
            }}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          <Bar
            dataKey="revenue"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

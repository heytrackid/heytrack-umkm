'use client'

import { BarChart3 } from 'lucide-react'

import { LazyBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ChartLegend, ResponsiveContainer } from '@/components/charts/LazyCharts'
import type { TooltipContentProps } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'

import { type ProfitPeriodType, type ChartDataPoint, profitPeriodOptions } from '@/app/profit/constants'


interface ProductProfitChartProps {
  chartData: ChartDataPoint[]
  selectedPeriod: ProfitPeriodType
  onPeriodChange: (period: ProfitPeriodType) => void
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  isMobile: boolean
  formatCurrency: (amount: number) => string
}

// Tooltip component extracted to avoid defining components during render
const ProductProfitChartTooltip = (formatCurrency: (amount: number) => string) => {
  const TooltipComponent = (props: TooltipContentProps<number, string>): JSX.Element | null => {
    const { active, payload } = props
    if (active && payload?.length) {
      return (
        <div className="bg-background border rounded-lg p-3 ">
          <p className="font-medium mb-2">{payload[0]?.payload?.name ?? 'Unknown'}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted0" />
              <span>Pendapatan: {formatCurrency((payload[0]?.value ?? 0))}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span>HPP (COGS): {formatCurrency((payload[1]?.value ?? 0))}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-muted0" />
              <span>Laba: {formatCurrency((payload[2]?.value ?? 0))}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }
  TooltipComponent.displayName = 'ProductProfitChartTooltip'
  return TooltipComponent
}

ProductProfitChartTooltip.displayName = 'ProductProfitChartTooltip'

ProductProfitChartTooltip.displayName = 'ProductProfitChartTooltip'

export const ProductProfitChart = ({
  chartData,
  selectedPeriod,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isMobile,
  formatCurrency
}: ProductProfitChartProps) => (
  <Card>
    {chartData.length === 0 ? (
      <CardContent className="py-12">
        <div className="text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">Belum Ada Data untuk Grafik</p>
          <p className="text-sm">Grafik akan muncul setelah ada penjualan produk di periode yang dipilih</p>
        </div>
      </CardContent>
    ) : (
      <>
        <CardHeader>
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Grafik Profitabilitas Produk
              </CardTitle>
              <CardDescription className="mt-1">
                Perbandingan pendapatan, HPP, dan laba per produk (Top 10)
              </CardDescription>
            </div>
            <div className={`flex ${isMobile ? 'flex-col w-full' : 'gap-2'} ${!isMobile && 'gap-2'}`}>
              <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[140px]'} h-9`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {profitPeriodOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPeriod === 'custom' && (
                <div className={`flex gap-2 ${isMobile ? 'mt-2' : ''}`}>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onStartDateChange(e.target.value)}
                    className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                    placeholder="Mulai"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEndDateChange(e.target.value)}
                    className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                    placeholder="Akhir"
                  />
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LazyBarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) { return `${(value / 1000000).toFixed(1)}jt` }
                    if (value >= 1000) { return `${(value / 1000).toFixed(0)}rb` }
                    return String(value)
                  }}
                />
                <Tooltip
                  content={ProductProfitChartTooltip(formatCurrency)}
                />
                <ChartLegend
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value: string) => {
                    const labels: Record<string, string> = {
                      revenue: 'Pendapatan',
                      cogs: 'HPP (COGS)',
                      profit: 'Laba'
                    }
                    return labels[value] ?? value
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="cogs"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </LazyBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </>
    )}
  </Card>
)

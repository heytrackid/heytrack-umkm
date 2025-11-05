'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'
import { LazyBarChart, LazyLineChart, LazyAreaChart, Bar, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ChartLegend, ResponsiveContainer } from '@/components/charts/LazyCharts'
import type { ProductChartData, ProfitFilters, PeriodType } from './types'
import { formatCurrencyAmount } from '@/app/profit/utils/chartData'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { CustomTooltip } from './CustomTooltip'

interface ProductProfitabilityChartProps {
  chartData: ProductChartData[]
  filters: ProfitFilters
  onFiltersChange: (filters: Partial<ProfitFilters>) => void
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export const ProductProfitabilityChart = ({
  chartData,
  filters,
  onFiltersChange,
  formatCurrency,
  isMobile
}: ProductProfitabilityChartProps) => {
  // State to manage chart type
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar')

  return (
    <Card className="border-0 shadow-sm">
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
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-start justify-between'}`}>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grafik Profitabilitas Produk
                </CardTitle>
                <CardDescription className="mt-1">
                  Perbandingan pendapatan, HPP, dan laba per produk (Top 10)
                </CardDescription>
              </div>
              <div className={`flex flex-wrap gap-2 ${isMobile ? 'w-full' : ''}`}>
                <Select
                  value={filters.selectedPeriod}
                  onValueChange={(value: PeriodType) => onFiltersChange({ selectedPeriod: value })}
                >
                  <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[140px]'} h-9`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">7 Hari</SelectItem>
                    <SelectItem value="month">30 Hari</SelectItem>
                    <SelectItem value="quarter">Kuartal</SelectItem>
                    <SelectItem value="year">1 Tahun</SelectItem>
                    <SelectItem value="custom">Kustom</SelectItem>
                  </SelectContent>
                </Select>
                {filters.selectedPeriod === 'custom' && (
                  <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'gap-2'}`}>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => onFiltersChange({ startDate: e.target.value })}
                      className={`h-9 ${isMobile ? 'w-full' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                      placeholder="Mulai"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => onFiltersChange({ endDate: e.target.value })}
                      className={`h-9 ${isMobile ? 'w-full' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                      placeholder="Akhir"
                    />
                  </div>
                )}
                {/* Chart type selector */}
                <Select
                  value={chartType}
                  onValueChange={(value: 'bar' | 'line' | 'area') => setChartType(value)}
                >
                  <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[120px]'} h-9`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {(() => {
                  const commonProps = {
                    data: chartData,
                    children: (
                      <>
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
                          tickFormatter={formatCurrencyAmount}
                        />
                        <Tooltip
                          content={CustomTooltip({ formatCurrency })}
                        />
                        <ChartLegend
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value: string) => {
                            const labels: Record<string, string> = {
                              revenue: 'Pendapatan',
                              cogs: 'HPP (COGS)',
                              profit: 'Laba'
                            }
                            return labels[value] || value
                          }}
                        />
                      </>
                    )
                  }

                  switch (chartType) {
                    case 'bar':
                      return (
                        <LazyBarChart {...commonProps}>
                          {commonProps.children}
                           <Bar
                             dataKey="revenue"
                             fill="hsl(var(--muted))"
                             radius={[4, 4, 0, 0]}
                           />
                           <Bar
                             dataKey="cogs"
                             fill="hsl(var(--muted-foreground))"
                             radius={[4, 4, 0, 0]}
                           />
                           <Bar
                             dataKey="profit"
                             fill="hsl(var(--primary))"
                             radius={[4, 4, 0, 0]}
                           />
                        </LazyBarChart>
                      )
                    case 'line':
                      return (
                        <LazyLineChart {...commonProps}>
                          {commonProps.children}
                           <Line
                             type="monotone"
                             dataKey="revenue"
                             stroke="hsl(var(--muted))"
                             strokeWidth={2}
                             dot={{ r: 4 }}
                             activeDot={{ r: 6 }}
                           />
                           <Line
                             type="monotone"
                             dataKey="cogs"
                             stroke="hsl(var(--muted-foreground))"
                             strokeWidth={2}
                             dot={{ r: 4 }}
                             activeDot={{ r: 6 }}
                           />
                           <Line
                             type="monotone"
                             dataKey="profit"
                             stroke="hsl(var(--primary))"
                             strokeWidth={2}
                             dot={{ r: 4 }}
                             activeDot={{ r: 6 }}
                           />
                        </LazyLineChart>
                      )
                    default:
                      return (
                        <LazyAreaChart {...commonProps}>
                          {commonProps.children}
                           <Area
                             type="monotone"
                             dataKey="revenue"
                             stackId="1"
                             stroke="hsl(var(--muted))"
                             fill="hsl(var(--muted))"
                             fillOpacity={0.6}
                           />
                           <Area
                             type="monotone"
                             dataKey="cogs"
                             stackId="2"
                             stroke="hsl(var(--muted-foreground))"
                             fill="hsl(var(--muted-foreground))"
                             fillOpacity={0.6}
                           />
                           <Area
                             type="monotone"
                             dataKey="profit"
                             stackId="3"
                             stroke="hsl(var(--primary))"
                             fill="hsl(var(--primary))"
                             fillOpacity={0.8}
                           />
                        </LazyAreaChart>
                      )
                  }
                })()}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}

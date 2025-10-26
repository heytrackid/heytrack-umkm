/**
 * Product Profitability Chart Component
 * Interactive chart showing product profitability analysis
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { ProductChartData, ProfitFilters, PeriodType } from './types'
import { formatCurrencyAmount } from '../utils/chartData'

interface ProductProfitabilityChartProps {
  chartData: ProductChartData[]
  filters: ProfitFilters
  onFiltersChange: (filters: Partial<ProfitFilters>) => void
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export function ProductProfitabilityChart({
  chartData,
  filters,
  onFiltersChange,
  formatCurrency,
  isMobile
}: ProductProfitabilityChartProps) {
  return (
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
                  <div className={`flex gap-2 ${isMobile ? 'mt-2' : ''}`}>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => onFiltersChange({ startDate: e.target.value })}
                      className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                      placeholder="Mulai"
                    />
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => onFiltersChange({ endDate: e.target.value })}
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
                <BarChart data={chartData}>
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
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-2">{payload[0].payload.name}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span>Pendapatan: {formatCurrency(payload[0].value as number)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                                <span>HPP (COGS): {formatCurrency(payload[1].value as number)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span>Laba: {formatCurrency(payload[2].value as number)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        revenue: 'Pendapatan',
                        cogs: 'HPP (COGS)',
                        profit: 'Laba'
                      }
                      return labels[value] || value
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
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}

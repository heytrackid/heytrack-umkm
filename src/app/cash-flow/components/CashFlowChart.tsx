import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PeriodType, ChartDataPoint } from '../constants'
import { periodOptions } from '../constants'

interface CashFlowChartProps {
  chartData: ChartDataPoint[]
  selectedPeriod: PeriodType
  onPeriodChange: (period: PeriodType) => void
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  isMobile: boolean
}

export default function CashFlowChart({
  chartData,
  selectedPeriod,
  onPeriodChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isMobile
}: CashFlowChartProps) {
  return (
    <Card>
      {chartData.length === 0 ? (
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Belum Ada Data untuk Grafik</p>
            <p className="text-sm">Grafik akan muncul setelah ada transaksi di periode yang dipilih</p>
          </div>
        </CardContent>
      ) : (
        <>
          <CardHeader>
            <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-start justify-between'}`}>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tren Arus Kas
                </CardTitle>
                <CardDescription className="mt-1">
                  Grafik pemasukan, pengeluaran, dan arus kas bersih
                </CardDescription>
              </div>
              <div className={`flex ${isMobile ? 'flex-col w-full' : 'gap-2'} ${!isMobile && 'gap-2'}`}>
                <Select value={selectedPeriod} onValueChange={onPeriodChange}>
                  <SelectTrigger className={`${isMobile ? 'w-full' : 'w-[140px]'} h-9`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periodOptions.map(option => (
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
                      onChange={(e) => onStartDateChange(e.target.value)}
                      className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                      placeholder="Mulai"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => onEndDateChange(e.target.value)}
                      className={`h-9 ${isMobile ? 'flex-1' : 'w-[130px]'} rounded-md border border-input bg-background px-2 text-xs`}
                      placeholder="Akhir"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
                      return value.toString()
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium mb-2">{payload[0].payload.date}</p>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <span>Pemasukan: {payload[0].value ? payload[0].value.toLocaleString('id-ID') : 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                <span>Pengeluaran: {payload[1].value ? payload[1].value.toLocaleString('id-ID') : 0}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                <span>Arus Kas Bersih: {payload[2].value ? payload[2].value.toLocaleString('id-ID') : 0}</span>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => {
                      const labels: Record<string, string> = {
                        income: 'Pemasukan',
                        expense: 'Pengeluaran',
                        net: 'Arus Kas Bersih'
                      }
                      return labels[value] || value
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}

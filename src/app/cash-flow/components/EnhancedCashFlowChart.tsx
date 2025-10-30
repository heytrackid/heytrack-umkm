'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { TrendingUp, TrendingDown, BarChart3, LineChart as LineChartIcon, Download } from 'lucide-react'
import {
    LazyLineChart,
    LazyBarChart,
    LazyAreaChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ChartLegend,
    ResponsiveContainer,
    Area
} from '@/components/charts/LazyCharts'
import { useState } from 'react'
import { type PeriodType, type ChartDataPoint, periodOptions } from '@/app/cash-flow/constants'

interface EnhancedCashFlowChartProps {
    chartData: ChartDataPoint[]
    selectedPeriod: PeriodType
    onPeriodChange: (period: PeriodType) => void
    startDate: string
    endDate: string
    onStartDateChange: (date: string) => void
    onEndDateChange: (date: string) => void
    isMobile: boolean
}

type ChartType = 'line' | 'bar' | 'area'

export default function EnhancedCashFlowChart({
    chartData,
    selectedPeriod,
    onPeriodChange,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    isMobile
}: EnhancedCashFlowChartProps) {
    const [chartType, setChartType] = useState<ChartType>('line')

    // Calculate trend
    const calculateTrend = () => {
        if (chartData.length < 2) { return { direction: 'stable', percentage: 0 } }

        const recent = chartData[chartData.length - 1]
        const previous = chartData[chartData.length - 2]

        if (!recent || !previous) { return { direction: 'stable', percentage: 0 } }

        const change = recent.net - previous.net
        const percentage = previous.net !== 0 ? (change / Math.abs(previous.net)) * 100 : 0

        return {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            percentage: Math.abs(percentage)
        }
    }

    const trend = calculateTrend()

    // Calculate summary stats
    const stats = {
        totalIncome: chartData.reduce((sum, d) => sum + d.income, 0),
        totalExpense: chartData.reduce((sum, d) => sum + d.expense, 0),
        avgNet: chartData.length > 0
            ? chartData.reduce((sum, d) => sum + d.net, 0) / chartData.length
            : 0,
        highestNet: Math.max(...chartData.map(d => d.net), 0),
        lowestNet: Math.min(...chartData.map(d => d.net), 0)
    }

    const downloadChart = () => {
        // Simple CSV export of chart data
        const headers = ['Tanggal', 'Pemasukan', 'Pengeluaran', 'Net']
        const rows = chartData.map(d => [
            d.date,
            d.income.toString(),
            d.expense.toString(),
            d.net.toString()
        ])

        const csvContent = [headers, ...rows]
            .map(row => row.join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `grafik-cashflow-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const formatYAxis = (value: number) => {
        if (value >= 1000000) { return `${(value / 1000000).toFixed(1)}jt` }
        if (value >= 1000) { return `${(value / 1000).toFixed(0)}rb` }
        return value.toString()
    }

    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
        if (active && payload?.length) {
            const data = payload[0]?.payload as ChartDataPoint | undefined
            if (!data) { return null }

            return (
                <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{data.date}</p>
                    <div className="space-y-1.5 text-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                <span>Pemasukan</span>
                            </div>
                            <span className="font-semibold text-green-600">
                                Rp {data.income.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                                <span>Pengeluaran</span>
                            </div>
                            <span className="font-semibold text-red-600">
                                Rp {data.expense.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t">
                            <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full bg-blue-500" />
                                <span>Net</span>
                            </div>
                            <span className={`font-semibold ${(payload[2]?.value as number) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                Rp {payload[2]?.value ? payload[2].value.toLocaleString('id-ID') : 0}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 5, right: 5, left: 0, bottom: 5 }
        }

        const commonAxisProps = {
            xAxis: {
                dataKey: 'date',
                className: 'text-xs',
                tick: { fill: 'hsl(var(--muted-foreground))' }
            },
            yAxis: {
                className: 'text-xs',
                tick: { fill: 'hsl(var(--muted-foreground))' },
                tickFormatter: formatYAxis
            }
        }

        switch (chartType) {
            case 'bar':
                return (
                    <LazyBarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis {...commonAxisProps.xAxis} />
                        <YAxis {...commonAxisProps.yAxis} />
                        <Tooltip content={<CustomTooltip />} />
                        <ChartLegend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    income: 'Pemasukan',
                                    expense: 'Pengeluaran',
                                    net: 'Net'
                                }
                                return labels[value] || value
                            }}
                        />
                        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="net" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </LazyBarChart>
                )

            case 'area':
                return (
                    <LazyAreaChart {...commonProps}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis {...commonAxisProps.xAxis} />
                        <YAxis {...commonAxisProps.yAxis} />
                        <Tooltip content={<CustomTooltip />} />
                        <ChartLegend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    income: 'Pemasukan',
                                    expense: 'Pengeluaran',
                                    net: 'Net'
                                }
                                return labels[value] || value
                            }}
                        />
                        <Area type="monotone" dataKey="income" stroke="#22c55e" fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                        <Area type="monotone" dataKey="net" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNet)" />
                    </LazyAreaChart>
                )

            default: // line
                return (
                    <LazyLineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis {...commonAxisProps.xAxis} />
                        <YAxis {...commonAxisProps.yAxis} />
                        <Tooltip content={<CustomTooltip />} />
                        <ChartLegend
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => {
                                const labels: Record<string, string> = {
                                    income: 'Pemasukan',
                                    expense: 'Pengeluaran',
                                    net: 'Net'
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
                    </LazyLineChart>
                )
        }
    }

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
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Tren Arus Kas
                                    </CardTitle>
                                    {trend.direction !== 'stable' && (
                                        <Badge variant={trend.direction === 'up' ? 'default' : 'destructive'} className="gap-1">
                                            {trend.direction === 'up' ? (
                                                <TrendingUp className="h-3 w-3" />
                                            ) : (
                                                <TrendingDown className="h-3 w-3" />
                                            )}
                                            {trend.percentage.toFixed(1)}%
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription>
                                    Visualisasi pemasukan, pengeluaran, dan arus kas bersih
                                </CardDescription>
                            </div>

                            <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'gap-2'}`}>
                                {/* Chart Type Selector */}
                                <div className="flex gap-1 border rounded-lg p-1">
                                    <Button
                                        variant={chartType === 'line' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartType('line')}
                                        className="h-8 px-2"
                                    >
                                        <LineChartIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={chartType === 'bar' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartType('bar')}
                                        className="h-8 px-2"
                                    >
                                        <BarChart3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={chartType === 'area' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setChartType('area')}
                                        className="h-8 px-2"
                                    >
                                        <TrendingUp className="h-4 w-4" />
                                    </Button>
                                </div>

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

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadChart}
                                    className="h-9"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {renderChart()}
                            </ResponsiveContainer>
                        </div>

                        {/* Stats Summary */}
                        <div className="mt-6 pt-4 border-t">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Rata-rata Net</p>
                                    <p className={`text-sm font-semibold ${stats.avgNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        Rp {stats.avgNet.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Net Tertinggi</p>
                                    <p className="text-sm font-semibold text-green-600">
                                        Rp {stats.highestNet.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Net Terendah</p>
                                    <p className="text-sm font-semibold text-red-600">
                                        Rp {stats.lowestNet.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Saldo Akhir</p>
                                    <p className={`text-sm font-semibold ${(chartData[chartData.length - 1]?.net || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        Rp {(chartData[chartData.length - 1]?.net || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    )
}

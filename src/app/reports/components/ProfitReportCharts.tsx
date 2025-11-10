// Simplified chart components for Profit Report
'use client'

import React, { Suspense } from 'react'
import { type PieLabelRenderProps } from 'recharts'
import {
  LazyLineChart,
  LazyBarChart,
  LazyAreaChart,
  LazyPieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ChartLegend,
  Line,
  Bar,
  Area,
  Pie,
  Cell
} from '@/components/charts/LazyCharts'

import { useCurrency } from '@/hooks/useCurrency'

import type { ChartType, ChartDataPoint, SelectedDataPoint } from '@/app/reports/components/ProfitReportTypes'

interface ProfitChartProps {
    data: ChartDataPoint[]
    chartType: ChartType
    onDataPointSelect?: (dataPoint: SelectedDataPoint) => void
    selectedDataPoint?: SelectedDataPoint | null
}

// Simplified profit chart component
export const ProfitChart: React.FC<ProfitChartProps> = ({
    data,
    chartType,
    onDataPointSelect: _onDataPointSelect,
    selectedDataPoint: _selectedDataPoint
}) => {
    const { formatCurrency } = useCurrency()

    if (data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground border rounded-lg">
                No data available
            </div>
        )
    }

    const renderChart = () => {
        const tooltipFormatter = (value: number | string) => {
            const numValue = typeof value === 'string' ? parseFloat(value) : value
            return formatCurrency(numValue) as unknown as string
        }

        switch (chartType) {
            case 'line':
                return (
                    <LazyLineChart data={data} width={800} height={350}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                        <Tooltip formatter={(v) => String(formatCurrency(Number(v as number | string)))} />
                        <ChartLegend />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            name="Revenue"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="cogs"
                            stroke="#f59e0b"
                            name="COGS"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="gross_profit"
                            stroke="#10b981"
                            name="Gross Profit"
                            strokeWidth={3}
                        />
                    </LazyLineChart>
                )

            case 'bar':
                return (
                    <LazyBarChart data={data} width={800} height={350}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                        <Tooltip formatter={(v) => String(formatCurrency(Number(v as number | string)))} />
                        <ChartLegend />
                        <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                        <Bar dataKey="cogs" fill="#f59e0b" name="COGS" />
                        <Bar dataKey="gross_profit" fill="#10b981" name="Gross Profit" />
                    </LazyBarChart>
                )

            case 'area':
                return (
                    <LazyAreaChart data={data} width={800} height={350}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                        <Tooltip formatter={(v) => tooltipFormatter(v as number | string)} />
                        <ChartLegend />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stackId="1"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.6}
                            name="Revenue"
                        />
                        <Area
                            type="monotone"
                            dataKey="cogs"
                            stackId="2"
                            stroke="#f59e0b"
                            fill="#f59e0b"
                            fillOpacity={0.6}
                            name="COGS"
                        />
                        <Area
                            type="monotone"
                            dataKey="gross_profit"
                            stackId="3"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.8}
                            name="Gross Profit"
                        />
                    </LazyAreaChart>
                )

            default:
                return null
        }
    }

    return (
        <div className="w-full h-[350px]">
            <Suspense fallback={
                <div className="h-[350px] flex items-center justify-center text-muted-foreground border rounded-lg">
                    Loading chart...
                </div>
            }>
                {renderChart()}
            </Suspense>
        </div>
    )
}

// Pie chart for expenses breakdown
interface ExpensesPieChartProps {
    data: Array<{ category: string; total: number; percentage: number }>
}

export const ExpensesPieChart: React.FC<ExpensesPieChartProps> = ({ data }) => {
    const { formatCurrency } = useCurrency()
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg">
                No expense data available
            </div>
        )
    }

    return (
        <div className="w-full h-[300px]">
            <Suspense fallback={
                <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg">
                    Loading pie chart...
                </div>
            }>
                <LazyPieChart width={400} height={300}>
                    <Pie
                        data={data}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                         label={(props: PieLabelRenderProps) => {
                             const _data = props['payload'] as { category: string; total: number; percentage: number }
                             return `${_data.category}: ${_data.percentage.toFixed(1)}%`
                           }}
                     >
                         {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [formatCurrency(Number(value as number)), String(name)]} />
                </LazyPieChart>
            </Suspense>
        </div>
    )
}

// Comparison chart component
interface ComparisonChartProps {
    currentData: ChartDataPoint[]
    previousData?: ChartDataPoint[] | null
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ currentData, previousData }) => {
    const { formatCurrency } = useCurrency()

    if (!previousData) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg">
                Enable &#34;Compare Periods&#34; to see comparison with previous period
            </div>
        )
    }

    return (
        <div className="w-full h-[300px]">
            <Suspense fallback={
                <div className="h-[300px] flex items-center justify-center text-muted-foreground border rounded-lg">
                    Loading comparison chart...
                </div>
            }>
                <LazyBarChart data={currentData} width={800} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value))} />
                    <Tooltip
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label: string) => `Current Period: ${label}`}
                    />
                    <ChartLegend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Current Revenue" />
                    <Bar dataKey="cogs" fill="#f59e0b" name="Current COGS" />
                    <Bar dataKey="gross_profit" fill="#10b981" name="Current Gross Profit" />
                </LazyBarChart>
            </Suspense>
        </div>
    )
}

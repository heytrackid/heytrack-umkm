'use client'

import { DollarSign, PiggyBank, TrendingDown, TrendingUp } from '@/components/icons'
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from 'date-fns'
import { id } from 'date-fns/locale'
import { memo, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChartComponent, PieChartComponent, type ChartConfig } from '@/components/ui/charts'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { useCurrency } from '@/hooks/useCurrency'
import { useFinancialRecords } from '@/hooks/useFinancialRecords'

// Financial Report Component
// Handles financial data filtering, calculations, and display

interface FinancialReportProps {
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
}

const FinancialReportComponent = ({ dateRange: externalDateRange, onDateRangeChange }: FinancialReportProps = {}) => {
  const { formatCurrency } = useCurrency()
  const { data: financialRecords } = useFinancialRecords()
  
  const defaultRange: DateRange = {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  }
  
  const [internalDateRange, setInternalDateRange] = useState<DateRange>(defaultRange)
  
  const dateRange = externalDateRange ?? internalDateRange
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (onDateRangeChange) {
      onDateRangeChange(range)
    } else {
      setInternalDateRange(range ?? defaultRange)
    }
  }

  // Memoize filtered financial data with date range filter
  const financialData = useMemo(() => {
    if (!financialRecords) return []
    if (!Array.isArray(financialRecords)) {
      return []
    }
    return financialRecords.filter((record) => {
      if (!record.date) return false
      
      if (dateRange?.from && dateRange?.to) {
        try {
          const recordDate = parseISO(record.date)
          return isWithinInterval(recordDate, { start: dateRange.from, end: dateRange.to })
        } catch {
          return true
        }
      }
      return true
    })
  }, [financialRecords, dateRange])

  // Memoize all financial calculations
  const financialMetrics = useMemo(() => {
    const financialStats = financialData.reduce(
      (stats: { totalIncome: number; totalExpense: number }, record) => {
        if (record['type'] === 'INCOME') {
          stats.totalIncome += record.amount
        }
        if (record['type'] === 'EXPENSE') {
          stats.totalExpense += record.amount
        }
        return stats
      },
      { totalIncome: 0, totalExpense: 0 }
    )

    // Since date filtering is removed, no previous period comparison
    const previousStats = { totalIncome: 0, totalExpense: 0 }

    const netProfit = financialStats.totalIncome - financialStats.totalExpense
    const profitMargin = financialStats.totalIncome > 0
      ? (netProfit / financialStats.totalIncome) * 100
      : 0

    // Calculate growth percentages from previous period data
    const incomeGrowth = previousStats.totalIncome > 0
      ? Math.round(((financialStats.totalIncome - previousStats.totalIncome) / previousStats.totalIncome) * 100)
      : 0
    const expenseGrowth = previousStats.totalExpense > 0
      ? Math.round(((financialStats.totalExpense - previousStats.totalExpense) / previousStats.totalExpense) * 100)
      : 0
    const previousProfit = previousStats.totalIncome - previousStats.totalExpense
    const currentProfit = netProfit
    const profitGrowth = previousProfit > 0
      ? Math.round(((currentProfit - previousProfit) / previousProfit) * 100)
      : 0

    return {
      financialStats,
      netProfit,
      profitMargin,
      incomeGrowth,
      expenseGrowth,
      profitGrowth
    }
  }, [financialData])

  const { financialStats, netProfit, profitMargin, incomeGrowth, expenseGrowth, profitGrowth } = financialMetrics

  // Chart data for trends
  const trendChartData = useMemo(() => {
    const dailyData: Record<string, { date: string; income: number; expense: number }> = {}
    
    financialData.forEach((record) => {
      if (!record.date) return
      const dateKey = format(parseISO(record.date), 'dd MMM', { locale: id })
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, income: 0, expense: 0 }
      }
      
      if (record.type === 'INCOME') {
        dailyData[dateKey]!.income += record.amount
      } else {
        dailyData[dateKey]!.expense += record.amount
      }
    })
    
    return Object.values(dailyData)
  }, [financialData])

  // Pie chart data for breakdown
  const pieChartData = useMemo(() => [
    { name: 'Pemasukan', value: financialStats.totalIncome },
    { name: 'Pengeluaran', value: financialStats.totalExpense },
  ], [financialStats])

  const chartConfig: ChartConfig = {
    income: { label: 'Pemasukan', color: 'hsl(142, 76%, 36%)' },
    expense: { label: 'Pengeluaran', color: 'hsl(0, 84%, 60%)' },
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold">Laporan Keuangan</h3>
        <DateRangePicker
          value={dateRange}
          onChange={handleDateRangeChange}
          placeholder="Pilih periode"
          className="w-full sm:w-auto"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-2 grid-cols-1 lg:grid-cols-4">
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemasukan
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {formatCurrency(financialStats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">+{incomeGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pengeluaran
            </CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialStats.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">+{expenseGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Laba Bersih
            </CardTitle>
            <PiggyBank className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">+{profitGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card className="hover: ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margin Laba
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Rasio laba terhadap pemasukan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {trendChartData.length > 0 && (
        <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-2">
          <AreaChartComponent
            data={trendChartData}
            title="Tren Keuangan"
            description="Pemasukan vs Pengeluaran harian"
            dataKey={['income', 'expense']}
            xAxisKey="date"
            config={chartConfig}
            height={280}
            showLegend
          />
          
          <PieChartComponent
            data={pieChartData}
            title="Komposisi Keuangan"
            description="Perbandingan pemasukan dan pengeluaran"
            dataKey="value"
            nameKey="name"
            config={{
              Pemasukan: { label: 'Pemasukan', color: 'hsl(142, 76%, 36%)' },
              Pengeluaran: { label: 'Pengeluaran', color: 'hsl(0, 84%, 60%)' },
            }}
            height={280}
            donut
            showLegend
          />
        </div>
      )}

      {/* Financial Breakdown */}
      <div className="grid grid-cols-1 gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Pemasukan</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(financialStats.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Pengeluaran</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(financialStats.totalExpense)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <PiggyBank className="h-5 w-5 text-blue-500" />
                  <span className="font-bold">Laba Bersih</span>
                </div>
                <span className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analisis Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm sm:text-base">Pengeluaran terhadap Pemasukan</span>
                <span className="font-medium">
                  {((financialStats.totalExpense / (financialStats.totalIncome || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                 <div
                   className="bg-red-600 h-2.5 rounded-full transition-all"
                   style={{
                     width: `${Math.min(100, (financialStats.totalExpense / (financialStats.totalIncome || 1)) * 100)}%`
                   }}
                 />
              </div>
              
              <div className="flex justify-between mt-4">
                <span className="text-sm sm:text-base">Margin Keuntungan</span>
                <span className="font-medium">{profitMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                 <div
                   className="bg-green-600 h-2.5 rounded-full transition-all"
                   style={{
                     width: `${Math.min(100, Math.max(0, profitMargin))}%`
                   }}
                 />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <p className="text-sm">
                  {netProfit >= 0 
                    ? 'Bisnis Anda menghasilkan laba pada periode ini. Pertahankan kinerja keuangan yang baik.'
                    : 'Bisnis Anda mengalami kerugian pada periode ini. Evaluasi pengeluaran dan tingkatkan pemasukan.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Memoized export for performance
export const FinancialReport = memo(FinancialReportComponent)
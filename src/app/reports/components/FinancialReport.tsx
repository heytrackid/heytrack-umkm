import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from '@/components/icons'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSupabaseCRUD } from '@/hooks/supabase/index'
import { useCurrency } from '@/hooks/useCurrency'

import type { Row } from '@/types/database'

// Financial Report Component
// Handles financial data filtering, calculations, and display


type FinancialRecord = Row<'financial_records'>

interface FinancialReportProps {
  dateRange: {
    start: string | undefined
    end: string | undefined
  }
}

export const FinancialReport = ({ dateRange }: FinancialReportProps) => {
  const { formatCurrency } = useCurrency()
  const { data: financialRecords } = useSupabaseCRUD<'financial_records'>('financial_records')

  // Calculate financial report
  const financialData = (financialRecords ?? []).filter((record): record is FinancialRecord & { date: string } => {
    if (!record.date) { return false }
    const recordDate = new Date(record.date).toISOString().split('T')[0] as string
    return recordDate >= (dateRange.start ?? '') && recordDate <= (dateRange.end ?? '')
  })

  const financialStats = financialData.reduce<{ totalIncome: number; totalExpense: number }>(
    (stats, record) => {
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

  // Calculate previous period stats
  const previousFinancialData = (financialRecords ?? []).filter((record): record is FinancialRecord & { date: string } => {
    if (!record.date || !dateRange.start || !dateRange.end) { return false }
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousEnd = new Date(startDate.getTime() - 1)
    const previousStart = new Date(previousEnd.getTime() - periodLength)
    const recordDate = new Date(record.date).toISOString().split('T')[0] as string
    return recordDate >= previousStart.toISOString().split('T')[0] && recordDate <= previousEnd.toISOString().split('T')[0]
  })

  const previousStats = previousFinancialData.reduce<{ totalIncome: number; totalExpense: number }>(
    (stats, record) => {
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Financial Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-0 ">
          <CardHeader>
            <CardTitle>Ringkasan Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Pemasukan</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(financialStats.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Pengeluaran</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(financialStats.totalExpense)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2">
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

        <Card className="border-0 ">
          <CardHeader>
            <CardTitle>Analisis Keuangan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Pengeluaran terhadap Pemasukan</span>
                <span className="font-medium">
                  {((financialStats.totalExpense / (financialStats.totalIncome || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                 <div
                   className="bg-red-600 h-2.5 rounded-full"
                   style={{
                     width: `${Math.min(100, (financialStats.totalExpense / (financialStats.totalIncome || 1)) * 100)}%`
                   }}
                 />
              </div>
              
              <div className="flex justify-between mt-4">
                <span>Margin Keuntungan</span>
                <span className="font-medium">{profitMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                 <div
                   className="bg-green-600 h-2.5 rounded-full"
                   style={{
                     width: `${Math.min(100, profitMargin)}%`
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
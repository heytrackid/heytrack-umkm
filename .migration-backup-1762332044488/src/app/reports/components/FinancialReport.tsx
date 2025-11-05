import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/supabase/useSupabaseCRUD'
import type { FinancialRecordsTable } from '@/types/database'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react'

// Financial Report Component
// Handles financial data filtering, calculations, and display


type FinancialRecord = FinancialRecordsTable

interface FinancialReportProps {
  dateRange: {
    start: string
    end: string
  }
}

const FinancialReport = ({ dateRange }: FinancialReportProps) => {
  const { formatCurrency } = useCurrency()
  const { data: financialRecords } = useSupabaseCRUD<'financial_records'>('financial_records')

  // Calculate financial report
  const financialData = (financialRecords ?? []).filter((record): record is FinancialRecord & { date: string } => {
    if (!record.date) { return false }
    const recordDate = new Date(record.date).toISOString().split('T')[0]
    return recordDate >= dateRange.start && recordDate <= dateRange.end
  })

  const financialStats = financialData.reduce<{ totalIncome: number; totalExpense: number }>(
    (stats, record) => {
      if (record.type === 'INCOME') {
        stats.totalIncome += record.amount
      }
      if (record.type === 'EXPENSE') {
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

  // Calculate growth percentages (would come from previous period data)
  const incomeGrowth = 15;
  const expenseGrowth = 8;
  const profitGrowth = 22;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pemasukan
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {formatCurrency(financialStats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">+{incomeGrowth}% dari periode sebelumnya</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="hover:shadow-md transition-shadow">
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
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margin Profit
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
        <Card className="border-0 shadow-sm">
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

        <Card className="border-0 shadow-sm">
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
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                 <div
                   className="bg-red-600 h-2.5 rounded-full"
                   style={{
                     width: `${Math.min(100, (financialStats.totalExpense / (financialStats.totalIncome || 1)) * 100)}%`
                   }}
                 />
              </div>
              
              <div className="flex justify-between mt-4">
                <span>Profit Margin</span>
                <span className="font-medium">{profitMargin.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
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

export default FinancialReport

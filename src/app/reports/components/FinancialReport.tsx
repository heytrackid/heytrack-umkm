// Financial Report Component
// Handles financial data filtering, calculations, and display

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/supabase/useSupabaseCRUD'
import type { Tables } from '@/types/supabase-generated'

interface FinancialReportProps {
  dateRange: {
    start: string
    end: string
  }
}

type FinancialRecord = Tables<'financial_records'>

export default function FinancialReport({ dateRange }: FinancialReportProps) {
  const { formatCurrency } = useCurrency()
  const { data: financialRecords } = useSupabaseCRUD<'financial_records'>('financial_records')

  // Calculate financial report
  const financialData = (financialRecords ?? []).filter((record): record is FinancialRecord & { date: string } => {
    if (!record.date) {return false}
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

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(financialStats.totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(financialStats.totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laba Bersih
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(netProfit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margin Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

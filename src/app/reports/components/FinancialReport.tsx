// Financial Report Component
// Handles financial data filtering, calculations, and display

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrency } from '@/hooks/useCurrency'
import { useSupabaseCRUD } from '@/hooks/useSupabase'

interface FinancialReportProps {
  dateRange: {
    start: string
    end: string
  }
}

export default function FinancialReport({ dateRange }: FinancialReportProps) {
  const { formatCurrency } = useCurrency()
  const { data: financialRecords } = useSupabaseCRUD('financial_records')

  // Calculate financial report
  const financialData = financialRecords?.filter((record: any) => {
    const recordDate = new Date(record.date).toISOString().split('T')[0]
    return recordDate >= dateRange.start && recordDate <= dateRange.end
  }) || []

  const financialStats = {
    totalIncome: financialData.filter((r: any) => r.type === 'INCOME').reduce((sum: number, r: any) => sum + r.amount, 0),
    totalExpense: financialData.filter((r: any) => r.type === 'EXPENSE').reduce((sum: number, r: any) => sum + r.amount, 0),
    netProfit: 0,
    profitMargin: 0
  }
  financialStats.netProfit = financialStats.totalIncome - financialStats.totalExpense
  financialStats.profitMargin = financialStats.totalIncome > 0
    ? (financialStats.netProfit / financialStats.totalIncome) * 100
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
            <p className={`text-2xl font-bold ${financialStats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(financialStats.netProfit)}
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
              {financialStats.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

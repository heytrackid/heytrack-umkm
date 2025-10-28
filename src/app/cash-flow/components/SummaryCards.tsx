import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CashFlowSummary } from '../constants'

interface SummaryCardsProps {
  summary: CashFlowSummary | null
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export default function SummaryCards({ summary, formatCurrency, isMobile }: SummaryCardsProps) {
  if (!summary) { return null }

  // Mock comparison data - in real app, fetch from previous period
  const mockComparison = {
    income: 12, // +12%
    expense: -8, // -8%
    net: 25 // +25%
  }

  const scrollToTransactions = () => {
    const element = document.getElementById('transaction-list')
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
      {/* Total Income */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Total Pemasukan
            </span>
            {mockComparison.income > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{mockComparison.income}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600 mb-2">
            {formatCurrency(summary.total_income)}
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={scrollToTransactions}
          >
            Lihat detail transaksi →
          </Button>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ArrowDownCircle className="h-4 w-4" />
              Total Pengeluaran
            </span>
            {mockComparison.expense < 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <TrendingDown className="h-3 w-3 mr-1" />
                {mockComparison.expense}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600 mb-2">
            {formatCurrency(summary.total_expenses)}
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={scrollToTransactions}
          >
            Lihat detail transaksi →
          </Button>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Arus Kas Bersih
            </span>
            {mockComparison.net > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{mockComparison.net}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${summary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
            {formatCurrency(summary.net_cash_flow)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {summary.net_cash_flow >= 0 ? 'Surplus' : 'Defisit'} periode ini
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

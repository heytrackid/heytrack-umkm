import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import type { CashFlowSummary } from '../constants'

interface SummaryCardsProps {
  summary: CashFlowSummary | null
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export default function SummaryCards({ summary, formatCurrency, isMobile }: SummaryCardsProps) {
  if (!summary) {return null}

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
      {/* Total Income */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Total Pemasukan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.total_income)}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <ArrowDownCircle className="h-4 w-4" />
            Total Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.total_expenses)}
          </p>
        </CardContent>
      </Card>

      {/* Net Cash Flow */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Arus Kas Bersih
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${
            summary.net_cash_flow >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(summary.net_cash_flow)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

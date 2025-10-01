import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { ProfitSummary } from '../constants'

interface ProfitBreakdownProps {
  summary: ProfitSummary | null
  formatCurrency: (amount: number) => string
}

export function ProfitBreakdown({ summary, formatCurrency }: ProfitBreakdownProps) {
  if (!summary) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Laba Rugi</CardTitle>
        <CardDescription>
          Perhitungan laba dengan metode WAC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="font-medium">Total Pendapatan</span>
            <span className="font-semibold text-blue-600">
              {formatCurrency(summary.total_revenue)}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Harga Pokok Penjualan (WAC)</span>
            <span className="font-semibold text-orange-600">
              - {formatCurrency(summary.total_cogs)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-t">
            <span className="font-semibold">Laba Kotor</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(summary.gross_profit)} ({summary.gross_profit_margin.toFixed(1)}%)
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Biaya Operasional</span>
            <span className="font-semibold text-red-600">
              - {formatCurrency(summary.total_operating_expenses)}
            </span>
          </div>
          <div className="flex justify-between py-3 border-t-2 border-primary">
            <span className="text-lg font-bold">Laba Bersih</span>
            <span className={`text-xl font-bold ${
              summary.net_profit >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(summary.net_profit)} ({summary.net_profit_margin.toFixed(1)}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

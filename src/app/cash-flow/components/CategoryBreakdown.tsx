import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CashFlowSummary } from '../constants'

interface CategoryBreakdownProps {
  summary: CashFlowSummary | null
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

export default function CategoryBreakdown({ summary, formatCurrency, isMobile }: CategoryBreakdownProps) {
  if (!summary) {return null}

  const hasIncomeData = Object.keys(summary.income_by_category || {}).length > 0
  const hasExpenseData = Object.keys(summary.expenses_by_category || {}).length > 0

  if (!hasIncomeData && !hasExpenseData) {
    return null
  }

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {/* Income by Category */}
      {hasIncomeData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pemasukan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.income_by_category).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Category */}
      {hasExpenseData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.expenses_by_category).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

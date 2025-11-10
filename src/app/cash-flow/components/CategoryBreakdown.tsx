import { Settings, AlertTriangle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { CashFlowSummary } from '@/app/cash-flow/constants'

interface CategoryBreakdownProps {
  summary: CashFlowSummary | null
  formatCurrency: (amount: number) => string
  isMobile: boolean
}

// Color palette for categories (consistent with charts)
const categoryColors = [
  'bg-gray-500',
  'bg-gray-500',
  'bg-yellow-500',
  'bg-gray-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-teal-500'
]

const CategoryBreakdown = ({ summary, formatCurrency, isMobile }: CategoryBreakdownProps): JSX.Element | null => {
  if (!summary) { return null }

  const hasIncomeData = Object.keys(summary.income_by_category || {}).length > 0
  const hasExpenseData = Object.keys(summary.expenses_by_category || {}).length > 0

  if (!hasIncomeData && !hasExpenseData) {
    return null
  }

  // Calculate percentages for expenses
  const expenseEntries = Object.entries(summary.expenses_by_category).map(([category, amount], index) => ({
    category,
    amount,
    percentage: (amount / summary.total_expenses) * 100,
    color: categoryColors[index % categoryColors.length]
  })).sort((a, b) => b.amount - a.amount)

  // Find highest expense category
  const highestExpense = expenseEntries[0]
  const hasHighExpenseWarning = highestExpense && highestExpense.percentage > 50

  return (
    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {/* Income by Category */}
      {hasIncomeData && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Pemasukan per Kategori</CardTitle>
                <CardDescription className="mt-1">
                  Sumber pendapatan bisnis
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(summary.income_by_category)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount], index) => {
                  const percentage = (amount / summary.total_income) * 100
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${categoryColors[index % categoryColors.length]}`} />
                          <span>{category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {percentage.toFixed(0)}%
                          </Badge>
                          <span className="font-semibold text-gray-600">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses by Category */}
      {hasExpenseData && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
                <CardDescription className="mt-1">
                  Alokasi biaya operasional
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Kelola
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expenseEntries.map(({ category, amount, percentage, color }) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${color}`} />
                      <span>{category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {percentage.toFixed(0)}%
                      </Badge>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(amount)}
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))}
            </div>

            {/* Insight Alert */}
            {hasHighExpenseWarning && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Pengeluaran {highestExpense.category} mencapai {highestExpense.percentage.toFixed(0)}% dari total
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      Pertimbangkan untuk melakukan audit atau mencari cara mengoptimalkan biaya ini
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export { CategoryBreakdown }
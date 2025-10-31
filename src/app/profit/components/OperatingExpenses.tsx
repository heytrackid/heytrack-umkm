import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Receipt } from 'lucide-react'
import type { ProfitData } from './types'

interface OperatingExpensesProps {
  operating_expenses: ProfitData['operating_expenses']
  summary: ProfitData['summary']
  formatCurrency: (amount: number) => string
}

export const OperatingExpenses = ({
  operating_expenses,
  summary,
  formatCurrency
}: OperatingExpensesProps) => (
    <Card>
      <CardHeader>
        <CardTitle>Biaya Operasional</CardTitle>
        <CardDescription>
          Rincian pengeluaran operasional periode ini
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(operating_expenses || []).map((expense, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-medium">{expense.category}</span>
              </div>
              <span className="text-lg font-semibold text-red-600">
                {formatCurrency(expense.total_amount)}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 border-t-2 font-bold">
            <span>Total Biaya Operasional</span>
            <span className="text-lg text-red-600">
              {formatCurrency(summary.total_operating_expenses)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

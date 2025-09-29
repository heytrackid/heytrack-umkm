'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuickAnalyticsProps {
  incomeCategories: string[]
  expenseCategories: string[]
  transactions: any[]
  isMobile: boolean
}

/**
 * Quick analytics component showing income and expense breakdowns
 */
export function QuickAnalytics({ incomeCategories, expenseCategories, transactions, isMobile }: QuickAnalyticsProps) {
  return (
    <div className={`grid gap-6 ${
      isMobile ? 'grid-cols-1' : 'md:grid-cols-3'
    }`}>
      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-sm' : 'text-sm'}>
            Breakdown Pemasukan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incomeCategories.map(category => {
              const amount = transactions
                .filter(t => t.type === 'INCOME' && t.category === category)
                .reduce((sum, t) => sum + t.amount, 0)
              const totalIncome = transactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + t.amount, 0)
              const percentage = totalIncome > 0 ? (amount / totalIncome * 100) : 0

              return (
                <div key={category} className={`flex justify-between ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span>{category}</span>
                  <div className="text-right">
                    <div className="font-medium">Rp {amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-sm' : 'text-sm'}>
            Breakdown Pengeluaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenseCategories.slice(0, 4).map(category => {
              const amount = transactions
                .filter(t => t.type === 'EXPENSE' && t.category === category)
                .reduce((sum, t) => sum + t.amount, 0)
              const totalExpense = transactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + t.amount, 0)
              const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0

              return (
                <div key={category} className={`flex justify-between ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span>{category}</span>
                  <div className="text-right">
                    <div className="font-medium">Rp {amount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className={isMobile ? 'text-sm' : 'text-sm'}>
            Metode Pembayaran
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DIGITAL_WALLET'].map(method => {
              const count = transactions.filter(t => t.paymentMethod === method).length
              const amount = transactions
                .filter(t => t.paymentMethod === method)
                .reduce((sum, t) => t.type === 'INCOME' ? sum + t.amount : sum - t.amount, 0)

              return (
                <div key={method} className={`flex justify-between ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <span>{method === 'CASH' ? 'Tunai' :
                          method === 'BANK_TRANSFER' ? 'Transfer Bank' :
                          method === 'CREDIT_CARD' ? 'Kartu Kredit' : 'E-Wallet'}</span>
                  <div className="text-right">
                    <div className="font-medium">{count}x</div>
                    <div className="text-xs text-muted-foreground">
                      Rp {Math.abs(amount).toLocaleString()}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

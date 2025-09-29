'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MiniChart } from '@/components/ui/mobile-charts'
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'

interface FinancialSummaryCardsProps {
  stats: {
    totalIncome: number
    totalExpense: number
    netProfit: number
    profitMargin: number
    totalTransactions: number
  }
  isMobile: boolean
  transactions: any[]
}

/**
 * Financial summary cards component showing key metrics
 */
export function FinancialSummaryCards({ stats, isMobile, transactions }: FinancialSummaryCardsProps) {
  return (
    <div className={`grid gap-4 ${
      isMobile ? 'grid-cols-2' : 'md:grid-cols-4'
    }`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`font-medium ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>Total Pemasukan</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className={`font-bold text-gray-600 dark:text-gray-400 ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>
            Rp {stats.totalIncome.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">bulan ini</p>
          <MiniChart
            data={transactions.filter(t => t.type === 'INCOME').slice(-7).map((transaction, index) => ({
              day: index + 1,
              amount: transaction.amount
            }))}
            type="area"
            dataKey="amount"
            color="#16a34a"
            className="mt-2"
            height={30}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`font-medium ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>Total Pengeluaran</CardTitle>
          <TrendingDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className={`font-bold text-gray-600 dark:text-gray-400 ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>
            Rp {stats.totalExpense.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">bulan ini</p>
          <MiniChart
            data={transactions.filter(t => t.type === 'EXPENSE').slice(-7).map((transaction, index) => ({
              day: index + 1,
              amount: transaction.amount
            }))}
            type="area"
            dataKey="amount"
            color="#dc2626"
            className="mt-2"
            height={30}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`font-medium ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>Keuntungan Bersih</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className={`font-bold ${stats.netProfit >= 0 ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'} ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>
            Rp {stats.netProfit.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Margin: {stats.profitMargin.toFixed(1)}%
          </p>
          <MiniChart
            data={transactions.slice(-7).map((_, index) => ({
              day: index + 1,
              profit: Math.random() * 1000000 + 500000 // Mock profit trend
            }))}
            type="line"
            dataKey="profit"
            color={stats.netProfit >= 0 ? '#16a34a' : '#dc2626'}
            className="mt-2"
            height={30}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={`font-medium ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>Transaksi</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`font-bold ${
            isMobile ? 'text-xl' : 'text-2xl'
          }`}>{stats.totalTransactions}</div>
          <p className="text-xs text-muted-foreground">total transaksi</p>
          <MiniChart
            data={Array.from({ length: 7 }, (_, index) => ({
              day: index + 1,
              count: Math.floor(Math.random() * 5) + 1
            }))}
            type="bar"
            dataKey="count"
            color="#6b7280"
            className="mt-2"
            height={30}
          />
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

interface CashFlowData {
  totalIncome: number
  totalExpense: number
  netCashFlow: number
  transactions: Array<{
    id: string
    type: 'income' | 'expense'
    description: string
    category: string
    amount: number
    date: string
  }>
}

interface CashFlowOverviewProps {
  data: CashFlowData
  formatCurrency: (amount: number) => string
  isMobile?: boolean
}

/**
 * Cash Flow Overview Component
 * Extracted from cash-flow/page.tsx for code splitting
 */
export default function CashFlowOverview({
  data,
  formatCurrency,
  isMobile = false
}: CashFlowOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'md:grid-cols-3'}`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dari penjualan dan pendapatan lain
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Biaya operasional dan pembelian
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Arus Kas Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(Math.abs(data.netCashFlow))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.netCashFlow >= 0 ? 'Surplus' : 'Defisit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {data.transactions.length > 0 ? (
            <div className="space-y-4">
              {data.transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={transaction.type === 'income' ? 'default' : 'destructive'}
                      >
                        {transaction.type === 'income' ? 'Masuk' : 'Keluar'}
                      </Badge>
                      <span className="font-medium">{transaction.description}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {transaction.category} • {transaction.date}
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Belum ada transaksi</p>
              <p className="text-sm">Tambahkan transaksi pertama Anda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

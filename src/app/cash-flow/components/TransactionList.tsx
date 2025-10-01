import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react'
import type { Transaction } from '../constants'

interface TransactionListProps {
  transactions: Transaction[]
  onDeleteTransaction: (transaction: Transaction) => void
  formatCurrency: (amount: number) => string
  loading: boolean
}

export default function TransactionList({
  transactions,
  onDeleteTransaction,
  formatCurrency,
  loading
}: TransactionListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Transaksi</CardTitle>
        <CardDescription>
          Semua transaksi pemasukan dan pengeluaran
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada transaksi di periode ini</p>
            <p className="text-sm mt-2">Klik "Tambah Transaksi" untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction, index) => (
              <div
                key={`${transaction.id}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900'
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description}</p>
                    <div className="flex gap-2 items-center text-xs text-muted-foreground">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`text-lg font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  {transaction.type === 'expense' && transaction.reference_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTransaction(transaction)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

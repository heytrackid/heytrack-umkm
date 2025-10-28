import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, ArrowUpCircle, ArrowDownCircle, Trash2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Transaction } from '../constants'

interface TransactionListProps {
  transactions: Transaction[]
  onDeleteTransaction: (transaction: Transaction) => void
  formatCurrency: (amount: number) => string
  loading: boolean
}

type FilterType = 'all' | 'income' | 'expense'

export default function TransactionList({
  transactions,
  onDeleteTransaction,
  formatCurrency,
  loading
}: TransactionListProps) {
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesSearch = searchQuery === '' ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const filterOptions = [
    { value: 'all' as FilterType, label: 'Semua', count: transactions.length },
    { value: 'income' as FilterType, label: 'Pemasukan', count: transactions.filter(t => t.type === 'income').length },
    { value: 'expense' as FilterType, label: 'Pengeluaran', count: transactions.filter(t => t.type === 'expense').length }
  ]

  return (
    <Card id="transaction-list">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Riwayat Transaksi</CardTitle>
            <CardDescription>
              Semua transaksi pemasukan dan pengeluaran
            </CardDescription>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3 pt-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <Button
                key={option.value}
                variant={filterType === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(option.value)}
                className="gap-2"
              >
                {option.label}
                <Badge variant="secondary" className="ml-1">
                  {option.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {transactions.length === 0 ? (
              <>
                <p className="font-medium mb-1">Belum ada transaksi di periode ini</p>
                <p className="text-sm">Klik "Tambah Transaksi" untuk memulai</p>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Tidak ada transaksi yang cocok</p>
                <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction, index) => (
              <div
                key={`${transaction.id}-${index}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${transaction.type === 'income'
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
                    <div className="flex gap-2 items-center text-xs text-muted-foreground flex-wrap">
                      <span>{new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>•</span>
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className={`text-base md:text-lg font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
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
                      className="flex-shrink-0"
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

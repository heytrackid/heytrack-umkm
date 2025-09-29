'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DollarSign, Trash2, Download } from 'lucide-react'
import { TransactionItem } from './TransactionItem'

interface TransactionListProps {
  transactions: any[]
  isMobile: boolean
  onViewTransaction: (transaction: any) => void
  onEditTransaction?: (transaction: any) => void
  onDeleteTransaction?: (transaction: any) => void
  onBulkAction?: (action: string, transactionIds: string[]) => void
  getPaymentMethodLabel: (method: string) => string
  transactionTypes: any[]
}

/**
 * Transaction list component displaying all transactions
 */
export function TransactionList({
  transactions,
  isMobile,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onBulkAction,
  getPaymentMethodLabel,
  transactionTypes
}: TransactionListProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map(t => t.id))
    } else {
      setSelectedTransactions([])
    }
  }

  const handleSelectTransaction = (transactionId: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, transactionId])
    } else {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId))
    }
  }

  const handleBulkAction = (action: string) => {
    if (onBulkAction && selectedTransactions.length > 0) {
      onBulkAction(action, selectedTransactions)
      setSelectedTransactions([]) // Clear selection after action
    }
  }
  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium">Tidak ada transaksi ditemukan</h3>
          <p className="text-muted-foreground">
            Coba ubah filter atau buat transaksi baru
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onView={onViewTransaction}
            onEdit={() => onEditTransaction?.(transaction)}
            onDelete={() => onDeleteTransaction?.(transaction)}
            isMobile={isMobile}
            getPaymentMethodLabel={getPaymentMethodLabel}
            transactionTypes={transactionTypes}
          />
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Bulk Actions Bar */}
        {selectedTransactions.length > 0 && (
          <div className="p-4 bg-muted/50 border-b flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedTransactions.length} transaksi dipilih
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('export')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="p-4 font-medium w-12">
                  <Checkbox
                    checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="p-4 font-medium">Tanggal</th>
                <th className="p-4 font-medium">Deskripsi</th>
                <th className="p-4 font-medium">Kategori</th>
                <th className="p-4 font-medium">Tipe</th>
                <th className="p-4 font-medium">Jumlah</th>
                <th className="p-4 font-medium">Metode</th>
                <th className="p-4 font-medium">Referensi</th>
                <th className="p-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span>{transaction.date}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span>{transaction.category}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'INCOME'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {transaction.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}Rp {transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm">{transaction.reference}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewTransaction(transaction)}
                      >
                        Lihat
                      </Button>
                      {onEditTransaction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTransaction(transaction)}
                        >
                          Edit
                        </Button>
                      )}
                      {onDeleteTransaction && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => onDeleteTransaction(transaction)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

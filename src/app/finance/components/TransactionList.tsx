'use client'

import { Card, CardContent } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'
import { TransactionItem } from './TransactionItem'

interface TransactionListProps {
  transactions: any[]
  isMobile: boolean
  onViewTransaction: (transaction: any) => void
  onEditTransaction?: (transaction: any) => void
  onDeleteTransaction?: (transaction: any) => void
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
  getPaymentMethodLabel,
  transactionTypes
}: TransactionListProps) {
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
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
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useResponsive } from '@/hooks/use-responsive'
import { useCurrency } from '@/hooks/useCurrency'

interface TransactionDetailViewProps {
  transaction: any
}

/**
 * Transaction detail view component
 */
export function TransactionDetailView({ transaction }: TransactionDetailViewProps) {
  const { isMobile } = useResponsive()
  const { formatCurrency } = useCurrency()

  const transactionTypes = [
    { value: 'INCOME', label: 'Pemasukan', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
    { value: 'EXPENSE', label: 'Pengeluaran', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' }
  ]

  const getTypeInfo = (type: string) => {
    return transactionTypes.find(t => t.value === type) || transactionTypes[0]
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: any = {
      'CASH': 'Tunai',
      'BANK_TRANSFER': 'Transfer Bank',
      'CREDIT_CARD': 'Kartu Kredit',
      'DIGITAL_WALLET': 'E-Wallet'
    }
    return methods[method] || method
  }

  const typeInfo = getTypeInfo(transaction.type)

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${
        isMobile ? 'grid-cols-1' : 'grid-cols-2'
      }`}>
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Informasi Transaksi</h3>
          <div className={`mt-2 space-y-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tanggal:</span>
              <span>{transaction.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Referensi:</span>
              <span className="font-mono break-all">{transaction.reference}</span>
            </div>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-1' : 'justify-between'
            }`}>
              <span className="text-muted-foreground">Tipe:</span>
              <Badge className={typeInfo.color}>
                {transaction.type === 'INCOME' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {typeInfo.label}
              </Badge>
            </div>
            <div className={`flex ${
              isMobile ? 'flex-col space-y-1' : 'justify-between'
            }`}>
              <span className="text-muted-foreground">Status:</span>
              <Badge variant="outline">{transaction.status}</Badge>
            </div>
          </div>
        </div>
        <div>
          <h3 className={`font-medium ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>Detail Keuangan</h3>
          <div className={`mt-2 space-y-2 ${
            isMobile ? 'text-sm' : 'text-sm'
          }`}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategori:</span>
              <span>{transaction.category}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-muted-foreground">Jumlah:</span>
              <span className={`${
                transaction.type === 'INCOME' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
              } ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode:</span>
              <span>{getPaymentMethodLabel(transaction.paymentMethod)}</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className={`font-medium ${
          isMobile ? 'text-base' : 'text-lg'
        }`}>Deskripsi</h3>
        <p className={`mt-1 text-muted-foreground ${
          isMobile ? 'text-sm' : 'text-sm'
        }`}>{transaction.description}</p>
      </div>
    </div>
  )
}
